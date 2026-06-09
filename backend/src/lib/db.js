const admin = require("firebase-admin");

function cleanPrivateKey(key) {
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
}

const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

module.exports = { db };
