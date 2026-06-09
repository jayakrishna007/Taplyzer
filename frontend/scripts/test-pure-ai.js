const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://Tapadmin:tap123@ac-tmaogxb-shard-00-00.i0sga0f.mongodb.net:27017,ac-tmaogxb-shard-00-01.i0sga0f.mongodb.net:27017,ac-tmaogxb-shard-00-02.i0sga0f.mongodb.net:27017/?ssl=true&authSource=admin&replicaSet=atlas-gughnq-shard-0&appName=Cluster0';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function runTest() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB.");

  const db = mongoose.connection;
  const userOwner = await db.collection('users').findOne({ email: 'saas.founder1.hyderabad@example.com' });
  if (!userOwner) {
    console.log("User not found");
    process.exit(1);
  }

  const userId = userOwner._id.toString();
  console.log("Testing for userId:", userId);

  const userBiz = await db.collection('businesses').findOne({ ownerId: userOwner._id });
  if (!userBiz) {
    console.log("Business not found");
    process.exit(1);
  }

  const candidates = await db.collection('businesses').aggregate([
    { $match: { ownerId: { $ne: userOwner._id } } },
    {
      $lookup: {
        from: "users",
        localField: "ownerId",
        foreignField: "_id",
        as: "ownerData",
      },
    },
    { $unwind: { path: "$ownerData", preserveNullAndEmptyArrays: true } },
    { $match: { "ownerData.status": { $ne: "SUSPENDED" } } },
    { $limit: 30 }
  ]).toArray();

  console.log(`Found ${candidates.length} candidates.`);

  const promptData = {
    targetBusiness: {
      companyName: userBiz.companyName || userBiz.brandName || "My Business",
      industry: userBiz.industry || "",
      offerings: userBiz.offerings || [],
      needs: userBiz.needs || [],
      goal: userBiz.intent?.currentGoal || "",
    },
    candidates: candidates.map(c => ({
      id: c.ownerId ? c.ownerId.toString() : "unknown",
      companyName: c.companyName || c.brandName || "Unknown Candidate",
      industry: c.industry || "",
      offerings: c.offerings || [],
      needs: c.needs || [],
      goal: c.intent?.currentGoal || "",
      description: c.ownerData?.businessDescription || "",
    }))
  };

  const systemInstruction = `You are an expert B2B matchmaker and AI judge. Your job is to evaluate the commercial synergy between a 'targetBusiness' and a list of 'candidates'.

Evaluate bidirectional synergy:
1. Does the targetBusiness need what the candidate offers? (Target is Buyer)
2. Does the candidate need what the targetBusiness offers? (Target is Seller)

CRITICAL INSTRUCTION: To save bandwidth, ONLY return candidates that have genuine commercial synergy (aiScore >= 10). Do NOT include candidates with 0 synergy or direct competitors.

Return a JSON array of objects with this exact structure:
[
  {
    "candidateId": "string (must match candidate id precisely)",
    "aiScore": number (10 to 80, where 80 is a perfect commercial match, 40 is moderate synergy),
    "aiReason": "string (1 clear, compelling sentence explaining exactly why they match or what the synergy is)"
  }
]`;

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.1,
    },
    systemInstruction,
  });

  console.log("Calling Gemini 1.5 Flash...");
  try {
    const result = await model.generateContent(JSON.stringify(promptData));
    const responseText = result.response.text();
    console.log("Gemini Raw Response:\n", responseText);

    const parsed = JSON.parse(responseText);
    console.log(`Successfully parsed ${parsed.length} AI evaluations.`);
  } catch (err) {
    console.error("Gemini Error:", err);
  }

  process.exit(0);
}

runTest().catch(err => {
  console.error("Fatal Error:", err);
  process.exit(1);
});
