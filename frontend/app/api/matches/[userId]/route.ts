import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dbConnect from "@/lib/db";
import Business from "@/models/Business";
import User from "@/models/User";
import MatchRecord from "@/models/MatchRecord";
import Offering from "@/models/Offering";
import Intent from "@/models/Intent";
import { logGeminiUsage } from "@/lib/geminiLogger";

export const dynamic = "force-dynamic";

// ─── Gemini client (Stage 3 only) ────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// ─── Cache TTL ────────────────────────────────────────────────────────────────
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// ─── Tokenization & Stopwords ────────────────────────────────────────────────
const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "in", "on", "at", "to", "for", "with", "by",
  "of", "is", "are", "it", "we", "you", "they", "i", "not", "no", "this", "that",
  "our", "their", "your", "my", "us", "from", "as", "about"
]);

function cleanAndTokenize(text: string | string[]): string[] {
  const arr = Array.isArray(text) ? text : [text];
  return arr
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

// ─── TargetedSynergy v4 — Domain Synonym Clusters ────────────────────────────
// Each cluster groups related skills/services. Two phrases that each contain a
// keyword from the SAME cluster get a minimum similarity floor of 0.40.
// Adjacent clusters (e.g. seo ↔ content) get a floor of 0.20.

const DOMAIN_CLUSTERS: Record<string, string[]> = {
  // ── MARKETING ──
  seo: [
    "seo", "backlink", "backlinks", "link building", "technical seo", "on-page", "off-page",
    "schema", "schema markup", "site speed", "core web vitals", "crawl", "indexing", "serp",
    "keyword", "keywords", "meta", "sitemap", "robots", "anchor", "domain authority",
    "page rank", "organic", "search engine", "optimization",
  ],
  content_marketing: [
    "content marketing", "content", "blog", "blogging", "copywriting", "article",
    "whitepaper", "case study", "ebook", "ghostwriting", "newsletter", "editorial",
    "storytelling", "content strategy", "thought leadership",
  ],
  paid_ads: [
    "paid ads", "paid advertising", "ppc", "google ads", "facebook ads", "instagram ads",
    "programmatic", "programmatic ads", "youtube ads", "media buying", "display ads",
    "retargeting", "remarketing", "cpm", "cpc", "cpa", "roas", "performance marketing",
    "sem", "search ads", "shopping ads", "tiktok ads", "linkedin ads", "ad spend",
    "ad creative", "creative", "conversion rate", "cro",
  ],
  social_media: [
    "social media", "social media management", "instagram", "facebook", "twitter",
    "linkedin", "tiktok", "pinterest", "influencer", "influencer marketing", "ugc",
    "community management", "engagement", "reels", "stories", "organic social",
  ],
  email_retention: [
    "email marketing", "email", "klaviyo", "mailchimp", "hubspot", "sms marketing",
    "sms", "push notifications", "push", "retention", "lifecycle", "drip", "automation",
    "crm", "customer retention", "loyalty", "newsletter", "segmentation", "flows",
    "campaigns", "open rate", "click rate",
  ],
  ecommerce: [
    "shopify", "woocommerce", "ecommerce", "e-commerce", "d2c", "direct to consumer",
    "dropshipping", "cart", "checkout", "product listing", "amazon", "marketplace",
    "inventory", "fulfillment", "shopify integrations", "shopify apps",
  ],
  branding_pr: [
    "branding", "brand", "brand identity", "logo", "design", "creative", "pr",
    "public relations", "press release", "media outreach", "reputation", "awareness",
  ],
  lead_generation: [
    "lead generation", "leads", "b2b leads", "outbound", "cold email", "cold outreach",
    "linkedin outreach", "account-based marketing", "abm", "demand generation",
    "prospecting", "pipeline", "sales funnel", "crm", "sales development",
  ],
  // ── SOFTWARE / TECH ──
  saas_dev: [
    "saas", "software development", "software", "web development", "app development",
    "mobile app", "api", "api integration", "backend", "frontend", "full stack",
    "react", "node", "python", "java", "microservices", "architecture",
  ],
  cloud_infra: [
    "cloud", "aws", "azure", "gcp", "google cloud", "devops", "infrastructure",
    "migration", "cloud migration", "kubernetes", "docker", "ci/cd", "deployment",
    "server", "hosting", "serverless",
  ],
  cybersecurity: [
    "cybersecurity", "security", "penetration testing", "pen testing", "vulnerability",
    "compliance", "soc2", "iso27001", "gdpr", "data privacy", "firewall", "threat",
    "endpoint", "zero trust", "audit",
  ],
  data_analytics: [
    "data", "analytics", "data analytics", "business intelligence", "bi", "dashboard",
    "reporting", "sql", "python", "tableau", "power bi", "data science", "machine learning",
    "ai", "predictive", "big data", "etl", "data pipeline",
  ],
  erp_crm: [
    "erp", "crm", "enterprise", "sap", "oracle", "salesforce", "zoho", "odoo",
    "implementation", "customization", "integration", "workflow", "automation",
  ],
  // ── MANUFACTURING / SUPPLY CHAIN ──
  manufacturing: [
    "manufacturing", "production", "fabrication", "assembly", "oem", "contract manufacturing",
    "precision", "machining", "casting", "forging", "stamping", "injection molding",
    "cnc", "tooling", "quality control", "iso",
  ],
  packaging: [
    "packaging", "carton", "box", "corrugated", "label", "print", "custom packaging",
    "eco-friendly packaging", "sustainable packaging",
  ],
  raw_materials: [
    "raw materials", "materials", "steel", "aluminium", "aluminum", "textile", "fabric",
    "yarn", "cotton", "polymer", "plastic", "rubber", "chemical", "resin",
  ],
  // ── LOGISTICS / TRANSPORT ──
  logistics: [
    "logistics", "supply chain", "warehousing", "3pl", "freight", "transport",
    "trucking", "shipping", "last mile", "delivery", "distribution", "fulfillment",
  ],
  freight_forwarding: [
    "freight forwarding", "customs", "customs brokerage", "import", "export",
    "ocean freight", "air freight", "sea freight", "port", "clearance", "trade",
  ],
  cold_chain: [
    "cold chain", "refrigerated", "cold storage", "temperature controlled", "reefer",
    "perishable", "frozen", "chilled",
  ],
  // ── FINANCE ──
  finance_lending: [
    "lending", "loan", "credit", "working capital", "invoice discounting", "factoring",
    "venture debt", "debt financing", "nbfc", "sme finance",
  ],
  investment_advisory: [
    "investment", "portfolio", "wealth management", "financial advisory", "mutual fund",
    "equity", "stocks", "asset management", "hedge fund", "private equity", "venture capital",
  ],
  accounting_tax: [
    "accounting", "bookkeeping", "gst", "tax", "audit", "compliance", "cfo",
    "financial reporting", "payroll", "outsourced accounting",
  ],
  trade_finance: [
    "trade finance", "letter of credit", "lc", "export finance", "import finance",
    "bank guarantee", "forex", "currency",
  ],
  // ── LEGAL ──
  corporate_legal: [
    "corporate law", "company law", "incorporation", "compliance", "regulatory",
    "fdi", "mergers", "acquisitions", "joint venture", "shareholder", "governance",
  ],
  startup_legal: [
    "startup legal", "esop", "term sheet", "shareholders agreement", "co-founder",
    "vesting", "convertible note", "safe", "venture", "seed",
  ],
  ip_legal: [
    "intellectual property", "ip", "trademark", "patent", "copyright", "brand protection",
    "infringement", "licensing",
  ],
  real_estate_legal: [
    "real estate law", "property", "due diligence", "title", "lease", "conveyancing",
    "land", "construction",
  ],
  labor_legal: [
    "labor law", "employment law", "hr compliance", "industrial relations", "dispute",
    "termination", "posh", "workforce",
  ],
  // ── HR / STAFFING ──
  hr_payroll: [
    "hr", "human resources", "payroll", "hrms", "hris", "onboarding", "offboarding",
    "benefits", "compensation", "performance management",
  ],
  recruitment: [
    "recruitment", "staffing", "hiring", "talent acquisition", "headhunting", "executive search",
    "placement", "manpower", "workforce",
  ],
  // ── HEALTHCARE ──
  healthtech: [
    "healthcare", "health", "medical", "hospital", "clinic", "ehr", "emr", "hipaa",
    "patient", "telemedicine", "telehealth", "diagnostics", "pharma",
  ],
};

// Adjacent clusters that should give a partial floor boost (0.20)
const ADJACENT_CLUSTERS: [string, string][] = [
  ["seo", "content_marketing"],
  ["seo", "paid_ads"],
  ["paid_ads", "social_media"],
  ["paid_ads", "lead_generation"],
  ["email_retention", "ecommerce"],
  ["email_retention", "lead_generation"],
  ["content_marketing", "branding_pr"],
  ["social_media", "branding_pr"],
  ["saas_dev", "cloud_infra"],
  ["saas_dev", "data_analytics"],
  ["saas_dev", "erp_crm"],
  ["cloud_infra", "cybersecurity"],
  ["data_analytics", "erp_crm"],
  ["manufacturing", "raw_materials"],
  ["manufacturing", "packaging"],
  ["logistics", "freight_forwarding"],
  ["logistics", "cold_chain"],
  ["finance_lending", "accounting_tax"],
  ["finance_lending", "investment_advisory"],
  ["investment_advisory", "accounting_tax"],
  ["trade_finance", "freight_forwarding"],
  ["corporate_legal", "startup_legal"],
  ["corporate_legal", "ip_legal"],
  ["hr_payroll", "recruitment"],
];

// Pre-build: token → list of cluster names it belongs to
const TOKEN_TO_CLUSTERS = new Map<string, string[]>();
for (const [clusterName, keywords] of Object.entries(DOMAIN_CLUSTERS)) {
  for (const kw of keywords) {
    const tokens = cleanAndTokenize(kw);
    for (const tok of tokens) {
      if (!TOKEN_TO_CLUSTERS.has(tok)) TOKEN_TO_CLUSTERS.set(tok, []);
      TOKEN_TO_CLUSTERS.get(tok)!.push(clusterName);
    }
  }
}

function getClustersForPhrase(phrase: string): Set<string> {
  const result = new Set<string>();
  const tokens = cleanAndTokenize(phrase);
  for (const tok of tokens) {
    for (const cluster of TOKEN_TO_CLUSTERS.get(tok) || []) {
      result.add(cluster);
    }
  }
  return result;
}

function clusterSimilarity(phraseA: string, phraseB: string): number {
  const clustersA = getClustersForPhrase(phraseA);
  const clustersB = getClustersForPhrase(phraseB);
  if (!clustersA.size || !clustersB.size) return 0;

  // Same cluster → 0.60 floor (restores score range to 60-80 for domain-related matches)
  for (const c of clustersA) {
    if (clustersB.has(c)) return 0.60;
  }

  // Adjacent cluster → 0.35 floor (medium score for complementary cross-domain matches)
  for (const [ca, cb] of ADJACENT_CLUSTERS) {
    if ((clustersA.has(ca) && clustersB.has(cb)) || (clustersA.has(cb) && clustersB.has(ca))) {
      return 0.35;
    }
  }

  return 0;
}

// ─── TargetedSynergy v4 — 3-Layer Phrase Similarity ─────────────────────────
// Layer 1: Exact / substring containment
// Layer 2: Symmetric Jaccard on tokens
// Layer 3: Domain cluster floor
// Final = max(all layers)

function phraseSimilarity(phraseA: string, phraseB: string): number {
  const pA = phraseA.toLowerCase().trim();
  const pB = phraseB.toLowerCase().trim();

  if (!pA || !pB) return 0;

  // Layer 1 — Exact / substring
  if (pA === pB) return 1.0;
  if (pA.includes(pB) || pB.includes(pA)) return 0.85;

  const tokensA = cleanAndTokenize(pA);
  const tokensB = cleanAndTokenize(pB);

  // Layer 2 — Symmetric Jaccard (intersection / union, both directions fair)
  let jaccardScore = 0;
  if (tokensA.length > 0 && tokensB.length > 0) {
    const setA = new Set(tokensA);
    const setB = new Set(tokensB);
    const intersect = [...setA].filter(t => setB.has(t));
    const union = new Set([...setA, ...setB]);
    jaccardScore = intersect.length / union.size;
  }

  // Layer 3 — Domain cluster floor
  const clusterScore = clusterSimilarity(pA, pB);

  return Math.max(jaccardScore, clusterScore);
}

// How well B's offerings satisfy A's needs
function computeNeedsMetByOfferingsScore(needs: string[], offerings: string[]): number {
  if (!needs.length || !offerings.length) return 0;

  let totalScore = 0;
  for (const need of needs) {
    let maxSim = 0;
    for (const offering of offerings) {
      const sim = phraseSimilarity(need, offering);
      if (sim > maxSim) maxSim = sim;
    }
    totalScore += maxSim;
  }

  return Math.round((totalScore / needs.length) * 100);
}

// Goal satisfaction helper removed in TargetedSynergy-v4

// ─── Geographic Proximity Score (15% weight target) ─────────────────────────
function locationScore(A: any, B: any): number {
  const norm = (s?: string) => (s || "").toLowerCase().trim();

  const aCity = norm(A.location?.city);
  const aState = norm(A.location?.state);
  const aCountry = norm(A.location?.country);

  const bCity = norm(B.location?.city);
  const bState = norm(B.location?.state);
  const bCountry = norm(B.location?.country);

  if (aCity && bCity && aCity === bCity) return 100;           // same city
  if (aState && bState && aState === bState) return 70;        // same state
  if (aCountry && bCountry && aCountry === bCountry) return 40; // same country

  // Reach bonus
  const reach = (B.location?.operatesIn || "").toLowerCase();
  if (reach === "global") return 30;
  if (reach === "national") return 20;

  return 10; // different country, no special reach
}

// ─── Strict Competitor Filter v4 ─────────────────────────────────────────────
// v4: Uses cluster-aware similarity so near-identical offerings are correctly
// flagged. Threshold raised to >0.30 Jaccard to avoid over-filtering.
function isCompetitor(A: any, B: any): boolean {
  const aOffersArr: string[] = A.offerings || [];
  const bOffersArr: string[] = B.offerings || [];

  if (aOffersArr.length === 0 || bOffersArr.length === 0) return false;

  const aInd = (A.industry || "").toLowerCase().trim();
  const bInd = (B.industry || "").toLowerCase().trim();

  // 1. Exact case-insensitive offering match
  const setA = new Set(aOffersArr.map((s) => s.toLowerCase().trim()));
  const setB = new Set(bOffersArr.map((s) => s.toLowerCase().trim()));
  for (const item of setA) {
    if (setB.has(item)) return true;
  }

  // 2. High-similarity offering pairs in same industry
  if (aInd && bInd && aInd === bInd) {
    let highSimCount = 0;
    for (const ao of aOffersArr) {
      for (const bo of bOffersArr) {
        if (phraseSimilarity(ao, bo) >= 0.80) highSimCount++;
      }
    }
    // If 2 or more offering pairs are near-identical, they are competitors
    if (highSimCount >= 2) return true;
  }

  // 3. Token-level Jaccard overlap (cross-industry, very high threshold)
  const tokensA = cleanAndTokenize(aOffersArr);
  const tokensB = cleanAndTokenize(bOffersArr);
  if (tokensA.length === 0 || tokensB.length === 0) return false;

  const setTokensA = new Set(tokensA);
  const setTokensB = new Set(tokensB);
  const intersection = [...setTokensA].filter((t) => setTokensB.has(t));
  const union = new Set([...setTokensA, ...setTokensB]);
  const overlap = intersection.length / union.size;

  // Raised to 0.30 (was 0.20) to avoid falsely flagging complementary businesses
  if (overlap > 0.30) return true;

  return false;
}

// ─── Profile Enrichment Helper ────────────────────────────────────────────────
function enrichProfile(biz: any, offeringsMap: Map<string, string>, intentsMap: Map<string, string>) {
  if (!biz) return biz;

  const ownerId = biz.ownerId?.toString();
  if (!ownerId) return biz;

  let offerings = Array.isArray(biz.offerings) ? [...biz.offerings] : [];
  let needs = Array.isArray(biz.needs) ? [...biz.needs] : [];

  // Fallback offerings if they contain only generic values or are empty
  const isGenericOff = offerings.length === 0 || 
    (offerings.length === 1 && (offerings[0] === "Service" || offerings[0] === "Services"));
  if (isGenericOff) {
    const richOff = offeringsMap.get(ownerId);
    if (richOff) {
      offerings = richOff.split(",").map(s => s.trim()).filter(Boolean);
    }
  }

  // Fallback needs if they contain only generic values or are empty
  const isGenericNeed = needs.length === 0 || 
    (needs.length === 1 && (needs[0] === "Client" || needs[0] === "Clients" || needs[0] === "Customer" || needs[0] === "Customers"));
  if (isGenericNeed) {
    const richIntent = intentsMap.get(ownerId);
    if (richIntent) {
      needs = [richIntent];
    }
  }

  return {
    ...biz,
    offerings,
    needs
  };
}

// ─── Hard Validation Filter ──────────────────────────────────────────────────
function isValidMatch(A: any, B: any): boolean {
  const aNeedsArr: string[] = A.needs || [];
  const aOffersArr: string[] = A.offerings || [];
  const bNeedsArr: string[] = B.needs || [];
  const bOffersArr: string[] = B.offerings || [];

  // Hard filter: Both target and candidate MUST have at least 1 need and 1 offering
  if (!aNeedsArr.length || !aOffersArr.length) return false;
  if (!bNeedsArr.length || !bOffersArr.length) return false;

  // Strict competitor filter
  if (isCompetitor(A, B)) return false;

  // Direction check — A needs B's offerings OR B needs A's offerings
  const aNeedsMet = computeNeedsMetByOfferingsScore(aNeedsArr, bOffersArr);
  const bNeedsMet = computeNeedsMetByOfferingsScore(bNeedsArr, aOffersArr);

  if (aNeedsMet === 0 && bNeedsMet === 0) {
    return false;
  }

  return true;
}

// ─── Helper Functions for Verification & Completeness ──────────────────────
function getVerificationScore(candidateUser: any, B: any): number {
  const status = (B.trust?.verificationStatus || "").trim().toLowerCase();
  
  if (status === "trusted partner") return 100;
  if (status === "business verified" || candidateUser?.verified === true) return 80;
  if (status === "basic verified" || status === "basic") return 60;
  if (status === "verified user") return 80;
  if (status === "not verified" || status === "") return 20;

  return 20;
}

function getProfileCompletenessScore(candidateUser: any, B: any): number {
  if (typeof B.profileScore === "number") {
    return B.profileScore;
  }

  // Fallback completeness calculation matching profile/route.ts
  let score = 0;
  if (candidateUser?.name && candidateUser?.phone) score += 15;
  if (B.companyName && B.industry) score += 15;
  if (B.location?.country && B.location?.city) score += 10;
  if (B.strength?.teamSize) score += 5;
  if (B.offerings && B.offerings.length > 0) score += 15;
  if (B.needs && B.needs.length > 0) score += 15;
  if (B.intent && B.intent.currentGoal) score += 15;
  if (B.trust && B.trust.website) score += 10;

  return Math.min(score, 100);
}

// ─── Same-industry category bonus ────────────────────────────────────────────
function industryBonus(A: any, B: any): number {
  // Same-industry matching is removed to avoid matching direct competitors
  return 0;
}

// ─── TargetedSynergy v4.2 Scoring Engine ─────────────────────────────────────
// Weights: A→B needs 75% | B→A needs 15% | same-industry 0% | location 3% | verification 7%
function computeDeterministicScore(
  userBiz: any,
  candidate: any,
  candidateUser: any
): {
  total: number;
  breakdown: {
    aNeedsMetByBOffers: number;
    bNeedsMetByAOffers: number;
    industryBonus: number;
    locationProximity: number;
    verification: number;
    profileCompleteness: number;
    intentRelevance: number;
    location: number;
  };
} {
  const aNeedsMetByBOffers = computeNeedsMetByOfferingsScore(userBiz.needs || [], candidate.offerings || []);
  const bNeedsMetByAOffers = computeNeedsMetByOfferingsScore(candidate.needs || [], userBiz.offerings || []);
  const indBonus         = 0; // industryBonus disabled
  const locationProximity = locationScore(userBiz, candidate);  // 0-100
  const verification      = getVerificationScore(candidateUser, candidate); // 0-100

  // TargetedSynergy-v4.2 weights:
  // Primary (A needs met by B): 75%  — dominant signal
  // Mutual (B needs met by A):  15%  — rewards two-way complementarity
  // Same-industry bonus:         0%  — disabled (competitor risk)
  // Location proximity:          3%  — minor geographic signal
  // Verification:                7%  — trust signal
  const total = Math.round(
    aNeedsMetByBOffers * 0.75 +
    bNeedsMetByAOffers * 0.15 +
    locationProximity  * 0.03 +
    verification       * 0.07
  );

  return {
    total,
    breakdown: {
      aNeedsMetByBOffers: Math.round(aNeedsMetByBOffers * 0.75),
      bNeedsMetByAOffers: Math.round(bNeedsMetByAOffers * 0.15),
      industryBonus:      0,
      locationProximity:  Math.round(locationProximity  * 0.03),
      verification:       Math.round(verification       * 0.07),
      profileCompleteness: 0,
      intentRelevance: Math.round(
        aNeedsMetByBOffers * 0.75 +
        bNeedsMetByAOffers * 0.15
      ),
      location: Math.round(locationProximity * 0.03),
    },
  };
}

// ─── Stage 3: Gemini Rerank (Top 10 only, opt-in) ────────────────────────────
// Controlled by GEMINI_RERANK_ENABLED=true in .env.local
// Adds up to 30 bonus points. 10 calls MAX — never 30+.

async function geminiRerank(
  userBiz: any,
  candidates: Array<{ item: any; score: number; breakdown: any }>
): Promise<Map<string, number>> {
  const boostMap = new Map<string, number>();

  if (process.env.GEMINI_RERANK_ENABLED !== "true") return boostMap;

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json", temperature: 0.1 },
    systemInstruction: `You are a B2B matchmaker. Given a target business and a candidate, rate the commercial synergy from 0–100.
Focus only on whether a real business deal (as buyer, seller, partner or referral) is realistic.
Return JSON: { "score": number, "reason": "one short sentence" }`,
  });

  // Query Gemini in parallel for all top candidates to reduce latency
  await Promise.all(
    candidates.map(async ({ item }) => {
      const cId = item.ownerId.toString();
      try {
        const prompt = `Target needs: ${JSON.stringify(userBiz.needs)}
Target offers: ${JSON.stringify(userBiz.offerings)}
Candidate offers: ${JSON.stringify(item.offerings)}
Candidate needs: ${JSON.stringify(item.needs)}
Industry target: ${userBiz.industry} | Industry candidate: ${item.industry}`;

        const result = await model.generateContent(prompt);
        const parsed = JSON.parse(result.response.text());
        boostMap.set(cId, Number(parsed.score) || 0);

        // Log Gemini usage
        const usage = result.response.usageMetadata;
        if (usage) {
          await logGeminiUsage({
            userId: userBiz.ownerId?.toString(),
            feature: "reranking",
            model: "gemini-2.5-flash",
            inputTokens: usage.promptTokenCount || 0,
            outputTokens: usage.candidatesTokenCount || 0,
          });
        }
      } catch (err) {
        console.error("Gemini reranking error for candidate:", err);
        boostMap.set(cId, 0);
      }
    })
  );

  return boostMap;
}

