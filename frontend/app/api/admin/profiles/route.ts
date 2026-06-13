import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Business from "@/models/Business";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const intent = searchParams.get("intent") || "";
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    const userQuery: any = { role: "USER" };
    if (intent) userQuery.activelyLookingFor = intent;
    if (search) {
      userQuery.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(userQuery)
        .sort({ profileCompletenessScore: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("name email designation activelyLookingFor profileCompletenessScore intentLastUpdated businessDescription status createdAt"),
      User.countDocuments(userQuery),
    ]);

    // Enrich with business data
    const userIds = users.map((u: any) => u._id);
    const businesses = await Business.find({ ownerId: { $in: userIds } })
      .select("ownerId companyName industry offerings needs intent.currentGoal isProfileCompleted");

    const bizMap = new Map<string, any>(businesses.map((b: any) => [b.ownerId.toString(), b]));

    const enriched = users.map((u: any) => {
      const biz = bizMap.get(u._id.toString());
      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        designation: u.designation,
        status: u.status,
        activelyLookingFor: u.activelyLookingFor,
        profileScore: u.profileCompletenessScore,
        intentLastUpdated: u.intentLastUpdated,
        businessDescription: u.businessDescription,
        createdAt: u.createdAt,
        // Business data
        companyName: biz?.companyName || "",
        industry: biz?.industry || "",
        currentGoal: biz?.intent?.currentGoal || "",
        offerings: biz?.offerings || [],
        needs: biz?.needs || [],
        isProfileCompleted: biz?.isProfileCompleted || false,
      };
    });

    // Stats
    const [totalUsers, completeProfiles, staleIntent, noIntent] = await Promise.all([
      User.countDocuments({ role: "USER" }),
      User.countDocuments({ role: "USER", profileCompletenessScore: { $gte: 80 } }),
      User.countDocuments({
        role: "USER",
        intentLastUpdated: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      }),
      User.countDocuments({ role: "USER", activelyLookingFor: "" }),
    ]);

    const profiles = enriched.map((p: any) => ({
      _id: p._id,
      name: p.companyName || p.name || "—",
      industry: p.industry || "—",
      userId: { name: p.name, email: p.email },
      offerings: p.offerings,
      needs: p.needs,
      goal: p.currentGoal || p.activelyLookingFor || "Not set",
      profileScore: p.profileScore || 0,
      updatedAt: p.intentLastUpdated || p.createdAt || new Date().toISOString(),
    }));

    return NextResponse.json({
      profiles,
      total,
      page,
      pages: Math.ceil(total / limit),
      stats: {
        total: totalUsers,
        highQuality: completeProfiles,
        stale: staleIntent,
        needsImprovement: noIntent,
      },
    });
  } catch (err: any) {
    console.error("Admin profiles error:", err);
    return NextResponse.json({ msg: "Server Error", error: err.message }, { status: 500 });
  }
}
