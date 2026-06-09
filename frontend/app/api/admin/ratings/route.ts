import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Rating from "@/models/Rating";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const minRating = parseInt(searchParams.get("minRating") || "1");
    const maxRating = parseInt(searchParams.get("maxRating") || "5");
    const skip = (page - 1) * limit;

    const query: any = { rating: { $gte: minRating, $lte: maxRating } };

    const [ratings, total] = await Promise.all([
      Rating.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("fromBizName toBizName rating tags communication reliability dealSeriousness comment dealType createdAt"),
      Rating.countDocuments(query),
    ]);

    // Aggregate stats
    const [avgResult, distribution, tagCounts] = await Promise.all([
      Rating.aggregate([{ $group: { _id: null, avg: { $avg: "$rating" }, total: { $sum: 1 } } }]),
      Rating.aggregate([
        { $group: { _id: "$rating", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Rating.aggregate([
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    const avgRating = avgResult[0]?.avg ? parseFloat(avgResult[0].avg.toFixed(1)) : 0;
    const totalRatings = avgResult[0]?.total || 0;
    const highRatings = (await Rating.countDocuments({ rating: { $gte: 4 } }));
    const lowRatings = (await Rating.countDocuments({ rating: { $lte: 2 } }));

    return NextResponse.json({
      ratings,
      total,
      page,
      pages: Math.ceil(total / limit),
      stats: { avgRating, totalRatings, highRatings, lowRatings, distribution, topTags: tagCounts },
    });
  } catch (err: any) {
    console.error("Admin ratings error:", err);
    return NextResponse.json({ msg: "Server Error", error: err.message }, { status: 500 });
  }
}
