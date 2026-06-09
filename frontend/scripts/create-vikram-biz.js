const mongoose = require('mongoose');
const dns = require('node:dns');

try {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
} catch (e) {
  console.warn("DNS override failed, using default system DNS");
}

async function createBusiness() {
  await mongoose.connect('mongodb+srv://Tapadmin:tap123@cluster0.i0sga0f.mongodb.net/?appName=Cluster0');
  
  const user = await mongoose.connection.collection('users').findOne({ email: 'vikram@buildcore.com' });
  if (!user) {
    console.log("User not found!");
    process.exit(1);
  }

  const existingBiz = await mongoose.connection.collection('businesses').findOne({ ownerId: user._id });
  if (existingBiz) {
    console.log("Business already exists");
    process.exit(0);
  }

  const result = await mongoose.connection.collection('businesses').insertOne({
    ownerId: user._id,
    ownerName: user.name,
    companyName: 'BuildCore Technologies',
    industry: 'Enterprise Software',
    location: { city: 'Bangalore', state: 'Karnataka', country: 'India', operatesIn: 'National' },
    offerings: ['Cloud Infrastructure', 'SaaS CRM'],
    needs: ['Marketing Agency', 'Implementation Partners'],
    intent: { currentGoal: 'Looking for aggressive B2B lead generation.' },
    trust: { verificationStatus: 'Business Verified' },
    isProfileCompleted: true
  });

  console.log("Created business successfully:", result.insertedId);
  process.exit(0);
}

createBusiness();
