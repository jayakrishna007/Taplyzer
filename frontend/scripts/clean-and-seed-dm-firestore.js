/**
 * scripts/clean-and-seed-dm-firestore.js
 * Wipes out dummy data and seeds 20 high-fidelity Digital Marketing offering users in Firestore.
 */
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = require('dotenv').parse(fs.readFileSync(envPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
  console.log("✅ Loaded environment variables from .env.local");
} else {
  console.warn("⚠️ .env.local not found. Using system environment variables.");
}

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!admin.apps.length) {
  if (clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
    });
  } else {
    admin.initializeApp({
      projectId,
    });
  }
}

const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });
console.log(`✅ Connected to Firestore (Project: ${projectId})`);

// Helper to generate a fake 1536-dim embedding vector based on a string seed
function fakeEmbedding(seedStr) {
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) {
    seed += seedStr.charCodeAt(i);
  }
  const arr = Array.from({ length: 1536 }, (_, i) => Math.sin(seed * 1000 + i) * 0.5);
  const mag = Math.sqrt(arr.reduce((s, v) => s + v * v, 0));
  return arr.map((v) => v / mag);
}

// 20 Digital Marketing handcrafted profiles
const DM_PROFILES = [
  {
    name: "Rohan Mehta",
    companyName: "ScaleUp Ads",
    city: "Bangalore",
    offering: "Meta Ads, Google Ads, PPC Management, landing page design, conversion rate optimization.",
    intent: "Seeking SaaS and e-commerce companies struggling to scale their ad campaigns or achieve positive ROAS.",
    offeringGoal: "To scale clients' ad-driven monthly recurring revenue by at least 25% through performance ad management.",
    offeringsList: ["Meta Ads", "Google Ads", "PPC Management", "Landing Page Design", "CRO"],
    needsList: ["SaaS Clients", "E-commerce Brands", "Copywriters"],
  },
  {
    name: "Aisha Sen",
    companyName: "SEO Catalyst",
    city: "Mumbai",
    offering: "SEO Optimization, content marketing, technical SEO audit, high-authority backlink building.",
    intent: "Looking for manufacturing exporters and fintech platforms looking to drive organic traffic and inbound leads.",
    offeringGoal: "To rank clients' high-value commercial keywords on the first page of Google within 6 months.",
    offeringsList: ["SEO Optimization", "Content Marketing", "Technical SEO", "Backlink Building"],
    needsList: ["Fintech Startups", "Manufacturing Exporters", "SEO Writers"],
  },
  {
    name: "Kabir Malhotra",
    companyName: "ViralVibe Studios",
    city: "Delhi",
    offering: "Influencer marketing, TikTok and Instagram Reels production, social media strategy, short-form video creation.",
    intent: "Seeking D2C fashion, lifestyle, and consumer tech brands wanting to go viral and build social proof.",
    offeringGoal: "To produce 15 high-engaging ad creatives per month that lower CAC by 40% via organic social loops.",
    offeringsList: ["Influencer Marketing", "Instagram Reels", "Short-form Video", "Social Strategy"],
    needsList: ["D2C Brands", "Creative Designers", "Video Editors"],
  },
  {
    name: "Ananya Nair",
    companyName: "ContentCraft",
    city: "Hyderabad",
    offering: "B2B Content strategy, whitepapers, case studies, corporate blogging, newsletters, content distribution.",
    intent: "Looking for professional services, consultancies, or software enterprise companies looking to establish authority.",
    offeringGoal: "To build comprehensive white-hat content funnels that attract and nurture enterprise prospects.",
    offeringsList: ["Content Strategy", "Whitepapers", "Case Studies", "Corporate Blogging"],
    needsList: ["Enterprise Software Firms", "MarTech Clients", "Subject Matter Experts"],
  },
  {
    name: "Vikram Goel",
    companyName: "LeadForge",
    city: "Gurgaon",
    offering: "B2B lead generation, LinkedIn cold outreach, email marketing campaigns, sales development outsourcing.",
    intent: "Seeking agency owners and high-ticket B2B service firms looking for a consistent pipeline of qualified sales calls.",
    offeringGoal: "To deliver 10-15 highly qualified, double-opt-in sales appointments per month via personalized multi-channel playbooks.",
    offeringsList: ["B2B Lead Generation", "LinkedIn Outreach", "Email Campaigns", "Sales Development"],
    needsList: ["Agency Owners", "Consultants", "Sales Closers"],
  },
  {
    name: "Zoya Rahman",
    companyName: "InboxMagic",
    city: "Pune",
    offering: "Email automation, Klaviyo setup, newsletter copywriting, customer lifecycle marketing, cart abandonment flows.",
    intent: "Seeking e-commerce and Shopify store owners who want to boost their repeat purchase rate and email-attributed revenue.",
    offeringGoal: "To drive 30%+ of total store revenue purely through automated lifecycle flows and highly engaging newsletter sends.",
    offeringsList: ["Email Automation", "Klaviyo Setup", "Copywriting", "Customer Retention"],
    needsList: ["Shopify Store Owners", "Graphic Designers", "Copywriters"],
  },
  {
    name: "Aditya Joshi",
    companyName: "ROIMinds",
    city: "Noida",
    offering: "Performance marketing, programmatic advertising, Facebook ad scaling, YouTube ads, media buying.",
    intent: "Looking for funded startups and growth-stage companies looking to deploy large-scale digital advertising budgets.",
    offeringGoal: "To optimize media budgets of over 5L/month to maintain customer acquisition costs within target ranges.",
    offeringsList: ["Performance Marketing", "Programmatic Ads", "YouTube Ads", "Media Buying"],
    needsList: ["Funded Startups", "Growth Stage Brands", "Video Animators"],
  },
  {
    name: "Neha Saxena",
    companyName: "BrandStory Agency",
    city: "Kolkata",
    offering: "Public relations, digital PR, media outreach, press release distribution, brand strategy, reputation management.",
    intent: "Seeking tech founders and established companies needing high-impact media placements, feature articles, and interview slots.",
    offeringGoal: "To secure tier-1 media placements (YourStory, Inc42, Economic Times) that amplify company authority and valuations.",
    offeringsList: ["Public Relations", "Digital PR", "Media Outreach", "Brand Strategy"],
    needsList: ["Tech Founders", "SaaS Startups", "Journalist Contacts"],
  },
  {
    name: "Arjun Kapoor",
    companyName: "MarTech Stackers",
    city: "Chennai",
    offering: "Marketing automation setup, Hubspot consulting, CRM integration, analytics dashboards, tracking pixel setup.",
    intent: "Looking for traditional businesses transitioning online or tech companies with broken user tracking and attribution.",
    offeringGoal: "To eliminate attribution errors and save up to 20 hours/week through seamless automation and analytics flows.",
    offeringsList: ["Marketing Automation", "Hubspot Consulting", "CRM Integration", "Analytics Dashboards"],
    needsList: ["Traditional Businesses", "Mid-market Tech Firms", "Web Developers"],
  },
  {
    name: "Sneha Iyer",
    companyName: "VideoPulse",
    city: "Bangalore",
    offering: "YouTube channel growth, professional video editing, explainer video production, motion graphics, video SEO.",
    intent: "Seeking SaaS companies and digital course creators that need highly polished, educational video content.",
    offeringGoal: "To grow client YouTube channels to 10k+ subscribers and boost organic video conversions.",
    offeringsList: ["YouTube Strategy", "Video Editing", "Explainer Videos", "Motion Graphics"],
    needsList: ["SaaS Brands", "Course Creators", "Scriptwriters"],
  },
  {
    name: "Tanmay Rao",
    companyName: "AdOptimize",
    city: "Ahmedabad",
    offering: "Conversion rate optimization, user experience testing, landing page copywriting, heatmaps analysis, A/B testing.",
    intent: "Seeking high-traffic e-commerce websites and lead generation pages suffering from low sign-up or checkout conversion rates.",
    offeringGoal: "To increase website-wide conversion rates by at least 1.5x within 90 days via systematic multivariate A/B testing.",
    offeringsList: ["CRO", "User Experience Testing", "Landing Page Copywriting", "A/B Testing"],
    needsList: ["High-traffic E-commerce Sites", "SaaS Landing Pages", "Web Designers"],
  },
  {
    name: "Priya Sharma",
    companyName: "SocialSphere",
    city: "Kolkata",
    offering: "Organic social media management, community building, LinkedIn personal branding, Twitter growth, brand aesthetics.",
    intent: "Seeking venture capitalists, executives, and agency founders who want to build highly influential personal brands online.",
    offeringGoal: "To organically scale executive profiles to 50k+ followers, turning social reach into organic business inquiries.",
    offeringsList: ["Social Media Management", "Personal Branding", "Twitter Growth", "Community Building"],
    needsList: ["VC Partners", "B2B Executives", "Graphic Designers"],
  },
  {
    name: "Rajat Varma",
    companyName: "SearchEngineers",
    city: "Bangalore",
    offering: "Technical SEO, site speed optimization, schema markup implementation, international SEO, website migration.",
    intent: "Seeking large-scale e-commerce stores or media publishers experiencing a sudden drop in Google organic search traffic.",
    offeringGoal: "To fix indexation errors and boost site speed load times under 1.5 seconds to comply with Core Web Vitals.",
    offeringsList: ["Technical SEO", "Site Speed Optimization", "Schema Markup", "Website Migration"],
    needsList: ["E-commerce Giants", "Online Media Publishers", "Next.js Developers"],
  },
  {
    name: "Meera Deshmukh",
    companyName: "FunnelArchitects",
    city: "Pune",
    offering: "Sales funnel strategy, automated webinars setup, lead magnet creation, online course launch consulting.",
    intent: "Seeking coaches, consultants, and knowledge commerce platforms needing high-converting automated sales pipelines.",
    offeringGoal: "To deploy fully integrated webinar and landing page funnels that convert cold traffic into paid clients on autopilot.",
    offeringsList: ["Sales Funnel Strategy", "Webinar Setup", "Lead Magnets", "Launch Consulting"],
    needsList: ["Coaches & Consultants", "Infoproduct Creators", "Activecampaign Experts"],
  },
  {
    name: "Siddharth Roy",
    companyName: "MarTech AI",
    city: "Noida",
    offering: "AI copywriting training, automated content personalization, GPT-model integration for marketing, dynamic email templates.",
    intent: "Seeking marketing departments and content agencies wanting to scale their operations using customized AI assets.",
    offeringGoal: "To double content output while cutting production costs by 50% via enterprise-tailored AI workflow training.",
    offeringsList: ["AI Copywriting", "Content Personalization", "GPT Integrations", "Dynamic Templates"],
    needsList: ["Marketing Agencies", "In-house Marketing Teams", "Python Programmers"],
  },
  {
    name: "Kirti Bansal",
    companyName: "LinkedInLeads",
    city: "Gurgaon",
    offering: "LinkedIn Sales Navigator search, custom prospect lists, cold email sequence writing, calendar scheduling.",
    intent: "Seeking B2B SaaS start-ups and IT outsourcing agencies lacking dedicated in-house sales development representatives (SDRs).",
    offeringGoal: "To build precise prospect lists of 1000+ key decision-makers and maintain a warm B2B cold email response rate above 15%.",
    offeringsList: ["SDR Outsourcing", "Prospect Lists", "LinkedIn Prospecting", "Sequence Writing"],
    needsList: ["SaaS Founders", "IT Outsourcing Agencies", "List Builders"],
  },
  {
    name: "Pranav Shah",
    companyName: "GrowthHackers India",
    city: "Mumbai",
    offering: "Startup growth hacking, user acquisition strategies, viral loop implementation, referral program design.",
    intent: "Seeking early-stage consumer apps and digital networks that need exponential user sign-ups with minimal ad budgets.",
    offeringGoal: "To launch viral referral programs and hooks that drive organic member-get-member growth of 15% week-over-week.",
    offeringsList: ["Growth Hacking", "User Acquisition", "Viral Referral Systems", "Viral Loops"],
    needsList: ["Consumer Apps", "Social Networks", "Fullstack Developers"],
  },
  {
    name: "Riya Dutta",
    companyName: "CreativesFirst",
    city: "Kolkata",
    offering: "Ad creative design, static banner assets, video ad scripting, Canva templates, conversion-centric visual layouts.",
    intent: "Seeking media buyers and digital agencies running high-budget paid social campaigns that are suffering from ad fatigue.",
    offeringGoal: "To provide a fresh batch of 30+ highly-stylized, scroll-stopping ad creatives every week to scale performance campaigns.",
    offeringsList: ["Ad Creative Design", "Video Scripts", "Asset Banner Packs", "Visual Layouts"],
    needsList: ["Media Buyers", "Performance Agencies", "Visual Illustrators"],
  },
  {
    name: "Varun Grover",
    companyName: "ExportersSEO",
    city: "Delhi",
    offering: "International SEO, multilingual search optimization, global market keyword mapping, translation advisory.",
    intent: "Seeking manufacturing exporters, handicraft exporters, and global SaaS companies targeting audiences in multiple languages.",
    offeringGoal: "To build localized search visibility in Germany, France, and Spain, driving inbound global partner inquiries.",
    offeringsList: ["International SEO", "Multilingual Search", "Keyword Mapping", "Localization"],
    needsList: ["Global SaaS Brands", "Manufacturing Exporters", "Native Translators"],
  },
  {
    name: "Ishita Paul",
    companyName: "KlaviyoFlows",
    city: "Bangalore",
    offering: "Klaviyo automation, Shopify integrations, SMS marketing setup, push notification campaigns, VIP customer programs.",
    intent: "Seeking D2C e-commerce brands with strong store traffic that aren't fully leveraging their existing email list for sales.",
    offeringGoal: "To recapture lost checkouts and drive repeat purchases to increase baseline sales by 20% within 45 days.",
    offeringsList: ["Klaviyo Automation", "Shopify Integrations", "SMS Marketing", "Push Notifications"],
    needsList: ["D2C Brands", "Shopify Store Owners", "Copywriters"],
  }
];

