import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Flag from "@/models/Flag";
import User from "@/models/User";
import AdminLog from "@/models/AdminLog";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || "";
    const skip = (page - 1) * limit;

    const query: any = {};
    if (status) query.status = status;

    const [flags, total] = await Promise.all([
      Flag.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("reporterId", "name email")
        .populate("reportedUserId", "name email status")
        .populate("resolvedBy", "name"),
      Flag.countDocuments(query),
    ]);

    // Status counts
    const [open, underReview, resolved, dismissed] = await Promise.all([
      Flag.countDocuments({ status: "Open" }),
      Flag.countDocuments({ status: "Under Review" }),
      Flag.countDocuments({ status: "Resolved" }),
      Flag.countDocuments({ status: "Dismissed" }),
    ]);

    return NextResponse.json({
      flags,
      total,
      page,
      pages: Math.ceil(total / limit),
      stats: { open, underReview, resolved, dismissed },
    });
  } catch (err: any) {
    console.error("Admin flags error:", err);
    return NextResponse.json({ msg: "Server Error", error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { flagId, status, adminNotes, adminId } = body;

    if (!flagId || !status) {
      return NextResponse.json({ msg: "flagId and status required" }, { status: 400 });
    }

    const flag = await Flag.findByIdAndUpdate(
      flagId,
      {
        status,
        adminNotes: adminNotes || "",
        resolvedAt: ["Resolved", "Dismissed"].includes(status) ? new Date() : null,
        resolvedBy: adminId || null,
      },
      { new: true }
    );

    if (!flag) {
      return NextResponse.json({ msg: "Flag not found" }, { status: 404 });
    }

    // Write to AdminLog
    if (adminId) {
      await AdminLog.create({
        adminId,
        action: status === "Resolved" ? "FLAG_RESOLVED" : status === "Dismissed" ? "FLAG_DISMISSED" : "FLAG_UPDATED",
        targetId: flag._id,
        targetType: "Flag",
        notes: adminNotes || `Status updated to ${status}`,
      });
    }

    return NextResponse.json({ msg: "Updated", flag });
  } catch (err: any) {
    console.error("Admin flag PATCH error:", err);
    return NextResponse.json({ msg: "Server Error", error: err.message }, { status: 500 });
  }
}
