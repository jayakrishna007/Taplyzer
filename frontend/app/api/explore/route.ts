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

    // Pre-fetch all users to avoid N+1 query loop
    const users = await User.find({}).lean();
    const userMap = new Map<string, any>(
      users.map((u: any) => [u._id?.toString() || u.id?.toString() || "", u])
    );

    const results = [];

    for (const biz of businesses) {
      // Lookup the associated user from memory
      const user = biz.ownerId ? userMap.get(biz.ownerId.toString()) : null;

      results.push({
        id: biz.ownerId,
        companyName: biz.companyName || user?.name || "Unknown Company",
        industry: biz.industry || "General",
        location: biz.location?.city ? `${biz.location.city}, ${biz.location.country}` : "Global",
        offerings: biz.offerings || [],
        needs: biz.needs || [],
        goal: biz.intent?.currentGoal || "",
        goalType: biz.intent?.goalType || "",
        goalIndustry: biz.intent?.goalIndustry || "",
        verified: user?.verified || biz.trust?.verificationStatus === "Business Verified",
      });
    }

    return NextResponse.json({ count: results.length, businesses: results });
  } catch (err: any) {
    console.error("Explore API error:", err);
    return NextResponse.json({ msg: "Server Error", error: err.message }, { status: 500 });
  }
}
