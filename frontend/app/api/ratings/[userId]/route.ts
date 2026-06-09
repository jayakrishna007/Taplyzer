import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/db";
import Rating from "@/models/Rating";
import Meeting from "@/models/Meeting";

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

// GET /api/ratings/[userId] — get received + given ratings + summary stats for a user
export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const requesterId = getUserIdFromRequest(req);
    if (!requesterId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const { userId } = await params;

    const [received, given] = await Promise.all([
      Rating.find({ toUserId: userId }).sort({ createdAt: -1 }).lean(),
      Rating.find({ fromUserId: userId }).sort({ createdAt: -1 }).lean(),
    ]);

    // Summary stats
    const totalReviews = received.length;
    const avgRating = totalReviews > 0
      ? parseFloat((received.reduce((s: number, r: any) => s + r.rating, 0) / totalReviews).toFixed(1))
      : 0;

    // Tag frequency
    const allTags: string[] = received.flatMap((r: any) => r.tags || []);
    const tagCount: Record<string, number> = {};
    allTags.forEach(t => { tagCount[t] = (tagCount[t] || 0) + 1; });

    // Communication breakdown
    const commGood    = received.filter((r: any) => r.communication === "Good").length;
    const commAvg     = received.filter((r: any) => r.communication === "Average").length;
    const commPoor    = received.filter((r: any) => r.communication === "Poor").length;
    const reliHigh    = received.filter((r: any) => r.reliability === "High").length;
    const dealStrong  = received.filter((r: any) => r.dealSeriousness === "Strong").length;

    // Pending: meetings this user attended that have no rating from them yet
    const myMeetings = await Meeting.find({
      $or: [{ organizerId: userId }, { attendeeId: userId }],
    }).select("_id").lean();
    const myMeetingIds = myMeetings.map((m: any) => m._id.toString());
    const ratedMeetingIds = given.map((r: any) => r.meetingId.toString());
    const pendingMeetingIds = myMeetingIds.filter((id: string) => !ratedMeetingIds.includes(id));

    return NextResponse.json({
      received,
      given,
      summary: {
        avgRating,
        totalReviews,
        tagCount,
        commGood,
        commAvg,
        commPoor,
        reliHigh,
        dealStrong,
        pendingCount: pendingMeetingIds.length,
      },
    });
  } catch (err: any) {
    console.error("Rating GET error:", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
