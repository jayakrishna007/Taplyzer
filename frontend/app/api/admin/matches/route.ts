import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import MatchRecord from "@/models/MatchRecord";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const outcome = searchParams.get("outcome") || "";
    const skip = (page - 1) * limit;

    const query: any = {};
    if (outcome) query.outcome = outcome;

    const [matches, total] = await Promise.all([
      MatchRecord.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name email")
        .populate("matchedUserId", "name email"),
      MatchRecord.countDocuments(query),
    ]);

    // Aggregate stats
    const [avgScoreResult, outcomeCounts, scoreBuckets] = await Promise.all([
      MatchRecord.aggregate([{ $group: { _id: null, avg: { $avg: "$score" } } }]),
      MatchRecord.aggregate([
        { $group: { _id: "$outcome", count: { $sum: 1 } } },
      ]),
      MatchRecord.aggregate([
        {
          $bucket: {
            groupBy: "$score",
            boundaries: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 101],
            default: "Other",
            output: { count: { $sum: 1 } }
          }
        }
      ])
    ]);

    const avgScore = avgScoreResult[0]?.avg ? Math.round(avgScoreResult[0].avg) : 0;

    const outcomeMap: Record<string, number> = {};
    for (const o of outcomeCounts) {
      outcomeMap[o._id || "pending"] = o.count;
    }

    return NextResponse.json({
      matches,
      total,
      page,
      pages: Math.ceil(total / limit),
      stats: { 
        total,
        avgScore, 
        meetingScheduled: outcomeMap["Meeting"] || 0,
        ignored: outcomeMap["Ignored"] || 0,
        scoreBuckets 
      },
    });
  } catch (err: any) {
    console.error("Admin matches error:", err);
    return NextResponse.json({ msg: "Server Error", error: err.message }, { status: 500 });
  }
}
