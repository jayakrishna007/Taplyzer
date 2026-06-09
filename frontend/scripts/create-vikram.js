const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dns = require('node:dns');

try {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
} catch (e) {
  console.warn("DNS override failed, using default system DNS");
}

async function createVikram() {
  await mongoose.connect('mongodb+srv://Tapadmin:tap123@cluster0.i0sga0f.mongodb.net/?appName=Cluster0');
  
  const email = 'vikram@buildcore.com';
  const existing = await mongoose.connection.collection('users').findOne({ email });
  
  if (existing) {
    console.log("User already exists!");
    process.exit(0);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('vikram123', salt);

  const result = await mongoose.connection.collection('users').insertOne({
    name: 'Vikram',
    email: email,
    password: hashedPassword,
    role: 'USER',
    verified: true,
    lastActive: new Date()
  });

  console.log("Created user successfully:", result.insertedId);
  process.exit(0);
}

createVikram();
