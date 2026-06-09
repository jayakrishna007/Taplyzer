const mongoose = require('mongoose');
const dns = require('node:dns');

try { dns.setServers(["1.1.1.1", "8.8.8.8"]); } catch (e) {}

const MONGO_URI = 'mongodb+srv://Tapadmin:tap123@cluster0.i0sga0f.mongodb.net/?appName=Cluster0';

async function checkVerificationDB() {
  await mongoose.connect(MONGO_URI);
  console.log('\n✅ MongoDB connected\n');

  const db = mongoose.connection;

  // 1. Total businesses
  const total = await db.collection('businesses').countDocuments();
  console.log(`📦 Total businesses in DB: ${total}`);

  // 2. Check field shape of first business
  const sample = await db.collection('businesses').findOne({});
  if (sample) {
    console.log('\n🔍 Sample business fields:');
    console.log('  ownerId:', sample.ownerId);
    console.log('  companyName:', sample.companyName);
    console.log('  brandName:', sample.brandName);
    console.log('  industry:', sample.industry);
    console.log('  trust:', JSON.stringify(sample.trust));
    console.log('  status:', sample.status);
    console.log('  location:', JSON.stringify(sample.location));
    console.log('  strength:', JSON.stringify(sample.strength));
  } else {
    console.log('\n⚠️  No businesses found in DB!');
  }

  // 3. Count by trust.verificationStatus
  console.log('\n📊 Verification status breakdown (trust.verificationStatus):');
  const tiers = ['Not Verified', 'Basic Verified', 'Business Verified', 'Trusted Partner'];
  for (const tier of tiers) {
    const count = await db.collection('businesses').countDocuments({ 'trust.verificationStatus': tier });
    console.log(`  ${tier}: ${count}`);
  }

  // 4. Count businesses WITH trust field at all
  const withTrust = await db.collection('businesses').countDocuments({ 'trust': { $exists: true } });
  const withVerStatus = await db.collection('businesses').countDocuments({ 'trust.verificationStatus': { $exists: true } });
  console.log(`\n  Has trust field: ${withTrust}`);
  console.log(`  Has trust.verificationStatus: ${withVerStatus}`);

  // 5. Check old flat verificationStatus (legacy)
  const legacyFlat = await db.collection('businesses').countDocuments({ 'verificationStatus': { $exists: true } });
  console.log(`\n⚠️  Legacy flat verificationStatus field: ${legacyFlat}`);

  // 6. Check ownerId populate — find a business and look up its owner
  const bizWithOwner = await db.collection('businesses').findOne({ ownerId: { $exists: true } });
  if (bizWithOwner?.ownerId) {
    const owner = await db.collection('users').findOne({ _id: bizWithOwner.ownerId });
    console.log('\n👤 Sample owner lookup:');
    console.log('  name:', owner?.name);
    console.log('  email:', owner?.email);
    console.log('  role:', owner?.role);
  }

  process.exit(0);
}

checkVerificationDB().catch(err => { console.error(err); process.exit(1); });
