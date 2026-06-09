import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Business from "@/models/Business";
import MatchRecord from "@/models/MatchRecord";
import Meeting from "@/models/Meeting";
import IntroRequest from "@/models/IntroRequest";
import Rating from "@/models/Rating";
import Flag from "@/models/Flag";
import Subscription from "@/models/Subscription";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();

    const now = new Date();
    const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);
    const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);

    const [
      totalUsers, activeUsers, suspendedUsers, newTodayUsers, verifiedUsers, flaggedUsers,
      totalBiz, pendingVerif, verifiedBiz,
      matchesToday, totalMatches,
      requestsSent, requestsAccepted, requestsPending,
      meetingsScheduled, meetingsCompleted, meetingsCancelled,
      pendingFlags, totalRatings, lowRatings,
      totalSubs, proSubs, freeSubs,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: "ACTIVE" }),
      User.countDocuments({ status: "SUSPENDED" }),
      User.countDocuments({ createdAt: { $gte: startOfDay } }),
      User.countDocuments({ verified: true }),
      User.countDocuments({ isFlagged: true }),
      Business.countDocuments(),
      Business.countDocuments({ verificationStatus: { $in: ["Pending", "Under Review"] } }),
      Business.countDocuments({ verificationStatus: "Approved" }),
      MatchRecord.countDocuments({ createdAt: { $gte: startOfDay } }),
      MatchRecord.countDocuments(),
      IntroRequest.countDocuments(),
      IntroRequest.countDocuments({ status: "accepted" }),
      IntroRequest.countDocuments({ status: "pending" }),
      Meeting.countDocuments({ status: { $in: ["scheduled", "pending"] } }),
      Meeting.countDocuments({ status: "completed" }),
      Meeting.countDocuments({ status: "cancelled" }),
      Flag.countDocuments({ status: "Open" }),
      Rating.countDocuments(),
      Rating.countDocuments({ rating: { $lte: 2 } }),
      Subscription.countDocuments({ status: "ACTIVE" }),
      Subscription.countDocuments({ plan: "PRO", status: "ACTIVE" }),
      Subscription.countDocuments({ plan: "FREE", status: "ACTIVE" }),
    ]);

    // Funnel rates
    const signupToProfile = totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0;
    const acceptanceRate = requestsSent > 0 ? Math.round((requestsAccepted / requestsSent) * 100) : 0;
    const requestToMeeting = requestsAccepted > 0 ? Math.round((meetingsScheduled + meetingsCompleted) / requestsAccepted * 100) : 0;
    const meetingCompletionRate = (meetingsScheduled + meetingsCompleted) > 0
      ? Math.round((meetingsCompleted / (meetingsScheduled + meetingsCompleted)) * 100) : 0;

    // Platform health: avg of 4 funnel metrics
    const healthScore = Math.round((signupToProfile + acceptanceRate + requestToMeeting + meetingCompletionRate) / 4);

    return NextResponse.json({
      healthScore,
      users: { total: totalUsers, active: activeUsers, suspended: suspendedUsers, newToday: newTodayUsers, verified: verifiedUsers, flagged: flaggedUsers },
      businesses: { total: totalBiz, pendingVerification: pendingVerif, verified: verifiedBiz },
      activity: {
        matchesToday, totalMatches,
        requestsSent, requestsAccepted, requestsPending,
        meetingsScheduled, meetingsCompleted, meetingsCancelled,
      },
      trust: { pendingVerification: pendingVerif, flagged: pendingFlags, lowRated: lowRatings, totalRatings },
      revenue: { activeSubscriptions: totalSubs, proUsers: proSubs, freeUsers: freeSubs },
      funnel: { signupToProfile, acceptanceRate, requestToMeeting, meetingCompletionRate },
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
