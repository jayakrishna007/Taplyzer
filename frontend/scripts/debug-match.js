/**
 * Debug script: tests the matching logic directly against MongoDB
 * Run: node scripts/debug-match.js <userId>
 * If no userId given, picks a random user with needs set.
 */
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

const STOP_WORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with",
  "by","from","as","is","are","was","were","be","been","has","have","had",
  "do","does","did","will","would","could","should","may","might","shall",
  "it","its","this","that","these","those","we","our","you","your","they",
  "their","i","my","me","us","he","she","him","her","not","no","so","if",
  "company","services","solutions","business","provide","offering","needs",
  "looking","seeking","specializing","expert","professional","team",
]);

function tokenize(text) {
  if (!text) return [];
  return text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(t => t.length > 2 && !STOP_WORDS.has(t));
}

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected\n");

  const db = mongoose.connection.db;
  const userId = process.argv[2];

  let userBiz;
  if (userId) {
    userBiz = await db.collection('businesses').findOne({ ownerId: new mongoose.Types.ObjectId(userId) });
  } else {
    // Find a user with needs set
    userBiz = await db.collection('businesses').findOne({ needs: { $exists: true, $not: { $size: 0 } } });
  }

  if (!userBiz) {
    console.log("❌ No user found with needs. Please add needs to your profile first.");
    process.exit(1);
  }

  console.log("=== YOUR PROFILE ===");
  console.log("Needs:    ", userBiz.needs);
  console.log("Offerings:", userBiz.offerings);
  console.log("Industry: ", userBiz.industry);
  console.log();

  const myNeedTokens = tokenize([
    ...(userBiz.needs || []),
    userBiz.intent?.currentGoal || ""
  ].join(" "));

  console.log("=== MY NEED TOKENS ===");
  console.log(myNeedTokens);
  console.log();

  // Fetch all other businesses
  const candidates = await db.collection('businesses').find({
    ownerId: { $ne: userBiz.ownerId }
  }).toArray();

  console.log(`=== CANDIDATES: ${candidates.length} total ===\n`);

  // Build corpus
  const offeringCorpus = candidates.map(c => {
    const parts = [
      ...(c.offerings || []),
      c.industry || "",
      c.subIndustry || "",
    ];
    return tokenize(parts.join(" "));
  });

  // Show first 3 corpus samples
  console.log("=== SAMPLE CORPUS (first 3 candidates) ===");
  candidates.slice(0, 3).forEach((c, i) => {
    console.log(`Candidate ${i+1}: ${c.companyName || c.brandName}`);
    console.log(`  industry: "${c.industry}", subIndustry: "${c.subIndustry}"`);
    console.log(`  offerings: ${JSON.stringify(c.offerings)}`);
    console.log(`  corpus tokens: [${offeringCorpus[i].join(", ")}]`);
    console.log();
  });

  // Check overlap manually
  console.log("=== TOKEN OVERLAP CHECK ===");
  let matchCount = 0;
  candidates.forEach((c, i) => {
    const cTokens = new Set(offeringCorpus[i]);
    const overlap = myNeedTokens.filter(t => cTokens.has(t));
    if (overlap.length > 0) {
      matchCount++;
      if (matchCount <= 5) {
        console.log(`✅ ${c.companyName || c.brandName} — matched tokens: [${overlap.join(", ")}]`);
      }
    }
  });
  console.log(`\n📊 ${matchCount} out of ${candidates.length} candidates have at least 1 matching token`);

  if (matchCount === 0) {
    console.log("\n⚠️  ZERO token overlap found. Possible causes:");
    console.log("  1. The 'industry' field is missing or empty in candidate businesses");
    console.log("  2. Your needs tokens don't match any word in any candidate's offerings/industry");
    
    // Show what the DM candidates look like
    const dmCandidates = candidates.filter(c => 
      (c.industry || "").toLowerCase().includes("digital") ||
      (c.industry || "").toLowerCase().includes("marketing")
    );
    console.log(`\n  Found ${dmCandidates.length} candidates with 'digital/marketing' in industry`);
    if (dmCandidates.length > 0) {
      const sample = dmCandidates[0];
      console.log(`  Sample: industry="${sample.industry}", tokens=[${tokenize(sample.industry || "").join(", ")}]`);
    }
  }

  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
