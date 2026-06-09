require('dotenv').config({ path: '.env.local' });
const admin = require("firebase-admin");

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();

// Mini mock adapter
class MongooseDoc {
  constructor(data, id) {
    Object.assign(this, data);
    this._id = id;
    this.id = id;
  }
  toObject() { return { ...this }; }
}

async function run() {
  console.log("=== API MOCK MATCH ENGINE DIAGNOSIS ===");
  
  // Target user is "ace" (t968ADHk9yFnuV2HzEg7)
  const targetUserId = "t968ADHk9yFnuV2HzEg7";
  
  const bizSnap = await db.collection("businesses").get();
  const allBizs = bizSnap.docs.map(d => new MongooseDoc(d.data(), d.id));

  // Fetch rich offerings and intents
  const offeringsSnap = await db.collection("offerings").get();
  const offeringsMap = new Map();
  offeringsSnap.docs.forEach(d => {
    const data = d.data();
    if (data.userId && data.text) {
      offeringsMap.set(data.userId, data.text);
    }
  });

  const intentsSnap = await db.collection("intents").get();
  const intentsMap = new Map();
  intentsSnap.docs.forEach(d => {
    const data = d.data();
    if (data.userId && data.text) {
      intentsMap.set(data.userId, data.text);
    }
  });

  function enrichProfile(biz) {
    const ownerId = biz.ownerId;
    let offerings = biz.offerings || [];
    let needs = biz.needs || [];

    // Fallback offerings if they contain only generic values
    const isGenericOff = offerings.length === 0 || 
      (offerings.length === 1 && (offerings[0] === "Service" || offerings[0] === "Services"));
    if (isGenericOff) {
      const richOff = offeringsMap.get(ownerId);
      if (richOff) {
        offerings = richOff.split(",").map(s => s.trim()).filter(Boolean);
      }
    }

    // Fallback needs if they contain only generic values
    const isGenericNeed = needs.length === 0 || 
      (needs.length === 1 && (needs[0] === "Client" || needs[0] === "Clients" || needs[0] === "Customer" || needs[0] === "Customers"));
    if (isGenericNeed) {
      const richIntent = intentsMap.get(ownerId) || biz.intent?.currentGoal;
      if (richIntent) {
        needs = [richIntent];
      }
    }

    return new MongooseDoc({
      ...biz,
      offerings,
      needs
    }, biz.id);
  }
  
  const rawTargetBiz = allBizs.find(b => b.ownerId === targetUserId);
  if (!rawTargetBiz) {
    console.error("❌ Target user business profile 'ace' not found!");
    process.exit(1);
  }
  const userBiz = enrichProfile(rawTargetBiz);
  
  console.log(`Target Business: ${userBiz.companyName || userBiz.brandName}`);
  console.log(`Needs: ${JSON.stringify(userBiz.needs || [])}`);
  console.log(`Offerings: ${JSON.stringify(userBiz.offerings || [])}`);
  console.log(`Goal: "${userBiz.intent?.currentGoal || ""}"`);

  // Emulate aggregation
  const usersSnap = await db.collection("users").get();
  const allUsers = usersSnap.docs.map(d => new MongooseDoc(d.data(), d.id));
  
  console.log(`\nLoaded ${allBizs.length} businesses, ${allUsers.length} users, ${offeringsMap.size} rich offerings, and ${intentsMap.size} rich intents.`);

  const candidates = [];
  for (const rawBiz of allBizs) {
    if (rawBiz.ownerId === targetUserId) continue; // exclude self
    
    const ownerData = allUsers.find(u => u.id === rawBiz.ownerId);
    if (ownerData) {
      if (ownerData.status === "SUSPENDED") {
        continue;
      }
      const biz = enrichProfile(rawBiz);
      candidates.push({
        ...biz.toObject(),
        ownerData: ownerData.toObject()
      });
    }
  }

  console.log(`Total candidates found (excluding self + suspended): ${candidates.length}`);

  // Let's test the hard filters
  const STOP_WORDS = new Set([
    "a", "an", "the", "and", "or", "in", "on", "at", "to", "for", "with", "by",
    "of", "is", "are", "it", "we", "you", "they", "i", "not", "no", "this", "that",
    "our", "their", "your", "my", "us", "from", "as", "about"
  ]);

  function cleanAndTokenize(text) {
    const arr = Array.isArray(text) ? text : [text];
    return arr
      .join(" ")
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
  }

  function phraseSimilarity(phraseA, phraseB) {
    const pA = phraseA.toLowerCase().trim();
    const pB = phraseB.toLowerCase().trim();

    if (!pA || !pB) return 0;
    if (pA === pB) return 1.0;
    if (pA.includes(pB) || pB.includes(pA)) return 0.8;

    const tokensA = cleanAndTokenize(pA);
    const tokensB = cleanAndTokenize(pB);

    if (!tokensA.length || !tokensB.length) return 0;

    const intersection = tokensA.filter((t) => tokensB.includes(t));
    if (intersection.length === 0) return 0;

    return intersection.length / tokensA.length;
  }

  function computeNeedsMetByOfferingsScore(needs, offerings) {
    if (!needs.length || !offerings.length) return 0;

    let totalScore = 0;
    for (const need of needs) {
      let maxSim = 0;
      for (const offering of offerings) {
        const sim = phraseSimilarity(need, offering);
        if (sim > maxSim) maxSim = sim;
      }
      totalScore += maxSim;
    }

    return Math.round((totalScore / needs.length) * 100);
  }

  function computeGoalSatisfiedByOfferingsScore(goal, offerings) {
    if (!goal || !offerings.length) return 0;
    const cleanGoal = goal.toLowerCase().trim();

    let maxSim = 0;
    for (const offering of offerings) {
      const cleanOffering = offering.toLowerCase().trim();
      let sim = 0;
      if (cleanGoal.includes(cleanOffering) || cleanOffering.includes(cleanGoal)) {
        sim = 1.0;
      } else {
        const tokensOff = cleanAndTokenize(cleanOffering);
        const tokensGoal = cleanAndTokenize(cleanGoal);
        if (tokensOff.length > 0) {
          const intersection = tokensOff.filter((t) => tokensGoal.includes(t));
          sim = intersection.length / tokensOff.length;
        }
      }
      if (sim > maxSim) maxSim = sim;
    }

    return Math.round(maxSim * 100);
  }

  function isCompetitor(A, B) {
    const aOffersArr = A.offerings || [];
    const bOffersArr = B.offerings || [];

    if (aOffersArr.length === 0 || bOffersArr.length === 0) return false;

    const aInd = (A.industry || "").toLowerCase().trim();
    const bInd = (B.industry || "").toLowerCase().trim();

    const setA = new Set(aOffersArr.map((s) => s.toLowerCase().trim()));
    const setB = new Set(bOffersArr.map((s) => s.toLowerCase().trim()));
    for (const item of setA) {
      if (setB.has(item)) return true;
    }

    const tokensA = cleanAndTokenize(aOffersArr);
    const tokensB = cleanAndTokenize(bOffersArr);
    if (tokensA.length === 0 || tokensB.length === 0) return false;

    const setTokensA = new Set(tokensA);
    const setTokensB = new Set(tokensB);

    const intersection = [...setTokensA].filter((t) => setTokensB.has(t));
    if (intersection.length > 0) {
      if (aInd && bInd && aInd === bInd) return true;
      const union = new Set([...setTokensA, ...setTokensB]);
      const overlap = intersection.length / union.size;
      if (overlap > 0.20) return true;
    }
    return false;
  }

  function isValidMatch(A, B) {
    const aNeedsArr = A.needs || [];
    const aOffersArr = A.offerings || [];
    const bNeedsArr = B.needs || [];
    const bOffersArr = B.offerings || [];

    // Hard filter
    if (!aNeedsArr.length || !aOffersArr.length || !(A.intent?.currentGoal?.trim())) {
      console.log(`    ❌ filtered: Target A missing needs, offerings or goal`);
      return false;
    }
    if (!bNeedsArr.length || !bOffersArr.length || !(B.intent?.currentGoal?.trim())) {
      console.log(`    ❌ filtered: B (${B.companyName}) missing needs, offerings or goal`);
      return false;
    }

    if (isCompetitor(A, B)) {
      console.log(`    ❌ filtered: B (${B.companyName}) is competitor`);
      return false;
    }

    const aNeedsMet = computeNeedsMetByOfferingsScore(aNeedsArr, bOffersArr);
    const bNeedsMet = computeNeedsMetByOfferingsScore(bNeedsArr, aOffersArr);
    const aGoalMet = computeGoalSatisfiedByOfferingsScore(A.intent.currentGoal, bOffersArr);

    if (aNeedsMet === 0 && bNeedsMet === 0 && aGoalMet === 0) {
      console.log(`    ❌ filtered: B (${B.companyName}) has zero directional synergy (aNeedsMet=${aNeedsMet}, bNeedsMet=${bNeedsMet}, aGoalMet=${aGoalMet})`);
      return false;
    }

    console.log(`    ✅ VALID MATCH: B (${B.companyName}) (aNeedsMet=${aNeedsMet}, bNeedsMet=${bNeedsMet}, aGoalMet=${aGoalMet})`);
    return true;
  }

  console.log("\n--- SIMULATING VALIDATION FOR EACH CANDIDATE ---");
  let passedCount = 0;
  for (const c of candidates) {
    if (isValidMatch(userBiz, c)) {
      passedCount++;
    }
  }

  console.log(`\nTotal candidates passing hard filter: ${passedCount} out of ${candidates.length}`);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
