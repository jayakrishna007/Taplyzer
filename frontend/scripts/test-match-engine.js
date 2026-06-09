/**
 * Test script: verifies the BM25 match engine returns scored results from Firebase Firestore.
 * Run: node scripts/test-match-engine.js
 */
const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

// Load env variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// ── Initialize Firebase Admin ────────────────────────────────────────────────
if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID || "taplyzer-dev";
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
    });
  } else {
    admin.initializeApp({
      projectId,
    });
  }
}
const db = admin.firestore();

// ── Inline BM25 (mirrors lib/bm25.ts) ────────────────────────────────────────
const K1 = 1.5, B = 0.75;
const STOP_WORDS = new Set(["a","an","the","and","or","in","on","at","to","for","of","with","by","is","are","it","we","you","they","i","not","no"]);

function stem(w) {
  if (w.length < 3) return w;

  let firstch = w.charAt(0);
  if (firstch === "y") {
    w = "Y" + w.substring(1);
  }

  // Step 1a
  let re = /^(.+?)(ss|i)es$/;
  let re2 = /^(.+?)([^s])s$/;
  if (re.test(w)) {
    w = w.replace(re, "$1$2");
  } else if (re2.test(w)) {
    w = w.replace(re2, "$1$2");
  }

  // Step 1b
  re = /^(.+?)eed$/;
  re2 = /^(.+?)(ed|ing)$/;
  if (re.test(w)) {
    let fp = re.exec(w);
    if (fp) {
      let stemVal = fp[1];
      if (/^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*/.test(stemVal)) {
        w = w.substring(0, w.length - 1);
      }
    }
  } else if (re2.test(w)) {
    let fp = re2.exec(w);
    if (fp) {
      let stemVal = fp[1];
      if (/^([^aeiou][^aeiouy]*)?[aeiouy]/.test(stemVal)) {
        w = stemVal;
        if (/(at|bl|iz)$/.test(w)) {
          w = w + "e";
        } else if (/([^aeiouylsz])\1$/.test(w)) {
          w = w.substring(0, w.length - 1);
        } else if (/^[^aeiou][^aeiouy]*[aeiouy][^aeiouwxy]$/.test(w)) {
          w = w + "e";
        }
      }
    }
  }

  // Step 1c
  re = /^(.+?)y$/;
  if (re.test(w)) {
    let fp = re.exec(w);
    if (fp) {
      let stemVal = fp[1];
      if (/^([^aeiou][^aeiouy]*)?[aeiouy]/.test(stemVal)) {
        w = stemVal + "i";
      }
    }
  }

  const step2list = {
    "ational": "ate",
    "tional": "tion",
    "enci": "ence",
    "anci": "ance",
    "izer": "ize",
    "bli": "ble",
    "alli": "al",
    "entli": "ent",
    "eli": "e",
    "ousli": "ous",
    "organization": "organize",
    "ization": "ize",
    "ation": "ate",
    "ator": "ate",
    "alism": "al",
    "iveness": "ive",
    "fulness": "ful",
    "ousness": "ous",
    "aliti": "al",
    "iviti": "ive",
    "biliti": "ble",
    "logi": "log"
  };

  const step3list = {
    "icate": "ic",
    "ative": "",
    "alize": "al",
    "iciti": "ic",
    "ical": "ic",
    "ful": "",
    "ness": ""
  };

  // Step 2
  re = /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/;
  if (re.test(w)) {
    let fp = re.exec(w);
    if (fp) {
      let stemVal = fp[1];
      let suffix = fp[2];
      if (/^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*/.test(stemVal)) {
        w = stemVal + step2list[suffix];
      }
    }
  }

  // Step 3
  re = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/;
  if (re.test(w)) {
    let fp = re.exec(w);
    if (fp) {
      let stemVal = fp[1];
      let suffix = fp[2];
      if (/^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*/.test(stemVal)) {
        w = stemVal + step3list[suffix];
      }
    }
  }

  // Step 4
  re = /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/;
  re2 = /^(.+?)(s|t)(ion)$/;
  if (re.test(w)) {
    let fp = re.exec(w);
    if (fp) {
      let stemVal = fp[1];
      if (/^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*[aeiouy][aeiou]*[^aeiou][^aeiouy]*/.test(stemVal)) {
        w = stemVal;
      }
    }
  } else if (re2.test(w)) {
    let fp = re2.exec(w);
    if (fp) {
      let stemVal = fp[1] + fp[2];
      if (/^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*[aeiouy][aeiou]*[^aeiou][^aeiouy]*/.test(stemVal)) {
        w = stemVal;
      }
    }
  }

  // Step 5a
  re = /^(.+?)e$/;
  if (re.test(w)) {
    let fp = re.exec(w);
    if (fp) {
      let stemVal = fp[1];
      let m1 = /^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*[aeiouy][aeiou]*[^aeiou][^aeiouy]*/.test(stemVal);
      let mEq1 = /^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*(([aeiouy][aeiou]*)?)$/.test(stemVal);
      let cvc = /^[^aeiou][^aeiouy]*[aeiouy][^aeiouwxy]$/.test(stemVal);
      if (m1 || (mEq1 && !cvc)) {
        w = stemVal;
      }
    }
  }

  // Step 5b
  re = /ll$/;
  if (re.test(w) && /^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*[aeiouy][aeiou]*[^aeiou][^aeiouy]*/.test(w)) {
    w = w.substring(0, w.length - 1);
  }

  if (firstch === "y") {
    w = "y" + w.substring(1);
  }

  return w;
}

