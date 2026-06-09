import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Business from "@/models/Business";
import IntroRequest from "@/models/IntroRequest";
import Meeting from "@/models/Meeting";
import Rating from "@/models/Rating";

export const dynamic = "force-dynamic";

type ActivityEvent = {
  type: string;
  actor: string;
  target: string;
  meta?: string;
  time: Date;
  color: string;
};

export async function GET() {
  try {
    await dbConnect();

    const events: ActivityEvent[] = [];

    // ── New User Signups (last 48h) ────────────────────────────────────────
    const recentUsers = await User.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .select("name createdAt");

    for (const u of recentUsers) {
      events.push({
        type: "USER_SIGNUP",
        actor: u.name || "Unknown User",
        target: "platform",
        time: u.createdAt,
        color: "blue",
      });
    }

    // ── Verification Submissions ───────────────────────────────────────────
    const recentBusinesses = await Business.find({ "trust.verificationStatus": { $ne: "Not Verified" } })
      .sort({ updatedAt: -1 })
      .limit(8)
      .select("companyName trust.verificationStatus updatedAt");

    for (const b of recentBusinesses) {
      const isApproved = b.trust?.verificationStatus === "Business Verified";
      events.push({
        type: isApproved ? "BUSINESS_VERIFIED" : "VERIFICATION_SUBMITTED",
        actor: b.companyName || "Unknown Business",
        target: b.trust?.verificationStatus || "",
        time: b.updatedAt,
        color: isApproved ? "emerald" : "amber",
      });
    }

    // ── Intro Requests ─────────────────────────────────────────────────────
    const recentRequests = await IntroRequest.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .select("senderBizName receiverBizName status createdAt");

    for (const r of recentRequests) {
      const isAccepted = r.status === "accepted";
      events.push({
        type: isAccepted ? "REQUEST_ACCEPTED" : "REQUEST_SENT",
        actor: r.senderBizName || "Unknown",
        target: r.receiverBizName || "Unknown",
        time: r.createdAt,
        color: isAccepted ? "emerald" : "purple",
      });
    }

    // ── Meetings ──────────────────────────────────────────────────────────
    const recentMeetings = await Meeting.find({})
      .sort({ createdAt: -1 })
      .limit(8)
      .select("status startTime createdAt organizerId attendeeId")
      .populate("organizerId", "name")
      .populate("attendeeId", "name");

    for (const m of recentMeetings) {
      const isCompleted = m.status === "COMPLETED";
      events.push({
        type: isCompleted ? "MEETING_COMPLETED" : "MEETING_SCHEDULED",
        actor: (m.organizerId as any)?.name || "Unknown",
        target: (m.attendeeId as any)?.name || "Unknown",
        meta: isCompleted ? "Completed" : `Scheduled: ${new Date(m.startTime).toLocaleDateString("en-IN")}`,
        time: m.createdAt,
        color: isCompleted ? "emerald" : "blue",
      });
    }

    // ── Ratings ───────────────────────────────────────────────────────────
    const recentRatings = await Rating.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select("fromBizName toBizName rating createdAt");

    for (const r of recentRatings) {
      events.push({
        type: "RATING_SUBMITTED",
        actor: r.fromBizName || "Unknown",
        target: r.toBizName || "Unknown",
        meta: `${r.rating}★`,
        time: r.createdAt,
        color: r.rating >= 4 ? "emerald" : r.rating <= 2 ? "red" : "amber",
      });
    }

    // Sort all events by time, newest first
    events.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    // Return top 30
    return NextResponse.json({ events: events.slice(0, 30) });
  } catch (err: any) {
    console.error("Activity feed error:", err);
    return NextResponse.json(
      { msg: "Server Error", error: err.message },
      { status: 500 }
    );
  }
}
