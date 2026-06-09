import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import MatchRecord from "@/models/MatchRecord";
import Meeting from "@/models/Meeting";
import IntroRequest from "@/models/IntroRequest";
import Business from "@/models/Business";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "30");
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Score distribution buckets (0-10, 10-20, ... 90-100)
    const scoreBuckets = await MatchRecord.aggregate([
      { $addFields: { bucket: { $multiply: [{ $floor: { $divide: ["$score", 10] } }, 10] } } },
      { $group: { _id: "$bucket", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Top-performing industry pairs
    const industryPairs = await MatchRecord.aggregate([
      { $match: { outcome: { $in: ["meeting_scheduled", "request_sent"] } } },
      {
        $lookup: { from: "businesses", localField: "userId", foreignField: "userId", as: "bizA" },
      },
      {
        $lookup: { from: "businesses", localField: "matchedUserId", foreignField: "userId", as: "bizB" },
      },
      {
        $group: {
          _id: { a: { $arrayElemAt: ["$bizA.industry", 0] }, b: { $arrayElemAt: ["$bizB.industry", 0] } },
          count: { $sum: 1 },
          avgScore: { $avg: "$score" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // Meeting conversion by outcome
    const outcomeBreakdown = await Meeting.aggregate([
      { $group: { _id: "$outcome", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Ignored high-score matches
    const missedOpportunities = await MatchRecord.find({ score: { $gte: 70 }, outcome: "ignored" })
      .populate("userId", "name email")
      .populate("matchedUserId", "name email")
      .sort({ score: -1 })
      .limit(10)
      .lean();

    // Key insight: verified vs unverified acceptance rate
    const [verifiedAccepted, unverifiedAccepted, verifiedTotal, unverifiedTotal] = await Promise.all([
      IntroRequest.aggregate([
        { $lookup: { from: "users", localField: "senderId", foreignField: "_id", as: "sender" } },
        { $unwind: "$sender" },
        { $match: { "sender.verified": true, status: "accepted" } },
        { $count: "count" },
      ]),
      IntroRequest.aggregate([
        { $lookup: { from: "users", localField: "senderId", foreignField: "_id", as: "sender" } },
        { $unwind: "$sender" },
        { $match: { "sender.verified": false, status: "accepted" } },
        { $count: "count" },
      ]),
      IntroRequest.aggregate([
        { $lookup: { from: "users", localField: "senderId", foreignField: "_id", as: "sender" } },
        { $unwind: "$sender" },
        { $match: { "sender.verified": true } },
        { $count: "count" },
      ]),
      IntroRequest.aggregate([
        { $lookup: { from: "users", localField: "senderId", foreignField: "_id", as: "sender" } },
        { $unwind: "$sender" },
        { $match: { "sender.verified": false } },
        { $count: "count" },
      ]),
    ]);

    const verifiedRate = verifiedTotal[0]?.count > 0
      ? Math.round((verifiedAccepted[0]?.count || 0) / verifiedTotal[0].count * 100) : 0;
    const unverifiedRate = unverifiedTotal[0]?.count > 0
      ? Math.round((unverifiedAccepted[0]?.count || 0) / unverifiedTotal[0].count * 100) : 0;
    const verifiedMultiplier = unverifiedRate > 0 ? (verifiedRate / unverifiedRate).toFixed(1) : "N/A";

    return NextResponse.json({
      scoreBuckets,
      industryPairs,
      outcomeBreakdown,
      missedOpportunities,
      insights: {
        verifiedAcceptanceRate: verifiedRate,
        unverifiedAcceptanceRate: unverifiedRate,
        verifiedMultiplier,
        hasEnoughData: (verifiedTotal[0]?.count || 0) + (unverifiedTotal[0]?.count || 0) >= 10,
      },
    });
  } catch (err) {
    console.error("AI Insights error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