async function cleanAndSeed() {
  try {
    const collectionsToClear = ["users", "businesses", "intents", "offerings", "matchrecords"];
    console.log(`🧹 Starting Firestore cleanup...`);

    // 1. Clear collections except master user
    const masterUserId = "660a1b2c3d4e5f6a7b8c9d0e";

    for (const collName of collectionsToClear) {
      const snap = await db.collection(collName).get();
      const batch = db.batch();
      let deleted = 0;

      snap.docs.forEach((doc) => {
        // Keep master user from deletion
        if (collName === "users" && doc.id === masterUserId) return;
        if (collName === "businesses" && doc.data().ownerId === masterUserId) return;
        if (collName === "intents" && doc.data().userId === masterUserId) return;
        if (collName === "offerings" && doc.data().userId === masterUserId) return;

        batch.delete(doc.ref);
        deleted++;
      });

      if (deleted > 0) {
        await batch.commit();
        console.log(`   Deleted ${deleted} documents from "${collName}"`);
      } else {
        console.log(`   No dummy documents to delete from "${collName}"`);
      }
    }

    console.log("✅ Cleanup complete!");

    // 2. Ensure Master User exists and is fully populated
    console.log("👤 Setting up Master User (Taplyzer Admin)...");
    const masterUserDoc = {
      name: "Taplyzer Admin",
      email: "admin@taplyzer.com",
      phone: "9876543210",
      role: "SUPER_ADMIN",
      verified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await db.collection("users").doc(masterUserId).set(masterUserDoc, { merge: true });

    const masterBizDoc = {
      ownerId: masterUserId,
      ownerName: "Taplyzer Admin",
      companyName: "Taplyzer Corp",
      industry: "Software",
      location: { city: "Bangalore", state: "Karnataka", country: "India", operatesIn: "National" },
      offerings: ["Next.js App Development", "Matchmaking AI Engine", "B2B SaaS Portal"],
      needs: ["Digital Marketing", "Enterprise Clients", "Strategic Partners"],
      offeringGoal: "To provide the ultimate B2B matching ecosystem for agencies and software builders.",
      intent: {
        currentGoal: "Looking for high-caliber Digital Marketing agencies for strategic collaboration and client referrals.",
        priority: "High",
        timeline: "Within 1 month"
      },
      trust: {
        verificationStatus: "Business Verified",
        website: "https://taplyzer.com"
      },
      isProfileCompleted: true,
      profileScore: 95
    };
    // Upsert business for master user
    const masterBizSnap = await db.collection("businesses").where("ownerId", "==", masterUserId).get();
    if (masterBizSnap.empty) {
      await db.collection("businesses").add(masterBizDoc);
    } else {
      await masterBizSnap.docs[0].ref.set(masterBizDoc, { merge: true });
    }

    console.log("✅ Master User profile configured.");

    // 3. Seed 20 Digital Marketing Users
    console.log(`🌱 Seeding 20 digital marketing offering profiles...`);
    let count = 0;

    for (const p of DM_PROFILES) {
      // Create user
      const userRef = await db.collection("users").add({
        name: p.name,
        email: `${p.name.replace(/\s+/g, "").toLowerCase()}@example.com`,
        phone: `99990${String(count).padStart(5, '0')}`,
        role: "USER",
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const userId = userRef.id;

      // Create business profile
      await db.collection("businesses").add({
        ownerId: userId,
        ownerName: p.name,
        companyName: p.companyName,
        industry: "Digital Marketing",
        location: {
          city: p.city,
          state: p.city === "Mumbai" || p.city === "Pune" ? "Maharashtra" :
                 p.city === "Delhi" || p.city === "Gurgaon" || p.city === "Noida" ? "NCR" :
                 p.city === "Bangalore" ? "Karnataka" : "Other",
          country: "India",
          operatesIn: "National"
        },
        offerings: p.offeringsList,
        needs: p.needsList,
        offeringGoal: p.offeringGoal,
        intent: {
          currentGoal: p.intent,
          priority: "High",
          timeline: "Within 3 months"
        },
        trust: {
          verificationStatus: "Business Verified",
          website: `https://www.${p.companyName.toLowerCase().replace(/\s+/g, "")}.com`
        },
        isProfileCompleted: true,
        profileScore: 90
      });

      // Create Intent (Vector DB Simulation)
      await db.collection("intents").add({
        userId: userId,
        text: p.intent,
        embedding: fakeEmbedding(p.intent),
        createdAt: new Date()
      });

      // Create Offering (Vector DB Simulation)
      await db.collection("offerings").add({
        userId: userId,
        text: p.offering,
        embedding: fakeEmbedding(p.offering),
        createdAt: new Date()
      });

      count++;
    }

    console.log(`\n🎉 Successfully wiped database and seeded ${count} premium Digital Marketing profiles!`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Cleanup/Seeding failed:", err);
    process.exit(1);
  }
}

cleanAndSeed();
