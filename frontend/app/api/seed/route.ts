import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Business from "@/models/Business";
import Intent from "@/models/Intent";
import Offering from "@/models/Offering";
import MatchRecord from "@/models/MatchRecord";

export const dynamic = "force-dynamic";

// Helper to generate a fake 1536-dim embedding vector based on a string seed
function fakeEmbedding(seedStr: string) {
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) {
    seed += seedStr.charCodeAt(i);
  }
  const arr = Array.from({ length: 1536 }, (_, i) => Math.sin(seed * 1000 + i) * 0.5);
  const mag = Math.sqrt(arr.reduce((s, v) => s + v * v, 0));
  return arr.map((v) => v / mag);
}

// 50 Handcrafted B2B Profiles for Lexical (BM25) and Semantic testing
const rawProfiles = [
  // SOFTWARE (1-10)
  { name: "Aarav Sharma", companyName: "LogisticsAI Solutions", industry: "Software", city: "Bangalore", intent: "Seeking logistics companies to pilot our new AI-driven supply chain management software.", offering: "AI-driven supply chain management software, route optimization API, and predictive analytics for freight." },
  { name: "Priya Patel", companyName: "WhiteCRM", industry: "Software", city: "Pune", intent: "Looking for marketing agencies needing white-label CRM solutions for their clients.", offering: "White-label CRM platform, automated email workflows, and sales funnel tracking dashboards." },
  { name: "Rahul Verma", companyName: "CloudSecure", industry: "Software", city: "Hyderabad", intent: "Seeking fintech startups that require secure cloud infrastructure setup and compliance auditing.", offering: "Cloud infrastructure provisioning, AWS/Azure migration, and SOC2 compliance automation services." },
  { name: "Ananya Iyer", companyName: "HealthSync API", industry: "Software", city: "Chennai", intent: "Need healthcare providers for testing our patient data interoperability API.", offering: "Healthcare API integration, EHR data syncing, and HIPAA-compliant patient portals." },
  { name: "Vikram Singh", companyName: "BespokeERP", industry: "Software", city: "Delhi", intent: "Looking for manufacturing firms that need bespoke ERP implementation.", offering: "Custom ERP development, legacy system modernization, and inventory management software." },
  { name: "Sneha Reddy", companyName: "ChatOps AI", industry: "Software", city: "Bangalore", intent: "Seeking e-commerce brands for beta testing our AI chatbot for customer support.", offering: "AI chatbots, natural language processing for customer service, and 24/7 automated ticketing." },
  { name: "Rohan Desai", companyName: "PropManage SaaS", industry: "Software", city: "Mumbai", intent: "Looking for real estate agencies that need property management software.", offering: "SaaS for real estate management, tenant screening, and automated rent collection." },
  { name: "Neha Gupta", companyName: "HRCloud", industry: "Software", city: "Noida", intent: "Seeking HR consulting firms to partner on our payroll and compliance software.", offering: "Cloud-based HRMS, automated payroll processing, and employee onboarding platforms." },
  { name: "Karan Johar", companyName: "EduScale LMS", industry: "Software", city: "Gurgaon", intent: "Looking for educational institutions to deploy our Learning Management System (LMS).", offering: "Scalable Learning Management Systems, virtual classroom integrations, and student tracking analytics." },
  { name: "Meera Nair", companyName: "CyberTest Auto", industry: "Software", city: "Bangalore", intent: "Seeking cybersecurity firms to bundle our penetration testing automation tool.", offering: "Automated penetration testing software, vulnerability scanning, and threat intelligence feeds." },

  // MARKETING (11-20)
  { name: "Aditya Menon", companyName: "B2B Leads Pro", industry: "Marketing", city: "Mumbai", intent: "Looking for SaaS companies that need aggressive B2B lead generation and LinkedIn outreach.", offering: "B2B lead generation, LinkedIn cold outreach automation, and account-based marketing (ABM)." },
  { name: "Simran Kaur", companyName: "AdScale Agency", industry: "Marketing", city: "Delhi", intent: "Seeking D2C e-commerce brands struggling with Facebook and Instagram Ad ROAS.", offering: "Performance marketing, Facebook/Instagram ad scaling, and conversion rate optimization (CRO)." },
  { name: "Kunal Bhatia", companyName: "GlobalSEO", industry: "Marketing", city: "Bangalore", intent: "Looking for manufacturing exporters needing international SEO and brand visibility.", offering: "International SEO, technical website audits, and multilingual content strategy." },
  { name: "Pooja Hegde", companyName: "LocalClinic Marketing", industry: "Marketing", city: "Hyderabad", intent: "Seeking healthcare clinics and hospitals for local SEO and patient acquisition.", offering: "Local SEO, Google Business Profile optimization, and local patient acquisition campaigns." },
  { name: "Tarun Kumar", companyName: "FinPR Solutions", industry: "Marketing", city: "Chennai", intent: "Looking for fintech startups that need PR campaigns and brand authority building.", offering: "Public relations, media outreach, press release distribution, and reputation management." },
  { name: "Divya Shah", companyName: "ContentB2B", industry: "Marketing", city: "Pune", intent: "Seeking B2B service providers for content marketing and whitepaper creation.", offering: "Content marketing, whitepapers, case studies, and B2B blog writing services." },
  { name: "Ravi Teja", companyName: "RealEstate 3D", industry: "Marketing", city: "Gurgaon", intent: "Looking for real estate developers needing 3D walkthroughs and digital advertising.", offering: "Real estate digital marketing, 3D virtual tours, and lead generation for property sales." },
  { name: "Anita Bose", companyName: "Hospitality Social", industry: "Marketing", city: "Kolkata", intent: "Seeking hospitality and hotel brands for social media management and influencer marketing.", offering: "Social media management, influencer marketing campaigns, and hospitality branding." },
  { name: "Nitin Agarwal", companyName: "EdTech Ads", industry: "Marketing", city: "Noida", intent: "Looking for edtech companies to scale user acquisition through Google Ads.", offering: "Google Ads management, YouTube advertising, and search engine marketing (SEM)." },
  { name: "Sanya Malhotra", companyName: "Retention Masters", industry: "Marketing", city: "Mumbai", intent: "Seeking fashion retailers for email marketing and retention strategy.", offering: "Email marketing automation, Klaviyo setup, and customer retention strategies." },

  // MANUFACTURING (21-30)
  { name: "Rajesh Khanna", companyName: "Khanna Auto Parts", industry: "Manufacturing", city: "Pune", intent: "Seeking auto parts distributors in North India for our new line of brake pads.", offering: "OEM auto parts manufacturing, high-durability brake pads, and bulk metal forging." },
  { name: "Suresh Pillai", companyName: "EcoPack India", industry: "Manufacturing", city: "Chennai", intent: "Looking for food & beverage brands needing eco-friendly corrugated packaging.", offering: "Corrugated boxes, eco-friendly food packaging, and custom printed cartons." },
  { name: "Amitabh Das", companyName: "Das Heavy Machinery", industry: "Manufacturing", city: "Kolkata", intent: "Seeking heavy machinery dealers and construction firms for excavators.", offering: "Heavy construction machinery, excavator attachments, and industrial steel fabrication." },
  { name: "Manish Jain", companyName: "Jain Textiles", industry: "Manufacturing", city: "Ahmedabad", intent: "Looking for textile exporters and garment brands needing raw cotton yarn.", offering: "High-quality cotton yarn, textile weaving, and bulk fabric manufacturing." },
  { name: "Anil Kapoor", companyName: "Kapoor Electronics", industry: "Manufacturing", city: "Delhi", intent: "Seeking electronics brands needing PCB assembly and contract manufacturing.", offering: "PCB assembly, consumer electronics contract manufacturing, and surface mount technology." },
  { name: "Prakash Jha", companyName: "Jha Pharma Glass", industry: "Manufacturing", city: "Hyderabad", intent: "Looking for pharmaceutical companies requiring glass vials and ampoules.", offering: "Pharmaceutical glass packaging, sterile vials, and laboratory glassware manufacturing." },
  { name: "Sunil Shetty", companyName: "AgroChem Supply", industry: "Manufacturing", city: "Mumbai", intent: "Seeking chemical distributors for our agricultural fertilizers and pesticides.", offering: "Bulk agricultural chemicals, fertilizers, pesticides, and agrochemical formulations." },
  { name: "Gaurav Sharma", companyName: "AlloyForge Cycles", industry: "Manufacturing", city: "Ludhiana", intent: "Looking for bicycle and fitness equipment brands for alloy frame supply.", offering: "Alloy frame forging, bicycle components, and fitness equipment manufacturing." },
  { name: "Ramesh Babu", companyName: "Coimbatore Pumps", industry: "Manufacturing", city: "Coimbatore", intent: "Seeking industrial plants needing water pumps and electric motors.", offering: "Industrial water pumps, heavy-duty electric motors, and agricultural pumping systems." },
  { name: "Vinod Khanna", companyName: "Surat Diamonds", industry: "Manufacturing", city: "Surat", intent: "Looking for jewelry retailers for wholesale supply of synthetic diamonds.", offering: "Lab-grown diamonds, synthetic gemstone manufacturing, and wholesale jewelry." },

  // FINANCE & LEGAL (31-40)
  { name: "Rishabh Jain", companyName: "VentureDebt Partners", industry: "Finance", city: "Mumbai", intent: "Seeking tech startups looking for Series A funding or venture debt.", offering: "Venture debt financing, startup valuation advisory, and pitch deck preparation." },
  { name: "Kavita Rao", companyName: "SME Credit Co", industry: "Finance", city: "Bangalore", intent: "Looking for SMEs needing working capital loans and invoice discounting.", offering: "Working capital loans, invoice discounting, and SME credit facilities." },
  { name: "Siddharth Menon", companyName: "Menon Wealth", industry: "Finance", city: "Delhi", intent: "Seeking high-net-worth individuals for portfolio management and wealth advisory.", offering: "Wealth management, mutual fund advisory, and customized investment portfolios." },
  { name: "Ayesha Khan", companyName: "Global Trade Finance", industry: "Finance", city: "Hyderabad", intent: "Looking for manufacturing firms needing export finance and letter of credit services.", offering: "Trade finance, export factoring, and letter of credit issuance." },
  { name: "Arun Jaitley", companyName: "Outsource Accounting", industry: "Finance", city: "Pune", intent: "Seeking retail businesses for outsourced accounting and GST filing services.", offering: "Outsourced accounting, bookkeeping, GST compliance, and tax advisory." },
  { name: "Deepak Chahar", companyName: "IP Shield Legal", industry: "Legal", city: "Delhi", intent: "Looking for tech companies needing IP protection, trademark, and patent filing.", offering: "Intellectual property law, trademark registration, and patent filing services." },
  { name: "Smriti Irani", companyName: "FDI Legal Advisors", industry: "Legal", city: "Mumbai", intent: "Seeking foreign enterprises looking to establish subsidiaries in India (FDI compliance).", offering: "Corporate law, FDI compliance, company incorporation, and legal structuring." },
  { name: "Harish Salve", companyName: "Startup Legal Counsel", industry: "Legal", city: "Bangalore", intent: "Looking for startups needing co-founder agreements and employee ESOP drafting.", offering: "Startup legal counsel, ESOP structuring, and term sheet negotiations." },
  { name: "Nisha Desai", companyName: "Real Estate Law Firm", industry: "Legal", city: "Ahmedabad", intent: "Seeking real estate developers for land acquisition due diligence and contract drafting.", offering: "Real estate law, property due diligence, and commercial lease agreements." },
  { name: "Kapil Sibal", companyName: "Labor Law Consultants", industry: "Legal", city: "Chennai", intent: "Looking for manufacturing businesses facing labor disputes or compliance audits.", offering: "Labor law compliance, dispute resolution, and industrial relations consulting." },

  // LOGISTICS & SUPPLY CHAIN (41-50)
  { name: "Arvind Kejriwal", companyName: "Delhi Last Mile", industry: "Logistics", city: "Delhi", intent: "Seeking e-commerce brands needing last-mile delivery and reverse logistics in North India.", offering: "Last-mile delivery, reverse logistics, and cash-on-delivery (COD) management." },
  { name: "Mamata Banerjee", companyName: "Bengal Cold Chain", industry: "Logistics", city: "Kolkata", intent: "Looking for agricultural exporters needing cold chain logistics and reefer trucks.", offering: "Cold chain logistics, refrigerated transport, and perishable goods warehousing." },
  { name: "Yogi Adityanath", companyName: "UP 3PL Warehousing", industry: "Logistics", city: "Lucknow", intent: "Seeking FMCG companies needing warehouse space and 3PL services in UP.", offering: "3PL warehousing, inventory management, and regional distribution centers." },
  { name: "Pinarayi Vijayan", companyName: "Kochi Freight Forwarders", industry: "Logistics", city: "Kochi", intent: "Looking for importers requiring customs clearance and freight forwarding at Kochi port.", offering: "Customs brokerage, ocean freight forwarding, and port handling services." },
  { name: "Uddhav Thackeray", companyName: "Mumbai Air Cargo", industry: "Logistics", city: "Mumbai", intent: "Seeking pharmaceutical companies for temperature-controlled air freight.", offering: "Temperature-controlled air freight, pharma logistics, and express cargo." },
  { name: "Nitish Kumar", companyName: "Patna Heavy Haulage", industry: "Logistics", city: "Patna", intent: "Looking for construction firms needing flatbed trucks for heavy equipment transport.", offering: "Heavy haulage, flatbed trucking, and oversized cargo transportation." },
  { name: "Ashok Gehlot", companyName: "Jaipur Surface Transport", industry: "Logistics", city: "Jaipur", intent: "Seeking textile manufacturers needing B2B freight shipping to major cities.", offering: "B2B surface transport, full truckload (FTL), and less-than-truckload (LTL) shipping." },
  { name: "Naveen Patnaik", companyName: "Odisha Bulk Minerals", industry: "Logistics", city: "Bhubaneswar", intent: "Looking for mining companies needing bulk mineral transport via rail and road.", offering: "Bulk material transport, rail freight forwarding, and mining logistics." },
  { name: "Himanta Biswa", companyName: "Assam Tea Export Logistics", industry: "Logistics", city: "Guwahati", intent: "Seeking tea estates needing specialized export packaging and shipping logistics.", offering: "Export packaging, international shipping, and specialized agricultural logistics." },
  { name: "Bhagwant Mann", companyName: "Punjab Auto Carriers", industry: "Logistics", city: "Chandigarh", intent: "Looking for auto manufacturers needing car carrier transport services.", offering: "Auto transport, multi-car carriers, and vehicle logistics." }
];

