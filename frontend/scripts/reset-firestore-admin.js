const admin = require('firebase-admin');
const bcrypt = require('bcryptjs');
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
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password', salt);

  const snapshot = await db.collection('users').where('email', '==', 'admin@taplyzer.com').limit(1).get();
  if (snapshot.empty) {
    console.log("Admin user not found in Firestore!");
    process.exit(1);
  }

  const adminDoc = snapshot.docs[0];
  await adminDoc.ref.update({
    password: hashedPassword
  });

  console.log("Firestore admin password successfully updated to 'password'!");
  process.exit(0);
}

run().catch(console.error);
