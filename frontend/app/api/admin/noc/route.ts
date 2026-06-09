import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import MatchRecord from "@/models/MatchRecord";
import IntroRequest from "@/models/IntroRequest";
import Business from "@/models/Business";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // 1. Match quality metrics
    const [totalMatches, acceptedRequests, totalRequests, meetings] = await Promise.all([
      MatchRecord.countDocuments(),
      IntroRequest.countDocuments({ status: "accepted" }),
      IntroRequest.countDocuments(),
      (await import("@/models/Meeting")).default.countDocuments({ status: { $in: ["scheduled", "completed"] } }),
    ]);

    const acceptanceRate = totalRequests > 0 ? Math.round((acceptedRequests / totalRequests) * 100) : 0;
    const meetingConversionRate = acceptedRequests > 0 ? Math.round((meetings / acceptedRequests) * 100) : 0;

    // 2. Stuck deals — accepted requests with no meeting > 7 days ago
    const stuckDeals = await IntroRequest.find({ status: "accepted", updatedAt: { $lt: sevenDaysAgo } })
      .populate("senderId", "name email")
      .populate("receiverId", "name email")
      .sort({ updatedAt: 1 })
      .limit(10)
      .lean();

    // 3. Weak / ignored matches — low score or ignored status, from last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const weakMatches = await MatchRecord.find({
      $or: [{ score: { $lt: 50 } }, { outcome: "ignored" }],
      createdAt: { $gte: thirtyDaysAgo },
    })
      .populate("userId", "name email")
      .populate("matchedUserId", "name email")
      .sort({ score: 1 })
      .limit(15)
      .lean();

    // 4. High potential — high score matches not acted on
    const highPotential = await MatchRecord.find({
      score: { $gte: 75 },
      outcome: { $in: ["pending", "viewed", null] },
      createdAt: { $gte: thirtyDaysAgo },
    })
      .populate("userId", "name email")
      .populate("matchedUserId", "name email")
      .sort({ score: -1 })
      .limit(10)
      .lean();

    // 5. Businesses needing human review — low profile score, no intent
    const lowQualityBiz = await Business.find({
      $or: [
        { profileScore: { $lt: 40 } },
        { "offerings.0": { $exists: false } },
        { "needs.0": { $exists: false } },
      ],
    })
      .select("name industry profileScore offerings needs userId")
      .populate("userId", "name email")
      .sort({ profileScore: 1 })
      .limit(10)
      .lean();

    return NextResponse.json({
      metrics: { totalMatches, acceptanceRate, meetingConversionRate, stuckDealsCount: stuckDeals.length },
      stuckDeals,
      weakMatches,
      highPotential,
      humanReviewQueue: lowQualityBiz,
    });
  } catch (err) {
    console.error("NOC error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
