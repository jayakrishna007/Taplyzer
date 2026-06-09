const mongoose = require('mongoose');
const dns = require('node:dns');

try {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
} catch (e) {
  console.warn("DNS override failed, using default system DNS");
}

async function checkUser() {
  await mongoose.connect('mongodb+srv://Tapadmin:tap123@cluster0.i0sga0f.mongodb.net/?appName=Cluster0');
  const user = await mongoose.connection.collection('users').findOne({ email: 'vikram@buildcore.com' });
  console.log("User:", user);
  process.exit(0);
}

checkUser();
