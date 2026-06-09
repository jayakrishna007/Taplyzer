const mongoose = require('mongoose');
const dns = require('node:dns');

try {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
} catch (e) {
  console.warn("DNS override failed, using default system DNS");
}

async function listUsers() {
  await mongoose.connect('mongodb+srv://Tapadmin:tap123@cluster0.i0sga0f.mongodb.net/?appName=Cluster0');
  const users = await mongoose.connection.collection('users').find({}).toArray();
  console.log("Total users:", users.length);
  users.forEach(u => console.log(u.email));
  process.exit(0);
}

listUsers();
