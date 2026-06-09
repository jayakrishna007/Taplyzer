import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Subscription from "@/models/Subscription";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const plan = searchParams.get("plan") || "";
    const status = searchParams.get("status") || "";

    const query: any = {};
    if (plan) query.plan = plan;
    if (status) query.status = status;

    const [subs, total] = await Promise.all([
      Subscription.find(query)
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Subscription.countDocuments(query),
    ]);

    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const [totalActive, proCount, freeCount, enterpriseCount, expiringSoon] = await Promise.all([
      Subscription.countDocuments({ status: "ACTIVE" }),
      Subscription.countDocuments({ plan: "PRO", status: "ACTIVE" }),
      Subscription.countDocuments({ plan: "FREE", status: "ACTIVE" }),
      Subscription.countDocuments({ plan: "ENTERPRISE", status: "ACTIVE" }),
      Subscription.countDocuments({ status: "ACTIVE", endDate: { $lte: thirtyDaysFromNow, $ne: null } }),
    ]);

    return NextResponse.json({
      subscriptions: subs, total, pages: Math.ceil(total / limit),
      stats: { totalActive, proCount, freeCount, enterpriseCount, expiringSoon },
    });
  } catch (err) {
    console.error("Subscriptions GET error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
