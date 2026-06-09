import * as admin from "firebase-admin";

let db: admin.firestore.Firestore;

function cleanPrivateKey(key: string): string {
  if (!key) return "";
  let cleaned = key.trim();
  while (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  cleaned = cleaned.replace(/\\n/g, "\n").replace(/\\r/g, "\r");
  while (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned;
}

if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID || "taplyzer-dev";
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (clientEmail && privateKey) {
    const formattedKey = cleanPrivateKey(privateKey);
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: formattedKey,
      }),
    });
  } else {
    admin.initializeApp({
      projectId,
    });
  }
  db = admin.firestore();
  try {
    db.settings({ ignoreUndefinedProperties: true });
  } catch (e) {
    console.warn("Firestore settings already initialized:", e);
  }
} else {
  db = admin.firestore();
}

async function dbConnect() {
  return db;
}

export { db };
export default dbConnect;
