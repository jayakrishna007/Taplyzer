import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Business from "@/models/Business";
import MatchRecord from "@/models/MatchRecord";
import IntroRequest from "@/models/IntroRequest";
import Meeting from "@/models/Meeting";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "30");
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Daily pipeline volume (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [dailyMatches, dailyRequests, dailyMeetings] = await Promise.all([
      MatchRecord.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      IntroRequest.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Meeting.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Industry distribution
    const industryDistribution = await Business.aggregate([
      { $match: { industry: { $exists: true, $ne: "" } } },
      { $group: { _id: "$industry", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // City distribution
    const cityDistribution = await Business.aggregate([
      { $match: { "location.city": { $exists: true, $ne: "" } } },
      { $group: { _id: "$location.city", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    // Funnel conversion
    const [totalUsers, completedProfiles, totalRequests, acceptedRequests, totalMeetings, completedMeetings] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: since } }),
      User.countDocuments({ createdAt: { $gte: since }, verified: true }),
      IntroRequest.countDocuments({ createdAt: { $gte: since } }),
      IntroRequest.countDocuments({ createdAt: { $gte: since }, status: "accepted" }),
      Meeting.countDocuments({ createdAt: { $gte: since } }),
      Meeting.countDocuments({ createdAt: { $gte: since }, status: "completed" }),
    ]);

    // Signups trend (daily new users last 30d)
    const signupTrend = await User.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    return NextResponse.json({
      pipeline: { dailyMatches, dailyRequests, dailyMeetings },
      industryDistribution,
      cityDistribution,
      signupTrend,
      funnel: {
        totalSignups: totalUsers,
        profileComplete: completedProfiles,
        signupToProfileRate: totalUsers > 0 ? Math.round(completedProfiles / totalUsers * 100) : 0,
        requestsSent: totalRequests,
        requestsAccepted: acceptedRequests,
        acceptanceRate: totalRequests > 0 ? Math.round(acceptedRequests / totalRequests * 100) : 0,
        meetingsScheduled: totalMeetings,
        meetingsCompleted: completedMeetings,
        meetingCompletionRate: totalMeetings > 0 ? Math.round(completedMeetings / totalMeetings * 100) : 0,
      },
    });
  } catch (err) {
    console.error("Analytics error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
