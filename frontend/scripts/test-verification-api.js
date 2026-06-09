const mongoose = require('mongoose');
const dns = require('node:dns');

try { dns.setServers(["1.1.1.1", "8.8.8.8"]); } catch (e) {}

const MONGO_URI = 'mongodb+srv://Tapadmin:tap123@cluster0.i0sga0f.mongodb.net/?appName=Cluster0';

async function testApiQuery() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected\n');

  const db = mongoose.connection;

  // Simulate exactly what the API does: GET all businesses, populate ownerId
  console.log('=== Simulating API GET /api/admin/verification ===\n');

  const businesses = await db.collection('businesses').aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'ownerId',
        foreignField: '_id',
        as: 'ownerData'
      }
    },
    { $sort: { createdAt: -1 } },
    { $limit: 5 },
    {
      $project: {
        companyName: 1,
        brandName: 1,
        industry: 1,
        status: 1,
        'trust.verificationStatus': 1,
        'trust.website': 1,
        'trust.linkedin': 1,
        'trust.gst': 1,
        'location.city': 1,
        'strength.teamSize': 1,
        ownerName: 1,
        'ownerData.name': 1,
        'ownerData.email': 1,
        'ownerData.role': 1,
        createdAt: 1,
      }
    }
  ]).toArray();

  console.log(`Returned ${businesses.length} businesses:\n`);
  businesses.forEach((b, i) => {
    const owner = b.ownerData?.[0];
    console.log(`[${i+1}] ${b.companyName || b.brandName || 'NO NAME'}`);
    console.log(`    verificationStatus: ${b.trust?.verificationStatus || '⚠️ MISSING'}`);
    console.log(`    status: ${b.status}`);
    console.log(`    owner: ${owner?.name || 'NOT FOUND'} (${owner?.email || '—'})`);
    console.log(`    city: ${b.location?.city || '—'}`);
    console.log();
  });

  // Check what the 7 missing ones look like
  const missing = await db.collection('businesses').find({
    $or: [
      { 'trust.verificationStatus': { $exists: false } },
      { 'trust': { $exists: false } }
    ]
  }).limit(3).toArray();

  if (missing.length > 0) {
    console.log(`\n⚠️  Businesses missing verificationStatus (${missing.length} total shown):`);
    missing.forEach(b => {
      console.log(`  - ${b.companyName || b.brandName || b._id}: trust=${JSON.stringify(b.trust)}`);
    });

    // FIX: set trust.verificationStatus = "Not Verified" for all missing
    console.log('\n🔧 Fixing missing trust.verificationStatus...');
    const result = await db.collection('businesses').updateMany(
      {
        $or: [
          { 'trust.verificationStatus': { $exists: false } },
          { 'trust': { $exists: false } }
        ]
      },
      { $set: { 'trust.verificationStatus': 'Not Verified' } }
    );
    console.log(`✅ Fixed ${result.modifiedCount} businesses → set to "Not Verified"`);
  } else {
    console.log('✅ All businesses have trust.verificationStatus set');
  }

  process.exit(0);
}

testApiQuery().catch(err => { console.error(err); process.exit(1); });