// ─── Build human-readable reason strings v4 ──────────────────────────────────
function buildReasons(
  userBiz: any,
  candidate: any,
  breakdown: any,
  aiReason?: string
): string[] {
  const reasons: string[] = [];

  // 1. Direct need satisfaction (cluster-aware threshold 0.35)
  const matchedNeeds = (userBiz.needs || []).filter((n: string) =>
    (candidate.offerings || []).some((o: string) => phraseSimilarity(n, o) >= 0.35)
  );
  if (matchedNeeds.length > 0) {
    reasons.push(`🎯 They offer what you need: ${matchedNeeds.slice(0, 2).join(", ")}`);
  }

  // 2. Mutual need satisfaction
  const matchedOffers = (candidate.needs || []).filter((n: string) =>
    (userBiz.offerings || []).some((o: string) => phraseSimilarity(n, o) >= 0.35)
  );
  if (matchedOffers.length > 0) {
    reasons.push(`🤝 They need what you offer: ${matchedOffers.slice(0, 2).join(", ")}`);
  }

  // 3. Same-industry bonus (Disabled to prevent competitor matching)

  // 4. Location
  if (breakdown.locationProximity > 0) {
    const locRaw = breakdown.locationProximity / 0.05;
    if (locRaw >= 100) {
      reasons.push(`📍 Same city — ${candidate.location?.city || ""}`);
    } else if (locRaw >= 70) {
      reasons.push(`📍 Same state — ${candidate.location?.state || ""}`);
    } else if (locRaw >= 40) {
      reasons.push(`📍 Same country — ${candidate.location?.country || ""}`);
    }
  }

  // 5. AI reason (if rerank ran)
  if (aiReason) reasons.push(`🤖 ${aiReason}`);

  return reasons.slice(0, 4);
}

