import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import SearchLog from "@/models/SearchLog";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "30");
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
      totalSearches,
      topQueries,
      zeroResultQueries,
      industryBreakdown,
      dailyVolume,
    ] = await Promise.all([
      SearchLog.countDocuments({ createdAt: { $gte: since } }),
      // Top 15 queries by frequency
      SearchLog.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: "$query", count: { $sum: 1 }, avgResults: { $avg: "$resultsCount" } } },
        { $sort: { count: -1 } },
        { $limit: 15 },
      ]),
      // Zero-result searches (demand without supply)
      SearchLog.aggregate([
        { $match: { createdAt: { $gte: since }, resultsCount: 0 } },
        { $group: { _id: "$query", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      // Industry filter breakdown
      SearchLog.aggregate([
        { $match: { createdAt: { $gte: since }, industryFilter: { $ne: "" } } },
        { $group: { _id: "$industryFilter", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      // Daily search volume (last 7 days)
      SearchLog.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    return NextResponse.json({
      totalSearches,
      topQueries: topQueries.map((q) => ({
        query: q._id,
        count: q.count,
        avgResults: Math.round(q.avgResults),
      })),
      zeroResultQueries: zeroResultQueries.map((q) => ({
        query: q._id,
        count: q.count,
      })),
      industryBreakdown: industryBreakdown.map((i) => ({
        industry: i._id,
        count: i.count,
      })),
      dailyVolume: dailyVolume.map((d) => ({
        date: d._id,
        count: d.count,
      })),
    });
  } catch (err: any) {
    console.error("Explore monitoring error:", err);
    return NextResponse.json({ msg: "Server Error", error: err.message }, { status: 500 });
  }
}
