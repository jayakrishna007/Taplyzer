import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import AdminLog from "@/models/AdminLog";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "30");
    const action = searchParams.get("action") || "";
    const targetType = searchParams.get("targetType") || "";
    const skip = (page - 1) * limit;

    const query: any = {};
    if (action) query.action = { $regex: action, $options: "i" };
    if (targetType) query.targetType = targetType;

    const [logs, total] = await Promise.all([
      AdminLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("adminId", "name email"),
      AdminLog.countDocuments(query),
    ]);

    // Action type breakdown
    const actionBreakdown = await AdminLog.aggregate([
      { $group: { _id: "$action", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    return NextResponse.json({
      logs,
      total,
      page,
      pages: Math.ceil(total / limit),
      actionBreakdown,
    });
  } catch (err: any) {
    console.error("Admin activity logs error:", err);
    return NextResponse.json({ msg: "Server Error", error: err.message }, { status: 500 });
  }
}