export async function GET() {
  try {
    await dbConnect();

    const userCount = await User.countDocuments();
    if (userCount > 10) {
      return NextResponse.json({
        success: true,
        message: `Database already has ${userCount} users. Skipping seed.`,
      });
    }

    // 1. Only delete if we are actually seeding (optional, better to just not delete)
    // Removed deleteMany calls to prevent wiping real users during accidental seeds.

    const createdUsers = [];

    // 2. Insert 50 Profiles
    for (const p of rawProfiles) {
      // Randomize activity & verification for variety in scoring
      const isVerified = Math.random() > 0.3; // 70% verified
      const daysAgo = Math.floor(Math.random() * 45); // 0 to 45 days ago

      // Create User
      const user = await User.create({
        name: p.name,
        email: `${p.name.replace(/\s+/g, "").toLowerCase()}@example.com`,
        password: "hashedpassword123", // Dummy
        lastActive: new Date(Date.now() - daysAgo * 86400000),
        verified: isVerified,
      });

      createdUsers.push(user);

      // Create Business Profile for User
      await Business.create({
        ownerId: user._id,
        ownerName: p.name,
        companyName: p.companyName,
        industry: p.industry,
        location: { city: p.city, state: "", country: "India", operatesIn: "National" },
        offerings: ["Service"],
        needs: ["Client"],
        intent: { currentGoal: p.intent },
        trust: { verificationStatus: isVerified ? "Business Verified" : "Not Verified" },
        isProfileCompleted: true,
      });

      // Create Match Engine Intent (Vector DB Simulation)
      await Intent.create({
        userId: user._id,
        text: p.intent,
        embedding: fakeEmbedding(p.intent),
      });

      // Create Match Engine Offering (Vector DB Simulation)
      await Offering.create({
        userId: user._id,
        text: p.offering,
        embedding: fakeEmbedding(p.offering),
      });
    }

    // Also create a master test user (the one used in the frontend code right now: 660a1b2c3d4e5f6a7b8c9d0e)
    const masterId = "660a1b2c3d4e5f6a7b8c9d0e";
    await User.findByIdAndUpdate(masterId, {
      name: "Taplyzer Admin",
      email: "admin@taplyzer.com",
      password: "123",
      lastActive: new Date(),
    }, { upsert: true });

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${createdUsers.length} Users, Businesses, Intents, and Offerings into Firestore!`,
      exampleUserId: createdUsers[0]._id,
      masterUserId: masterId
    });
  } catch (error: any) {
    console.error("Seeding error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