function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1 && !STOP_WORDS.has(t))
    .map(t => stem(t));
}

function bm25Score(queryTokens, corpus) {
  const N = corpus.length;
  if (!N || !queryTokens.length) return new Array(N).fill(0);
  const avgdl = corpus.reduce((s, d) => s + d.length, 0) / N;
  const idfMap = new Map();
  for (const term of queryTokens) {
    if (idfMap.has(term)) continue;
    const df = corpus.filter(d => d.includes(term)).length;
    idfMap.set(term, Math.log((N - df + 0.5) / (df + 0.5) + 1));
  }
  return corpus.map(doc => {
    const dl = doc.length;
    const tf = new Map();
    doc.forEach(t => tf.set(t, (tf.get(t)||0)+1));
    let s = 0;
    for (const term of queryTokens) {
      const f = tf.get(term) || 0;
      if (!f) continue;
      s += (idfMap.get(term)||0) * (f*(K1+1)) / (f + K1*(1-B+B*dl/avgdl));
    }
    return s;
  });
}

function normalize(scores) {
  const max = Math.max(...scores);
  if (max === 0) return scores.map(() => 0);
  const ref = Math.max(max, 2.5);
  return scores.map(s => Math.min(s/ref, 1.0));
}

async function runTest() {
  console.log('📡 Connecting to Firebase Firestore...');

  // 1. Fetch target user
  const userSnapshot = await db.collection('users').where('email', '==', 'aishasen@example.com').limit(1).get();
  if (userSnapshot.empty) {
    console.log('❌ Test user (aishasen@example.com) not found in Firestore!');
    console.log('💡 Tip: Please seed your database first by running your server and visiting http://localhost:3000/api/seed');
    process.exit(1);
  }
  const userOwner = { id: userSnapshot.docs[0].id, ...userSnapshot.docs[0].data() };

  // 2. Fetch business profile
  const bizSnapshot = await db.collection('businesses').where('ownerId', '==', userOwner.id).limit(1).get();
  if (bizSnapshot.empty) {
    console.log(`❌ No business profile found for user ID ${userOwner.id} in Firestore`);
    process.exit(1);
  }
  const userBiz = { id: bizSnapshot.docs[0].id, ...bizSnapshot.docs[0].data() };

  console.log(`🔍 Testing matches for: ${userBiz.companyName || userBiz.brandName} (${userOwner.email})`);
  console.log(`   Offerings: ${(userBiz.offerings||[]).join(', ')}`);
  console.log(`   Needs:     ${(userBiz.needs||[]).join(', ')}\n`);

  // 3. Fetch candidates
  const candSnapshot = await db.collection('businesses').get();
  const candidates = candSnapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(c => c.ownerId !== userBiz.ownerId);

  console.log(`📦 Scoring ${candidates.length} candidates from Firestore...\n`);

  // BM25 corpora
  const offeringCorpus = candidates.map(c => tokenize([...(c.offerings||[]), c.intent?.currentGoal||''].join(' ')));
  const needsCorpus = candidates.map(c => tokenize((c.needs||[]).join(' ')));

  const userNeedsTok    = tokenize([...(userBiz.needs||[]), userBiz.intent?.currentGoal||''].join(' '));
  const userOfferTok    = tokenize((userBiz.offerings||[]).join(' '));

  const s1 = normalize(bm25Score(userNeedsTok, offeringCorpus)); // Can they help ME?
  const s2 = normalize(bm25Score(userOfferTok, needsCorpus));     // Can I help THEM?

  // Fetch ratings
  const ratingsSnapshot = await db.collection('ratings').get();
  const ratingMap = new Map();
  ratingsSnapshot.forEach(doc => {
    const data = doc.data();
    if (data.toUserId) {
      const current = ratingMap.get(data.toUserId.toString()) || { sum: 0, count: 0 };
      ratingMap.set(data.toUserId.toString(), {
        sum: current.sum + (data.rating || 0),
        count: current.count + 1
      });
    }
  });

  // Score each candidate
  const scored = candidates.map((c, i) => {
    // 70/30 weighting for Intent (out of 50)
    const intentPts = Math.round(((s1[i]*0.7) + (s2[i]*0.3)) * 50);
    if (intentPts < 2) return null;

    const city = (s => s?.toLowerCase().trim())(c.location?.city);
    const uCity = (s => s?.toLowerCase().trim())(userBiz.location?.city);
    const state = (c.location?.state||'').toLowerCase();
    const uState = (userBiz.location?.state||'').toLowerCase();
    let locPts = 0;
    const reach = (c.location?.operatesIn||'').toLowerCase();
    if (reach === 'global') locPts = 10;
    else if (reach === 'national') locPts = 8;
    
    if (city && uCity && city === uCity) locPts = 15; // MAX 15
    else if (state && uState && state === uState) locPts = Math.max(locPts, 10);
    else if ((c.location?.country||'').toLowerCase() === (userBiz.location?.country||'').toLowerCase()) locPts = Math.max(locPts, 5);

    const verMap = { 'Trusted Partner':15,'Business Verified':12,'Basic Verified':8 };
    const verPts = verMap[c.trust?.verificationStatus] || 0;

    const r = ratingMap.get((c.ownerId||'').toString());
    const repPts = r ? ((r.sum/r.count)>=4.5?10:(r.sum/r.count)>=4?8:(r.sum/r.count)>=3?5:2) : 5;

    const total = intentPts + locPts + verPts + repPts;
    return { name: c.companyName||c.brandName, total, intentPts, locPts, verPts, repPts };
  }).filter(Boolean).sort((a,b) => b.total - a.total).slice(0, 10);

  console.log('🏆 TOP 10 MATCHES (FIXED ALGORITHM - FIRESTORE):');
  console.log('─'.repeat(80));
  scored.forEach((m, i) => {
    console.log(`${i+1}. ${m.name}`);
    console.log(`   Score: ${m.total}/95 | Intent:${m.intentPts}/50 | Loc:${m.locPts}/15 | Verify:${m.verPts}/15 | Rep:${m.repPts}/10`);
  });

  console.log(`\n✅ Engine working — ${scored.length} relevant matches found out of ${candidates.length} candidates`);
  process.exit(0);
}

runTest().catch(e => { console.error(e); process.exit(1); });
