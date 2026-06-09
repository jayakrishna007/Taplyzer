const admin = require("firebase-admin");

if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID || "taplyzer-dev";
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (clientEmail && privateKey) {
    const formattedKey = privateKey.replace(/\\n/g, "\n").replace(/^["'](.*)["']$/, "$1");
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
