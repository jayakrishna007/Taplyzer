import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/db";
import Rating from "@/models/Rating";
import Meeting from "@/models/Meeting";
import Connection from "@/models/Connection";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_taplyzer_jwt_key_2026";

function getUserIdFromRequest(req: Request) {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return null;
  const tokenMatch = cookieHeader.match(/taplyzer_auth_token=([^;]+)/);
  if (!tokenMatch) return null;
  try {
    const decoded: any = jwt.verify(tokenMatch[1], JWT_SECRET);
    return decoded.userId;
  } catch {
    return null;
  }
}

// POST /api/ratings — Submit a rating after a meeting OR from a connection
export async function POST(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { meetingId, connectionId, rating, tags, communication, reliability, dealSeriousness, comment } = await req.json();

    if (!rating) {
      return NextResponse.json({ error: "rating is required" }, { status: 400 });
    }
    if (!meetingId && !connectionId) {
      return NextResponse.json({ error: "meetingId or connectionId is required" }, { status: 400 });
    }

    await dbConnect();

    let toUserId: any = null;
    let fromBizName = "";
    let toBizName = "";
    let dealType = "";
    let resolvedMeetingId: any = null;
    let resolvedConnectionId: any = null;

    if (meetingId) {
      // Rating from a specific meeting
      const meeting = await Meeting.findById(meetingId).populate("connectionId");
      if (!meeting) return NextResponse.json({ error: "Meeting not found" }, { status: 404 });

      const isOrganizer = meeting.organizerId.toString() === userId;
      const isAttendee  = meeting.attendeeId.toString()  === userId;
      if (!isOrganizer && !isAttendee) {
        return NextResponse.json({ error: "You were not part of this meeting" }, { status: 403 });
      }

      toUserId = isOrganizer ? meeting.attendeeId : meeting.organizerId;
      const conn = meeting.connectionId as any;
      const isUserA = conn?.userA?.toString() === userId;
      fromBizName = isUserA ? (conn?.userABizName || "") : (conn?.userBBizName || "");
      toBizName   = isUserA ? (conn?.userBBizName || "") : (conn?.userABizName || "");
      dealType = conn?.dealType || "";
      resolvedMeetingId = meetingId;
      resolvedConnectionId = conn?._id;
    } else {
      // Rating from a connection token string (no specific meeting)
      const connection = await Connection.findOne({ token: connectionId });
      if (!connection) return NextResponse.json({ error: "Connection not found" }, { status: 404 });

      const isUserA = connection.userA.toString() === userId;
      const isUserB = connection.userB.toString() === userId;
      if (!isUserA && !isUserB) {
        return NextResponse.json({ error: "You are not part of this connection" }, { status: 403 });
      }

      toUserId = isUserA ? connection.userB : connection.userA;
      fromBizName = isUserA ? (connection.userABizName || "") : (connection.userBBizName || "");
      toBizName   = isUserA ? (connection.userBBizName || "") : (connection.userABizName || "");
      dealType = connection.dealType || "";
      resolvedConnectionId = connection._id;
    }

    // Unique key: fromUser + toUser + connection (allows one rating per connection, not per meeting)
    const existing = await Rating.findOne({ fromUserId: userId, toUserId, ...(resolvedConnectionId ? { connectionId: resolvedConnectionId } : {}) });
    if (existing) {
      return NextResponse.json({ error: "You have already rated this partner for this connection" }, { status: 409 });
    }

    const newRating = await Rating.create({
      fromUserId: userId,
      toUserId,
      meetingId: resolvedMeetingId,
      connectionId: resolvedConnectionId,
      fromBizName,
      toBizName,
      dealType,
      rating,
      tags: tags || [],
      communication: communication || "",
      reliability: reliability || "",
      dealSeriousness: dealSeriousness || "",
      comment: comment || "",
    });

    return NextResponse.json({ success: true, rating: newRating }, { status: 201 });
  } catch (err: any) {
    if (err.code === 11000) {
      return NextResponse.json({ error: "You have already rated this partner" }, { status: 409 });
    }
    console.error("Rating POST error:", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
