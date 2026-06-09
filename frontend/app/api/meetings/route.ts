import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Connection from "@/models/Connection";
import Meeting from "@/models/Meeting";

const WHEREBY_API_KEY = process.env.WHEREBY_API_KEY;
const WHEREBY_API_BASE = "https://api.whereby.dev/v1";
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

export async function POST(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { connectionToken, startTime, durationMinutes } = await req.json();

    if (!connectionToken || !startTime || !durationMinutes) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!WHEREBY_API_KEY) {
      return NextResponse.json(
        { error: "Whereby API key not configured. Please add WHEREBY_API_KEY to .env.local" },
        { status: 500 }
      );
    }

    await dbConnect();

    const connection = await Connection.findOne({ token: connectionToken });
    if (!connection) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 });
    }

    // Determine roles
    const isUserA = connection.userA.toString() === userId;
    const isUserB = connection.userB.toString() === userId;

    if (!isUserA && !isUserB) {
      return NextResponse.json({ error: "Unauthorized for this connection" }, { status: 403 });
    }

    const attendeeId = isUserA ? connection.userB : connection.userA;

    const startDate = new Date(startTime);
    // Fixed 40-minute room duration as configured
    const endDate = new Date(startDate.getTime() + 40 * 60 * 1000);

    // Create a Whereby meeting room via the REST API
    const wherebyRes = await fetch(`${WHEREBY_API_BASE}/meetings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WHEREBY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endDate: endDate.toISOString(),
        // group mode allows multiple participants
        roomMode: "group",
        // request hostRoomUrl so the organizer gets host controls
        fields: ["hostRoomUrl"],
      }),
    });

    if (!wherebyRes.ok) {
      const errBody = await wherebyRes.text();
      console.error("Whereby API error:", errBody);
      return NextResponse.json({ error: "Failed to create Whereby room" }, { status: 500 });
    }

    const wherebyData = await wherebyRes.json();
    const meetLink: string = wherebyData.roomUrl;       // attendee join URL
    const hostMeetLink: string = wherebyData.hostRoomUrl; // organizer host URL

    if (!meetLink) {
      throw new Error("Whereby did not return a roomUrl");
    }

    const newMeeting = await Meeting.create({
      connectionId: connection._id,
      organizerId: userId,
      attendeeId: attendeeId,
      startTime: startDate,
      endTime: endDate,
      meetLink,       // attendee URL — stored same field name as before
      hostMeetLink,   // new field for organizer host URL
      provider: "whereby",
      status: "SCHEDULED",
    });

    // Push the meeting to connection's meetingIds
    connection.meetingIds = connection.meetingIds || [];
    connection.meetingIds.push(newMeeting._id);
    await connection.save();

    return NextResponse.json(newMeeting, { status: 201 });

  } catch (error) {
    console.error("Failed to schedule meeting:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const url = new URL(req.url);
    const connectionToken = url.searchParams.get("connectionToken");

    let query: any = {
      $or: [{ organizerId: userId }, { attendeeId: userId }],
    };

    if (connectionToken) {
      const connection = await Connection.findOne({ token: connectionToken });
      if (!connection) {
        return NextResponse.json({ error: "Connection not found" }, { status: 404 });
      }
      query.connectionId = connection._id;
    }

    const meetings = await Meeting.find(query)
      .populate("organizerId", "name")
      .populate("attendeeId", "name")
      .populate("connectionId", "token userABizName userBBizName")
      .sort({ startTime: 1 });

    return NextResponse.json({ meetings });

  } catch (error) {
    console.error("Failed to fetch meetings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { meetingId, status, outcome } = await req.json();

    if (!meetingId) {
      return NextResponse.json({ error: "meetingId is required" }, { status: 400 });
    }

    await dbConnect();

    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    // Verify user is part of the meeting
    const isOrganizer = meeting.organizerId.toString() === userId;
    const isAttendee = meeting.attendeeId.toString() === userId;

    if (!isOrganizer && !isAttendee) {
      return NextResponse.json({ error: "Unauthorized for this meeting" }, { status: 403 });
    }

    if (status) {
      meeting.status = status;
    }
    if (outcome) {
      meeting.outcome = outcome;
    }

    await meeting.save();

    return NextResponse.json({ success: true, meeting });
  } catch (error) {
    console.error("Failed to update meeting:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
