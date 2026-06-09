import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import Business from "@/models/Business";
import MatchRecord from "@/models/MatchRecord";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_taplyzer_jwt_key_2026";

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("taplyzer_auth_token")?.value;

  if (!token) {
    console.log("Profile API: No auth token found in cookies");
    return null;
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) console.log("Profile API: User not found for token userId:", decoded.userId);
    return user;
  } catch (err) {
    console.log("Profile API: JWT verification failed:", err);
    return null;
  }
}

// ─── GET: Fetch profile data ───────────────────────────────────────────────
export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`Profile GET: Loading profile for user ${user.email}`);

    // Find or create business profile
    let business = await Business.findOne({ ownerId: user._id });
    if (!business) {
      console.log(`Profile GET: No business profile found for ${user.email}, creating one...`);
      business = await Business.create({
        ownerId: user._id,
        ownerName: user.name,
        companyName: "",
        industry: "",
      });
      console.log(`Profile GET: Business profile created with id: ${business._id}`);
    }

    return NextResponse.json({ user, business }, { status: 200 });
  } catch (error: any) {
    console.error("Profile GET Error:", error.message, error.stack);
    return NextResponse.json({ error: "Internal Server Error", detail: error.message }, { status: 500 });
  }
}

// ─── POST: Save profile data ────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await req.json();
    console.log(`Profile POST: Saving profile for user ${user.email}`, JSON.stringify(payload, null, 2));

    // ── 1. Update User (personal details) ──
    if (payload.name !== undefined) user.name = payload.name;
    if (payload.designation !== undefined) user.designation = payload.designation;
    if (payload.phone !== undefined) user.phone = payload.phone;
    if (payload.linkedin !== undefined) user.linkedin = payload.linkedin;
    await user.save();
    console.log(`Profile POST: User record saved for ${user.email}`);

    // ── 2. Find or create Business ──
    let business = await Business.findOne({ ownerId: user._id });
    if (!business) {
      business = await Business.create({ ownerId: user._id, ownerName: user.name });
      console.log(`Profile POST: Creating new Business document for ${user.email}`);
    }

    // Business Identity
    if (payload.companyName !== undefined) business.companyName = payload.companyName;
    if (payload.brandName !== undefined) business.brandName = payload.brandName;
    if (payload.industry !== undefined) business.industry = payload.industry;
    if (payload.subIndustry !== undefined) business.subIndustry = payload.subIndustry;
    if (payload.businessType !== undefined) business.businessType = payload.businessType;

    // Location & Reach
    if (payload.location) {
      business.location = {
        country: payload.location.country ?? business.location?.country ?? "",
        state: payload.location.state ?? business.location?.state ?? "",
        city: payload.location.city ?? business.location?.city ?? "",
        operatesIn: payload.location.operatesIn ?? business.location?.operatesIn ?? "National",
      };
    }

    // Business Strength
    if (payload.strength) {
      business.strength = {
        yearsInBusiness: payload.strength.yearsInBusiness ?? business.strength?.yearsInBusiness ?? 1,
        teamSize: payload.strength.teamSize ?? business.strength?.teamSize ?? "1-5",
        monthlyCapacity: payload.strength.monthlyCapacity ?? business.strength?.monthlyCapacity ?? "",
        revenueRange: payload.strength.revenueRange ?? business.strength?.revenueRange ?? "",
      };
    }

    // Offerings & Needs
    if (Array.isArray(payload.offerings)) business.offerings = payload.offerings;
    if (Array.isArray(payload.needs)) business.needs = payload.needs;

    // Current Intent
    if (payload.intent) {
      business.intent = {
        currentGoal: payload.intent.currentGoal ?? business.intent?.currentGoal ?? "",
        priority: payload.intent.priority ?? business.intent?.priority ?? "Medium",
        budget: payload.intent.budget ?? business.intent?.budget ?? "",
        timeline: payload.intent.timeline ?? business.intent?.timeline ?? "",
      };
    }

    // Trust & Verification
    if (payload.trust) {
      business.trust = {
        website: payload.trust.website ?? business.trust?.website ?? "",
        linkedin: payload.trust.linkedin ?? business.trust?.linkedin ?? "",
        gst: payload.trust.gst ?? business.trust?.gst ?? "",
        verificationStatus: business.trust?.verificationStatus ?? "Not Verified",
      };
    }

    // ── 3. Recalculate Profile Score ──
    let score = 0;
    if (user.name && user.phone) score += 15;
    if (business.companyName && business.industry) score += 15;
    if (business.location?.country && business.location?.city) score += 10;
    if (business.strength?.teamSize) score += 5;
    if (business.offerings && business.offerings.length > 0) score += 15;
    if (business.needs && business.needs.length > 0) score += 15;
    if (business.intent && business.intent.currentGoal) score += 15;
    if (business.trust && business.trust.website) score += 10;

    business.profileScore = Math.min(score, 100);
    business.isProfileCompleted = business.profileScore >= 70;

    await business.save();
    console.log(`Profile POST: Business saved. Score: ${business.profileScore}, Completed: ${business.isProfileCompleted}`);

    // ── 4. Invalidate match cache (profile changed → matches are stale) ──
    await MatchRecord.deleteMany({ userId: user._id });
    console.log(`Profile POST: Match cache invalidated for user ${user.email}`);

    return NextResponse.json({
      message: "Profile saved successfully",
      score: business.profileScore,
      isCompleted: business.isProfileCompleted,
    }, { status: 200 });

  } catch (error: any) {
    console.error("Profile POST Error:", error.message, error.stack);
    return NextResponse.json({ error: "Internal Server Error", detail: error.message }, { status: 500 });
  }
}
