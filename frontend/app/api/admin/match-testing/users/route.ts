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
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    // Fetch all regular users (not admins)
    const allUsers = await User.find({ role: { $nin: ["ADMIN", "SUPER_ADMIN"] } })
      .sort("-createdAt")
      .limit(limit)
      .lean();

    // Enrich with business info
    const enriched = await Promise.all(
      allUsers.map(async (u: any) => {
        const biz = await Business.findOne({ ownerId: u._id }).lean();
        return {
          _id: u._id,
          name: u.name,
          email: u.email,
          business: biz
            ? { companyName: (biz as any).companyName, industry: (biz as any).industry }
            : null,
        };
      })
    );

    return NextResponse.json({ users: enriched });
  } catch (err: any) {
    console.error("match-testing/users error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
