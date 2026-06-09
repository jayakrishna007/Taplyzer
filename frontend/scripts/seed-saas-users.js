/**
 * scripts/seed-saas-users.js
 * Generates 50 SaaS and IT Services focused users and business profiles.
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dns = require('node:dns');

try { dns.setServers(["1.1.1.1", "8.8.8.8"]); } catch(e) {}

const MONGO_URI = 'mongodb+srv://Tapadmin:tap123@cluster0.i0sga0f.mongodb.net/?appName=Cluster0';

const CITIES = ["Bangalore", "Hyderabad", "Pune", "Gurgaon", "San Francisco", "London", "Singapore", "Dubai", "New York", "Tel Aviv"];
const OFFERINGS = [
  "CRM SaaS", "ERP Solutions", "Cybersecurity Suite", "Cloud Infrastructure (IaaS)", 
  "HRMS Platform", "FinTech APIs", "AI/ML Model Training", "DevOps Automation Tools", 
  "Managed IT Services", "Custom Software Development", "Mobile App Dev (iOS/Android)", 
  "Blockchain Infrastructure", "Predictive Analytics Dashboard", "E-commerce Engine"
];
const NEEDS = ["Enterprise Clients", "Beta Testers", "AWS/Azure Credits", "UI/UX Designers", "API Integrations", "Security Audits", "Series A Funding"];
const SUB_INDUSTRIES = ["FinTech", "HealthTech", "EdTech", "CyberSecurity", "DevOps", "Web3"];

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
      
      const myOfferings = [...OFFERINGS].sort(() => 0.5 - Math.random()).slice(0, 3 + Math.floor(Math.random() * 2));
      const myNeeds = [...NEEDS].sort(() => 0.5 - Math.random()).slice(0, 2);

      const userId = new mongoose.Types.ObjectId();
      const userName = `SaaS Founder ${i} - ${city}`;
      const email = `saas.founder${i}.${city.toLowerCase().replace(' ', '')}@example.com`;

      const verificationPool = ["Not Verified", "Basic Verified", "Business Verified", "Trusted Partner"];
      const vStatus = verificationPool[Math.random() > 0.3 ? Math.floor(Math.random() * 4) : 1]; // SaaS often verified

      users.push({
        _id: userId,
        name: userName,
        email: email,
        password: hashedPassword,
        designation: "CTO / Founder",
        phone: `+1-555-01${i.toString().padStart(3, '0')}`,
        role: "USER",
        status: "ACTIVE",
        verified: vStatus !== "Not Verified",
        businessDescription: `Scale-stage ${subInd} startup building ${myOfferings[0]} for global enterprises. Based in ${city}.`,
        activelyLookingFor: Math.random() > 0.5 ? "Partners" : "Investors",
        profileCompletenessScore: 80 + Math.floor(Math.random() * 20),
        subscriptionPlan: i % 5 === 0 ? "ENTERPRISE" : "PRO"
      });

      businesses.push({
        ownerId: userId,
        ownerName: userName,
        companyName: `${city} ${subInd} Tech ${i}`,
        brandName: `${subInd}Flow`,
        industry: "SaaS",
        subIndustry: subInd,
        businessType: "Product Company",
        location: {
          city: city,
          state: "Global",
          country: ["Bangalore", "Hyderabad", "Pune", "Gurgaon"].includes(city) ? "India" : 
                   ["San Francisco", "New York"].includes(city) ? "USA" : "International",
          operatesIn: "Global"
        },
        offerings: myOfferings,
        needs: myNeeds,
        intent: {
          currentGoal: `Seeking ${myNeeds[0]} to accelerate our ${myOfferings[0]} roadmap.`,
          priority: "Immediate",
          timeline: "6 months"
        },
        trust: {
          verificationStatus: vStatus,
          website: `https://get${subInd.toLowerCase()}${i}.io`
        },
        isProfileCompleted: true,
        profileScore: 90
      });
    }

    await mongoose.connection.db.collection('users').insertMany(users);
    await mongoose.connection.db.collection('businesses').insertMany(businesses);

    console.log(`\n🚀 Successfully seeded 50 SaaS & IT Services profiles!`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
