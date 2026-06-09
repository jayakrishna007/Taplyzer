// Trigger Vercel Build
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
    console.log("[FIREBASE KEY DEBUG] Raw length:", privateKey.length);
    console.log("[FIREBASE KEY DEBUG] Starts with:", JSON.stringify(privateKey.substring(0, 30)));
    console.log("[FIREBASE KEY DEBUG] Ends with:", JSON.stringify(privateKey.substring(privateKey.length - 30)));
    console.log("[FIREBASE KEY DEBUG] Contains raw \\n:", privateKey.includes("\\n"));
    console.log("[FIREBASE KEY DEBUG] Contains actual newline:", privateKey.includes("\n"));

    const formattedKey = cleanPrivateKey(privateKey);
    console.log("[FIREBASE KEY DEBUG] Formatted length:", formattedKey.length);
    console.log("[FIREBASE KEY DEBUG] Formatted starts with:", JSON.stringify(formattedKey.substring(0, 30)));
    console.log("[FIREBASE KEY DEBUG] Formatted ends with:", JSON.stringify(formattedKey.substring(formattedKey.length - 30)));

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
