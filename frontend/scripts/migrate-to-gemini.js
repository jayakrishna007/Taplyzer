/**
 * scripts/migrate-to-gemini.js
 * 
 * This script migrates existing business data to the Gemini-powered 
 * match engine by generating 768-dimension embeddings for all 
 * intents and offerings.
 */
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const MONGO_URI = process.env.MONGO_URI;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!MONGO_URI || !GEMINI_API_KEY) {
  console.error("❌ Missing MONGO_URI or GEMINI_API_KEY in .env.local");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });


async function generateEmbedding(text) {
  if (!text || text.trim().length === 0) return null;
  try {
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (err) {
    console.error(`   ⚠️ Failed to generate embedding for: "${text.substring(0, 30)}..."`, err.message);
    return null;
  }
}

async function migrate() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // We use raw collection access to avoid model mismatches
    const db = mongoose.connection.db;
    const businesses = await db.collection('businesses').find({}).toArray();
    console.log(`🔍 Found ${businesses.length} businesses to migrate...`);

    for (const biz of businesses) {
      const userId = biz.ownerId;
      console.log(`\nProcessing: ${biz.companyName || biz.brandName || biz.ownerName} (${userId})`);

      // 1. Process Intent
      const intentText = biz.intent?.currentGoal;
      if (intentText) {
        console.log(`   - Generating embedding for Intent...`);
        const embedding = await generateEmbedding(intentText);
        if (embedding) {
          await db.collection('intents').updateOne(
            { userId },
            { $set: { text: intentText, embedding, updatedAt: new Date() } },
            { upsert: true }
          );
          console.log(`     ✅ Intent migrated`);
        }
      }

      // 2. Process Offerings
      const offeringsText = (biz.offerings || []).join(", ");
      if (offeringsText) {
        console.log(`   - Generating embedding for Offerings...`);
        const embedding = await generateEmbedding(offeringsText);
        if (embedding) {
          await db.collection('offerings').updateOne(
            { userId },
            { $set: { text: offeringsText, embedding, updatedAt: new Date() } },
            { upsert: true }
          );
          console.log(`     ✅ Offerings migrated`);
        }
      }
    }

    console.log("\n✨ Migration complete! Your Gemini Match Engine is now ready.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrate();
