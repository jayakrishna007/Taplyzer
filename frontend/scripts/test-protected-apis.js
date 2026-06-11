const dns = require('node:dns');

try {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
} catch (e) {
  console.warn("DNS override failed");
}

async function run() {
  console.log("📡 Attempting login to get session token...");
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: "admin@taplyzer.com", password: "password" })
  });

  if (!loginRes.ok) {
    console.error("❌ Login failed:", loginRes.status, await loginRes.text());
    process.exit(1);
  }

  const loginData = await loginRes.json();
  const userId = loginData.user?._id;
  console.log("✅ Logged in successfully! User ID:", userId);

  const cookieHeader = loginRes.headers.get('set-cookie');
  if (!cookieHeader) {
    console.error("❌ No set-cookie header found in login response!");
    process.exit(1);
  }

  // Extract the token value
  const match = cookieHeader.match(/taplyzer_auth_token=([^;]+)/);
  if (!match) {
    console.error("❌ Failed to parse taplyzer_auth_token from cookie!");
    process.exit(1);
  }
  const token = match[1];
  const cookie = `taplyzer_auth_token=${token}`;

  const endpoints = [
    { name: "GET /api/auth/me", url: "http://localhost:3000/api/auth/me", method: "GET" },
    { name: `GET /api/dashboard/stats/${userId}`, url: `http://localhost:3000/api/dashboard/stats/${userId}`, method: "GET" },
    { name: `POST /api/matches/${userId}`, url: `http://localhost:3000/api/matches/${userId}`, method: "POST" },
    { name: `GET /api/matches/${userId}`, url: `http://localhost:3000/api/matches/${userId}`, method: "GET" },
    { name: "GET /api/explore", url: "http://localhost:3000/api/explore", method: "GET" },
    { name: "GET /api/admin/stats", url: "http://localhost:3000/api/admin/stats", method: "GET" },
    { name: "GET /api/admin/verification", url: "http://localhost:3000/api/admin/verification", method: "GET" },
    { name: "GET /api/admin/ai-insights", url: "http://localhost:3000/api/admin/ai-insights", method: "GET" },
    { name: "GET /api/admin/noc", url: "http://localhost:3000/api/admin/noc", method: "GET" },
  ];

  console.log("\n🧪 Running API Diagnostics...");
  for (const ep of endpoints) {
    try {
      const res = await fetch(ep.url, {
        method: ep.method,
        headers: {
          'Cookie': cookie,
          'Content-Type': 'application/json'
        }
      });
      console.log(`${res.ok ? "✅" : "❌"} ${ep.name} | Status: ${res.status}`);
      if (!res.ok) {
        console.log(`   Response: ${await res.text()}`);
      }
    } catch (e) {
      console.log(`💥 ${ep.name} failed with exception: ${e.message}`);
    }
  }

  process.exit(0);
}

run().catch(console.error);
