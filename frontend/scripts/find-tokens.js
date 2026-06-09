const mongoose = require('mongoose');
const MONGO_URI = 'mongodb+srv://Tapadmin:tap123@cluster0.i0sga0f.mongodb.net/?appName=Cluster0';

// DNS Fix
try {
  const dns = require("node:dns");
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
} catch (e) {}

async function findToken() {
  try {
    await mongoose.connect(MONGO_URI);
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({ 
      googleRefreshToken: { type: String, select: false }, 
      googleEmail: String 
    }));
    
    const users = await User.find({ googleRefreshToken: { $exists: true } }).select('+googleRefreshToken');
    console.log('TOKENS_FOUND:');
    users.forEach(u => {
      console.log(`Email: ${u.googleEmail} | Token: ${u.googleRefreshToken}`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

findToken();
