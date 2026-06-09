import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import IntroRequest from "@/models/IntroRequest";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";
    const sort = searchParams.get("sort") || "-createdAt";

    const query: any = {};
    if (status) query.status = status;

    const [requests, total] = await Promise.all([
      IntroRequest.find(query)
        .populate("senderId", "name email")
        .populate("receiverId", "name email")
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      IntroRequest.countDocuments(query),
    ]);

    const [total_, pending, accepted, rejected, expired] = await Promise.all([
      IntroRequest.countDocuments(),
      IntroRequest.countDocuments({ status: "pending" }),
      IntroRequest.countDocuments({ status: "accepted" }),
      IntroRequest.countDocuments({ status: "rejected" }),
      IntroRequest.countDocuments({ status: "expired" }),
    ]);

    // Spam detection: senders with >5 requests and <20% acceptance rate
    const spamCandidates = await IntroRequest.aggregate([
      { $group: { _id: "$senderId", total: { $sum: 1 }, accepted: { $sum: { $cond: [{ $eq: ["$status", "accepted"] }, 1, 0] } } } },
      { $match: { total: { $gt: 5 } } },
      { $addFields: { acceptanceRate: { $divide: ["$accepted", "$total"] } } },
      { $match: { acceptanceRate: { $lt: 0.2 } } },
      { $sort: { total: -1 } },
      { $limit: 5 },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    ]);

    return NextResponse.json({
      requests, total, pages: Math.ceil(total / limit),
      stats: { total: total_, pending, accepted, rejected, expired },
      spamCandidates,
    });
  } catch (err) {
    console.error("Requests GET error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
