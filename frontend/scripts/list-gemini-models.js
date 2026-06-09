require('dotenv').config({ path: '.env.local' });

async function listModels() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.error("Missing GEMINI_API_KEY");
    process.exit(1);
  }

  console.log("Fetching available Gemini models...");
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await res.json();
    if (data.models) {
      console.log("Available Models:");
      data.models.forEach(m => console.log(` - ${m.name} (${m.displayName})`));
    } else {
      console.log("Response:", JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
  process.exit(0);
}

listModels();
