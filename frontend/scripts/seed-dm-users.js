/**
 * scripts/seed-dm-users.js
 * Generates 50 Digital Marketing focused users and business profiles.
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dns = require('node:dns');

// Fix for Windows/Next.js environment
try { dns.setServers(["1.1.1.1", "8.8.8.8"]); } catch(e) {}

const MONGO_URI = 'mongodb+srv://Tapadmin:tap123@cluster0.i0sga0f.mongodb.net/?appName=Cluster0';

const CITIES = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad", "Gurgaon", "Noida"];
const SERVICES = [
  "SEO Optimization", "Google Ads Management", "Meta Ads", "LinkedIn Marketing", 
  "Content Strategy", "Influencer Marketing", "Video Production", "Email Automation", 
  "CRO (Conversion Rate Optimization)", "Performance Marketing", "Social Media Management",
  "App Store Optimization", "Programmatic Advertising", "Brand Strategy"
];
const NEEDS = ["Clients", "Strategic Partners", "Funding", "Media Buyers", "Content Creators", "White-label Partners"];
const SUB_INDUSTRIES = ["Performance Marketing", "Brand Agency", "Content Studio", "MarTech Solutions"];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    const users = [];
    const businesses = [];

    for (let i = 1; i <= 50; i++) {
      const city = CITIES[Math.floor(Math.random() * CITIES.length)];
      const subInd = SUB_INDUSTRIES[Math.floor(Math.random() * SUB_INDUSTRIES.length)];
      
      // Randomly pick 3-5 services
      const myServices = [...SERVICES].sort(() => 0.5 - Math.random()).slice(0, 3 + Math.floor(Math.random() * 3));
      const myNeeds = [...NEEDS].sort(() => 0.5 - Math.random()).slice(0, 2);

      const userId = new mongoose.Types.ObjectId();
      const userName = `DM expert ${i} - ${city}`;
      const email = `dm.expert${i}.${city.toLowerCase()}@example.com`;

      const verificationPool = ["Not Verified", "Basic Verified", "Business Verified", "Trusted Partner"];
      const vStatus = verificationPool[Math.random() > 0.5 ? Math.floor(Math.random() * 4) : 0]; // Weight towards unverified but variety exists

      users.push({
        _id: userId,
        name: userName,
        email: email,
        password: hashedPassword,
        designation: "Managing Director",
        phone: `98765${i.toString().padStart(5, '0')}`,
        role: "USER",
        status: "ACTIVE",
        verified: vStatus === "Trusted Partner" || vStatus === "Business Verified",
        businessDescription: `Premier ${subInd} agency based in ${city} focusing on ROI-driven campaigns and ${myServices[0]}.`,
        activelyLookingFor: "Clients",
        profileCompletenessScore: 70 + Math.floor(Math.random() * 30),
        subscriptionPlan: i % 10 === 0 ? "PRO" : "FREE"
      });

      businesses.push({
        ownerId: userId,
        ownerName: userName,
        companyName: `${city} Digital Solutions ${i}`,
        brandName: `${city}Media`,
        industry: "Digital Marketing",
        subIndustry: subInd,
        businessType: "Service Provider",
        location: {
          city: city,
          state: city === "Mumbai" || city === "Pune" ? "Maharashtra" : 
                 city === "Delhi" || city === "Gurgaon" || city === "Noida" ? "NCR" :
                 city === "Bangalore" ? "Karnataka" : "Other",
          country: "India",
          operatesIn: Math.random() > 0.4 ? "National" : "Global"
        },
        offerings: myServices,
        needs: myNeeds,
        intent: {
          currentGoal: `Scaling client base for ${myServices[0]} and expanding into ${city} market.`,
          priority: "High",
          timeline: "3 months"
        },
        trust: {
          verificationStatus: vStatus,
          website: `https://${city.toLowerCase()}dm${i}.com`
        },
        isProfileCompleted: true,
        profileScore: 85
      });
    }

    // Insert to DB
    await mongoose.connection.db.collection('users').insertMany(users);
    await mongoose.connection.db.collection('businesses').insertMany(businesses);

    console.log(`\n🎉 Successfully seeded 50 Digital Marketing users and profiles!`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
