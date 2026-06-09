import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Business from "@/models/Business";
import IntroRequest from "@/models/IntroRequest";
import Connection from "@/models/Connection";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await dbConnect();
    const { userId } = await params;

    // 1. Fetch user's business profile for trust rating
    const business = await Business.findOne({ ownerId: userId });

    // 2. Count Total Matches
    const totalMatches = await Business.countDocuments({
      ownerId: { $ne: userId },
      $or: [
        { industry: business?.industry },
        { offerings: { $in: business?.needs || [] } },
        { needs: { $in: business?.offerings || [] } },
      ],
    });

    // 3. New Opportunities (businesses added in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newOpportunities = await Business.countDocuments({
      ownerId: { $ne: userId },
      createdAt: { $gte: sevenDaysAgo },
    });

    // 4. Real Pending Requests (received by this user)
    const pendingRequests = await IntroRequest.countDocuments({
      receiverId: userId,
      status: "pending",
    });

    // 5. Active Connections (Deals In Progress)
    const activeConnections = await Connection.countDocuments({
      $or: [{ userA: userId }, { userB: userId }],
      status: "active",
    });

    const stats = [
      {
        name: "Total Matches",
        value: totalMatches.toString(),
        change: totalMatches > 0 ? `+${totalMatches}` : "0",
        changeType: totalMatches > 0 ? "positive" : "neutral",
        href: "/matches",
      },
      {
        name: "New Opportunities",
        value: newOpportunities.toString(),
        change: newOpportunities > 0 ? `+${newOpportunities}` : "0",
        changeType: newOpportunities > 0 ? "positive" : "neutral",
        href: "/explore",
      },
      {
        name: "Pending Requests",
        value: pendingRequests.toString(),
        change: pendingRequests > 0 ? `+${pendingRequests} new` : "0",
        changeType: pendingRequests > 0 ? "positive" : "neutral",
        href: "/requests",
      },
      {
        name: "Meetings This Week",
        value: "0",
        change: "0",
        changeType: "neutral",
        href: "/meetings",
      },
      {
        name: "Deals In Progress",
        value: activeConnections.toString(),
        change: activeConnections > 0 ? `${activeConnections} active` : "0",
        changeType: activeConnections > 0 ? "positive" : "neutral",
        href: "/requests",
      },
      {
        name: "Trust Rating",
        value:
          business?.trust?.verificationStatus === "Business Verified"
            ? "4.8 ★"
            : "—",
        change: "Verified",
        changeType: "positive",
        href: "/profile",
      },
    ];

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { msg: "Server Error", error: error.message },
      { status: 500 }
    );
  }
}
