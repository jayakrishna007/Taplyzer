import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Business from "@/models/Business";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await dbConnect();

    // Fetch all business profiles
    const businesses = await Business.find({}).lean();

    const results = [];

    for (const biz of businesses) {
      // Get the associated user to fetch their verified status and name fallback
      const user = await User.findById(biz.ownerId);

      results.push({
        id: biz.ownerId,
        companyName: biz.companyName || user?.name || "Unknown Company",
        industry: biz.industry || "General",
        location: biz.location?.city ? `${biz.location.city}, ${biz.location.country}` : "Global",
        offerings: biz.offerings || [],
        needs: biz.needs || [],
        goal: biz.intent?.currentGoal || "",
        verified: user?.verified || biz.trust?.verificationStatus === "Business Verified",
      });
    }

    return NextResponse.json({ count: results.length, businesses: results });
  } catch (err: any) {
    console.error("Explore API error:", err);
    return NextResponse.json({ msg: "Server Error", error: err.message }, { status: 500 });
  }
}
