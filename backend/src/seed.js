// ===============================
// SEED SCRIPT — Test Data for Match Engine
// Run: node src/seed.js
// ===============================
require("dotenv").config();
const { db } = require("./lib/db");

// ---- Helper to delete a collection ----
async function deleteCollection(collectionPath) {
  const collectionRef = db.collection(collectionPath);
  const snapshot = await collectionRef.get();
  
  if (snapshot.size === 0) return;

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
}

// ---- Fake embedding (1536-dim random unit vector) ----
function fakeEmbedding(seed = 1) {
  const arr = Array.from({ length: 1536 }, (_, i) =>
    Math.sin(seed * 1000 + i) * 0.5
  );
  const mag = Math.sqrt(arr.reduce((s, v) => s + v * v, 0));
  return arr.map((v) => v / mag);
}

// Similar embedding — dot product > 0.75 with seed 1
function similarEmbedding(baseSeed = 1, noise = 0.05) {
  const base = fakeEmbedding(baseSeed);
  const noisy = base.map((v) => v + (Math.random() - 0.5) * noise);
  const mag = Math.sqrt(noisy.reduce((s, v) => s + v * v, 0));
  return noisy.map((v) => v / mag);
}

async function seed() {
  console.log("Connecting to Firestore — Seeding...");
  
  // Wipe previous test data
  await deleteCollection("users");
  await deleteCollection("intents");
  await deleteCollection("offerings");
  await deleteCollection("matches");
  console.log("Old data cleared.");

  // ---- Users ----
  const userData = [
    { name: "Riya Shah", industry: "Marketing", location: "Bangalore", lastActive: new Date(), verified: true },
    { name: "Arjun Mehta", industry: "Manufacturing", location: "Bangalore", lastActive: new Date(), verified: true },
    { name: "Priya Nair", industry: "Software", location: "Mumbai", lastActive: new Date(Date.now() - 2 * 86400000), verified: false },
    { name: "Vikram Rao", industry: "Finance", location: "Bangalore", lastActive: new Date(Date.now() - 10 * 86400000), verified: true },
    { name: "Sneha Kapoor", industry: "Marketing", location: "Hyderabad", lastActive: new Date(Date.now() - 40 * 86400000), verified: false },
  ];

  const users = [];
  for (const u of userData) {
    const docRef = await db.collection("users").add(u);
    users.push({ id: docRef.id, ...u });
  }

  const [riya, arjun, priya, vikram, sneha] = users;
  console.log(`Created ${users.length} users.`);

  // ---- Intents (what each user is LOOKING FOR) ----
  const intentsData = [
    { userId: riya.id, text: "Looking for manufacturing distributors in Bangalore", embedding: fakeEmbedding(1) },
    { userId: arjun.id, text: "Need marketing agency to grow B2B sales", embedding: fakeEmbedding(2) },
    { userId: priya.id, text: "Seeking SaaS channel partners in India", embedding: fakeEmbedding(3) },
    { userId: vikram.id, text: "Need fintech clients for investment advisory", embedding: fakeEmbedding(4) },
    { userId: sneha.id, text: "Looking for SEO and lead generation services", embedding: fakeEmbedding(5) },
  ];

  for (const intent of intentsData) {
    await db.collection("intents").add(intent);
  }
  console.log("Intents created.");

  // ---- Offerings (what each user PROVIDES) ----
  const offeringsData = [
    { userId: riya.id, text: "SEO, Paid Ads, Content Marketing for B2B companies", embedding: similarEmbedding(2, 0.04) },
    { userId: arjun.id, text: "Manufacturing supply, OEM bulk orders, distribution Bangalore", embedding: similarEmbedding(1, 0.03) },
    { userId: priya.id, text: "SaaS development, API integration, cloud solutions", embedding: fakeEmbedding(6) },
    { userId: vikram.id, text: "Financial advisory, investment planning, wealth management", embedding: similarEmbedding(4, 0.06) },
    { userId: sneha.id, text: "Lead generation, paid campaigns, digital marketing agency", embedding: similarEmbedding(5, 0.04) },
  ];

  for (const offering of offeringsData) {
    await db.collection("offerings").add(offering);
  }
  console.log("Offerings created.");

  console.log("\n=== SEED COMPLETE ===");
  console.log("Test user IDs (use these in API calls):");
  users.forEach((u) => console.log(`  ${u.name.padEnd(16)} → ${u.id}`));
  console.log("\nExample — generate matches for Riya:");
  console.log(`  POST http://localhost:5000/generate-matches/${riya.id}`);
  console.log("\nExpected top match for Riya: Arjun Mehta (same city + highly relevant offering)");
  
  console.log("\nReady to test!");
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
