const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID || "taplyzer-dev";
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, "\n"),
    }),
  });
}
const db = admin.firestore();

async function run() {
  const snapshot = await db.collection('users').get();
  console.log("Total Firestore users:", snapshot.size);
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    console.log(`Email: ${data.email} | Name: ${data.name} | Verified: ${data.verified} | Password Hash: ${data.password ? data.password.substring(0, 10) + "..." : "none"}`);
  });
  process.exit(0);
}

run().catch(console.error);
