// Trigger Vercel Build
import * as admin from "firebase-admin";

let db: admin.firestore.Firestore;

function cleanPrivateKey(key: string): string {
  if (!key) return "";
  let cleaned = key.trim();
  
  // Remove wrapping quotes
  if (cleaned.startsWith('"')) cleaned = cleaned.substring(1);
  if (cleaned.endsWith('"')) cleaned = cleaned.substring(0, cleaned.length - 1);
  if (cleaned.startsWith("'")) cleaned = cleaned.substring(1);
  if (cleaned.endsWith("'")) cleaned = cleaned.substring(0, cleaned.length - 1);
  
  cleaned = cleaned.trim();
  cleaned = cleaned.replace(/\\n/g, "\n").replace(/\\r/g, "\r");
  
  const header = "-----BEGIN PRIVATE KEY-----";
  const footer = "-----END PRIVATE KEY-----";
  
  const headerIndex = cleaned.indexOf(header);
  const footerIndex = cleaned.indexOf(footer);
  
  if (headerIndex !== -1 && footerIndex !== -1) {
    cleaned = cleaned.substring(headerIndex, footerIndex + footer.length);
  } else {
    if (headerIndex !== -1) {
      cleaned = cleaned.substring(headerIndex);
    } else if (!cleaned.startsWith(header)) {
      cleaned = header + "\n" + cleaned;
    }
    
    if (footerIndex !== -1) {
      cleaned = cleaned.substring(0, footerIndex + footer.length);
    } else if (!cleaned.endsWith(footer)) {
      cleaned = cleaned + "\n" + footer;
    }
  }
  
  return cleaned.trim();
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
