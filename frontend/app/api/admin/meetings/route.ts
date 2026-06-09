import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Meeting from "@/models/Meeting";
import AdminLog from "@/models/AdminLog";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || "";
    const provider = searchParams.get("provider") || "";
    const skip = (page - 1) * limit;

    const query: any = {};
    // Case-insensitive status match to handle SCHEDULED/scheduled variants
    if (status) query.status = { $regex: new RegExp(`^${status}$`, "i") };
    if (provider) query.provider = provider;

    const [meetings, total] = await Promise.all([
      Meeting.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("organizerId", "name email")
        .populate("attendeeId", "name email")
        // Return Whereby-specific fields
        .select("+provider +hostMeetLink +meetLink +outcome"),
      Meeting.countDocuments(query),
    ]);

    // Status breakdown stats (case-insensitive)
    const [scheduled, completed, cancelled, wherebyCount] = await Promise.all([
      Meeting.countDocuments({ status: { $regex: /^scheduled$/i } }),
      Meeting.countDocuments({ status: { $regex: /^completed$/i } }),
      Meeting.countDocuments({ status: { $regex: /^cancelled$/i } }),
      Meeting.countDocuments({ provider: "whereby" }),
    ]);

    return NextResponse.json({
      meetings,
      total,
      page,
      pages: Math.ceil(total / limit),
      stats: {
        scheduled,
        completed,
        cancelled,
        total: scheduled + completed + cancelled,
        wherebyCount,  // how many rooms are Whereby-powered
      },
    });
  } catch (err: any) {
    console.error("Admin meetings error:", err);
    return NextResponse.json({ msg: "Server Error", error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { meetingId, action, payload, adminId } = body;

    if (!meetingId || !action) {
      return NextResponse.json({ msg: "meetingId and action are required" }, { status: 400 });
    }

    const meeting = await Meeting.findById(meetingId);
    if (!meeting) return NextResponse.json({ msg: "Meeting not found" }, { status: 404 });

    if (action === "UPDATE_OUTCOME") {
      meeting.outcome = payload?.outcome;
      await meeting.save();
      await AdminLog.create({ adminId, action: "UPDATE_MEETING_OUTCOME", targetId: meetingId, notes: payload?.outcome });
    } else if (action === "CANCEL") {
      meeting.status = "CANCELLED";
      await meeting.save();
      await AdminLog.create({ adminId, action: "CANCEL_MEETING", targetId: meetingId });
    } else {
      return NextResponse.json({ msg: "Unknown action" }, { status: 400 });
    }

    return NextResponse.json({ msg: "Updated", meeting });
  } catch (err: any) {
    console.error("Admin meetings PATCH error:", err);
    return NextResponse.json({ msg: "Server Error", error: err.message }, { status: 500 });
  }
}
