// ===============================
// TAPLYZER MATCH ENGINE
// Node.js + Firebase Cloud Firestore + Google Gemini Embeddings
// ===============================
// npm install express firebase-admin dotenv @google/generative-ai
// ===============================

require("dotenv").config();
const express = require("express");
const { db } = require("./lib/db");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const app = express();
app.use(express.json());

// ===============================
// EMBEDDING FUNCTION
// ===============================
async function generateEmbedding(text) {
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

// ===============================
// COSINE SIMILARITY
// ===============================
function cosineSimilarity(a, b) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

// ===============================
// SCORE ENGINE
// Weights (must total 100):
//   relevance  70  — semantic alignment of intent vs offering
//   location   10  — same city / region
//   freshness  20  — how recently the candidate was active
// ===============================
function calculateFinalScore({ relevance, location, freshness }) {
  return relevance * 70 + location * 10 + freshness * 20;
}

// ===============================
// FRESHNESS HELPER
// ===============================
function getFreshnessScore(lastActive) {
  if (!lastActive) return 0.1;
  // Firestore timestamps might be Date objects or Firebase Timestamp objects.
  // We normalize to timestamp.
  const time = lastActive.toDate ? lastActive.toDate().getTime() : new Date(lastActive).getTime();
  const days = (Date.now() - time) / (1000 * 60 * 60 * 24);
  if (days <= 3) return 1.0;
  if (days <= 7) return 0.75;
  if (days <= 30) return 0.4;
  return 0.1;
}

// ===============================
// MATCH API
// POST /generate-matches/:userId
// ===============================
app.post("/generate-matches/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Get target User A
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) return res.status(404).json({ msg: "User not found" });
    const user = userDoc.data();

    // Get target User A's intent
    const intentSnapshot = await db.collection("intents").where("userId", "==", userId).limit(1).get();
    if (intentSnapshot.empty) return res.status(404).json({ msg: "No intent found. Add an intent first." });
    const intent = intentSnapshot.docs[0].data();

    // All offerings from OTHER users (using Firestore inequality query)
    const candidatesSnapshot = await db.collection("offerings").where("userId", "!=", userId).get();
    
    if (candidatesSnapshot.empty) {
      return res.json({ msg: "No candidates found", matches: [] });
    }

    // Score every candidate
    const results = [];

    // Fetch all candidate users in a single batch read
    const candidateUserIds = candidatesSnapshot.docs
      .map(doc => doc.data().userId)
      .filter(Boolean);
    const uniqueUserIds = Array.from(new Set(candidateUserIds));

    const userMap = new Map();
    if (uniqueUserIds.length > 0) {
      const refs = uniqueUserIds.map(id => db.collection("users").doc(id));
      const snaps = await db.getAll(...refs);
      for (const snap of snaps) {
        if (snap.exists) {
          userMap.set(snap.id, snap.data());
        }
      }
    }

    for (const doc of candidatesSnapshot.docs) {
      const candidate = doc.data();
      const candidateUser = userMap.get(candidate.userId);
      if (!candidateUser) continue;

      // 1. Semantic Relevance (intent ↔ offering)
      const relevance = cosineSimilarity(intent.embedding, candidate.embedding);

      // 2. Location Score
      const locationScore =
        user.location && candidateUser.location &&
          user.location.toLowerCase() === candidateUser.location.toLowerCase()
          ? 1.0
          : 0.3;

      // 3. Freshness
      const freshness = getFreshnessScore(candidateUser.lastActive);

      // Final weighted score
      const score = calculateFinalScore({ relevance, location: locationScore, freshness });

      // Human-readable reasons
      const reasons = [];
      if (relevance > 0.75) reasons.push("Highly relevant offering");
      if (relevance > 0.5) reasons.push("Relevant to your intent");
      if (locationScore === 1.0) reasons.push("Same city");
      if (candidateUser.verified) reasons.push("Verified business");
      if (freshness >= 0.75) reasons.push("Recently active");

      results.push({
        matchedUserId: candidate.userId,
        candidateName: candidateUser.name,
        offeringText: candidate.text,
        score: parseFloat(score.toFixed(4)),
        reasons,
      });
    }

    // Sort descending by score
    results.sort((a, b) => b.score - a.score);
    const top20 = results.slice(0, 20);

    // Persist top matches (replace previous)
    const oldMatchesSnapshot = await db.collection("matches").where("userId", "==", userId).get();
    const batch = db.batch();
    
    // Delete previous matches
    oldMatchesSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Write new matches
    top20.forEach((item) => {
      const matchRef = db.collection("matches").doc();
      batch.set(matchRef, {
        userId,
        matchedUserId: item.matchedUserId,
        score: item.score,
        reasons: item.reasons,
        createdAt: new Date(),
      });
    });

    await batch.commit();

    return res.json({ count: top20.length, matches: top20 });

  } catch (err) {
    console.error("Match engine error:", err);
    return res.status(500).json({ msg: "Server Error", error: err.message });
  }
});

// ===============================
// GET SAVED MATCHES
// GET /matches/:userId
// ===============================
app.get("/matches/:userId", async (req, res) => {
  try {
    const dataSnapshot = await db.collection("matches")
      .where("userId", "==", req.params.userId)
      .get();
    
    const matches = dataSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Sort descending in JS to prevent requiring composite index creation in development
    matches.sort((a, b) => b.score - a.score);

    return res.json({ count: matches.length, matches });
  } catch (err) {
    return res.status(500).json({ msg: "Server Error", error: err.message });
  }
});

// ===============================
// SAVE / UPDATE INTENT
// POST /intent/:userId   { "text": "Need 3 distributors in Bangalore" }
// ===============================
app.post("/intent/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { text } = req.body;
    if (!text) return res.status(400).json({ msg: "text field is required" });

    const embedding = await generateEmbedding(text);

    const snapshot = await db.collection("intents").where("userId", "==", userId).limit(1).get();
    if (!snapshot.empty) {
      await db.collection("intents").doc(snapshot.docs[0].id).update({
        text,
        embedding,
        updatedAt: new Date()
      });
    } else {
      await db.collection("intents").add({
        userId,
        text,
        embedding,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    return res.json({ msg: "Intent saved" });
  } catch (err) {
    return res.status(500).json({ msg: "Server Error", error: err.message });
  }
});

// ===============================
// SAVE / UPDATE OFFERING
// POST /offering/:userId  { "text": "We provide OEM supply and bulk manufacturing" }
// ===============================
app.post("/offering/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { text } = req.body;
    if (!text) return res.status(400).json({ msg: "text field is required" });

    const embedding = await generateEmbedding(text);

    const snapshot = await db.collection("offerings").where("userId", "==", userId).limit(1).get();
    if (!snapshot.empty) {
      await db.collection("offerings").doc(snapshot.docs[0].id).update({
        text,
        embedding,
        updatedAt: new Date()
      });
    } else {
      await db.collection("offerings").add({
        userId,
        text,
        embedding,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    return res.json({ msg: "Offering saved" });
  } catch (err) {
    return res.status(500).json({ msg: "Server Error", error: err.message });
  }
});

// ===============================
// SERVER
// ===============================
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => console.log(`Match engine running on port ${PORT}`));
}
module.exports = app;