// ─── POST — Run Stable Hybrid Match Engine ────────────────────────────────────
export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await dbConnect();
    const { userId } = await params;

    // ── Load User A's profile ─────────────────────────────────────────────────
    const rawUserBiz = await Business.findOne({ ownerId: userId }).lean() as any;
    if (!rawUserBiz) {
      return NextResponse.json(
        { msg: "Business profile not found. Please complete your profile first." },
        { status: 404 }
      );
    }

    // Fetch rich offerings and intents from Firestore to enrich the profiles
    const [allOfferings, allIntents] = await Promise.all([
      Offering.find({}).exec() as Promise<any[]>,
      Intent.find({}).exec() as Promise<any[]>
    ]);

    // Create lookup maps by userId
    const offeringsMap = new Map<string, string>();
    const intentsMap = new Map<string, string>();

    for (const off of allOfferings) {
      if (off.userId && off.text) {
        offeringsMap.set(off.userId.toString(), off.text);
      }
    }
    for (const intent of allIntents) {
      if (intent.userId && intent.text) {
        intentsMap.set(intent.userId.toString(), intent.text);
      }
    }

    // Enrich User A's profile
    const userBiz = enrichProfile(rawUserBiz, offeringsMap, intentsMap);

    // ── Stage 0+1: Candidate Retrieval with Hard Filter ───────────────────────
    // Fetch all active users' businesses (excluding self + suspended)
    const candidates: any[] = await Business.aggregate([
      { $match: { ownerId: { $ne: userId } } },
      {
        $lookup: {
          from: "users",
          localField: "ownerId",
          foreignField: "_id",
          as: "ownerData",
        },
      },
      { $unwind: { path: "$ownerData", preserveNullAndEmptyArrays: true } },
      { $match: { "ownerData.status": { $ne: "SUSPENDED" } } },
    ]);

    if (candidates.length === 0) {
      return NextResponse.json({ count: 0, matches: [], meta: { fromCache: false } });
    }

    // Enrich all candidate profiles using lookup maps
    const enrichedCandidates = candidates.map(c => {
      const enriched = enrichProfile(c, offeringsMap, intentsMap);
      return {
        ...enriched,
        ownerData: c.ownerData
      };
    });

    // Stage 0: Hard filter — direction + competitor check
    const filtered = enrichedCandidates.filter((c) => isValidMatch(userBiz, c));
    console.log(`[MATCH] userId=${userId} | total=${candidates.length} | after hard filter=${filtered.length}`);

    // Stage 1: Score all filtered non-competitor candidates directly using the composite formula
    const scored = filtered
      .map((c) => {
        const user = c.ownerData;
        const { total, breakdown } = computeDeterministicScore(userBiz, c, user);
        return { item: c, score: total, breakdown, user };
      })
      .filter((x) => x.score >= 15) // minimum quality gate
      .sort((a, b) => b.score - a.score);

    // Top 10 go to Gemini rerank (if enabled)
    const top10 = scored.slice(0, 10);
    const rest  = scored.slice(10, 20);

    // ── Stage 3: Gemini Rerank (Top 10 only) ─────────────────────────────────
    let aiBoostMap = new Map<string, number>();
    if (top10.length > 0) {
      console.log(`[MATCH] Running Gemini rerank on ${top10.length} candidates (GEMINI_RERANK_ENABLED=${process.env.GEMINI_RERANK_ENABLED})`);
      aiBoostMap = await geminiRerank(userBiz, top10);
    }

    // Merge AI boost into top 10 scores, leave rest as-is
    const top10Boosted = top10.map(({ item, score, breakdown, user }) => {
      const cId = item.ownerId.toString();
      
      let blended = score;
      let rawAiScore = 0;
      let aiBoostPts = 0;

      if (aiBoostMap.has(cId)) {
        rawAiScore = aiBoostMap.get(cId) || 0;
        // Blend: 70% deterministic + 30% AI
        blended = Math.round(score * 0.7 + rawAiScore * 0.3);
        aiBoostPts = Math.round(rawAiScore * 0.3);
      }
      
      return { item, score: blended, breakdown: { ...breakdown, aiBoost: aiBoostPts }, user, aiScore: rawAiScore };
    });

    // Deduplicate by ownerId — guards against duplicate Business docs in Firestore
    const seenIds = new Set<string>();
    const allFinal = [
      ...top10Boosted,
      ...rest.map(({ item, score, breakdown, user }) => ({
        item, score, breakdown: { ...breakdown, aiBoost: 0 }, user, aiScore: 0,
      })),
    ]
      .sort((a, b) => b.score - a.score)
      .filter(({ item }) => {
        const id = item.ownerId.toString();
        if (seenIds.has(id)) return false;
        seenIds.add(id);
        return true;
      })
      .slice(0, 20);

    // ── Stage 4: Format + Persist Results ────────────────────────────────────
    const now = new Date();
    const formattedMatches = allFinal.map(({ item, score, breakdown, user }) => {
      const reasons = buildReasons(userBiz, item, breakdown as any);

      return {
        matchedUserId: item.ownerId,
        candidateName: user?.name || item.ownerName || "Unknown",
        companyName:   item.companyName || item.brandName || "",
        industry:      item.industry || "",
        location:      item.location?.city
          ? `${item.location.city}${item.location.state ? ", " + item.location.state : ""}`
          : item.location?.country || "Unknown",
        offerings:     item.offerings || [],
        needs:         item.needs || [],
        goal:          item.intent?.currentGoal || "",
        offeringGoal:  item.offeringGoal || "",
        verified:      user?.verified ?? false,
        verificationStatus: item.trust?.verificationStatus || "Not Verified",
        subscriptionPlan: user?.subscriptionPlan || "FREE",
        teamSize:      item.strength?.teamSize || item.teamSize || "1-5",
        score,
        scoreBreakdown: breakdown,
        reasons,
      };
    });

    // Atomic replace: delete old cache, insert new
    await MatchRecord.deleteMany({ userId });
    await Business.findOneAndUpdate({ ownerId: userId }, { lastMatchesCalculatedAt: now });
    if (formattedMatches.length > 0) {
      await MatchRecord.insertMany(
        formattedMatches.map((m) => ({
          userId,
          matchedUserId: m.matchedUserId,
          candidateName: m.candidateName,
          companyName: m.companyName,
          industry: m.industry,
          location: m.location,
          offerings: m.offerings,
          needs: m.needs,
          goal: m.goal,
          offeringGoal: m.offeringGoal,
          verified: m.verified,
          verificationStatus: m.verificationStatus,
          subscriptionPlan: m.subscriptionPlan,
          teamSize: m.teamSize,
          score: m.score,
          reasons: m.reasons,
          scoreBreakdown: m.scoreBreakdown,
          generatedAt: now,
          cacheVersion: 1,
        }))
      );
    }

    console.log(
      `[MATCH] userId=${userId} | scored=${scored.length} | saved=${formattedMatches.length} | aiRerank=${aiBoostMap.size > 0}`
    );

    return NextResponse.json({
      count: formattedMatches.length,
      matches: formattedMatches,
      meta: {
        fromCache: false,
        algorithm: "TargetedSynergy-v4",
        signals: [
          "aNeedsMetByBOffers(75%)",
          "bNeedsMetByAOffers(15%)",
          "locationProximity(3%)",
          "verification(7%)",
          "domainClusters+Jaccard",
        ],
        aiRerankEnabled: process.env.GEMINI_RERANK_ENABLED === "true",
        evaluatedCandidates: filtered.length,
      },
    });

  } catch (err: any) {
    console.error("[MATCH] Engine error:", err);
    return NextResponse.json({ msg: "Server Error", error: err.message }, { status: 500 });
  }
}

// ─── GET — Return cached match results ───────────────────────────────────────
export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await dbConnect();
    const { userId } = await params;

    // Check if cache is still fresh using business profile's lastMatchesCalculatedAt
    const [data, biz] = await Promise.all([
      MatchRecord.find({ userId }).sort({ score: -1 }).lean(),
      Business.findOne({ ownerId: userId }).select("lastMatchesCalculatedAt").lean() as unknown as Promise<any>
    ]);

    let cacheAge: number | null = null;
    const calcTime = biz?.lastMatchesCalculatedAt ? new Date(biz.lastMatchesCalculatedAt).getTime() : null;
    if (calcTime && !isNaN(calcTime)) {
      cacheAge = Date.now() - calcTime;
    }

    const isStale = cacheAge === null || cacheAge >= CACHE_TTL_MS;

    return NextResponse.json({
      count: data.length,
      matches: data,
      meta: {
        fromCache: cacheAge !== null,
        isStale,
        cacheAgeMinutes: cacheAge !== null ? Math.round(cacheAge / 60000) : null,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ msg: "Server Error", error: err.message }, { status: 500 });
  }
}
