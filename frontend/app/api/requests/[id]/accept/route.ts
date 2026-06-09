import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import IntroRequest from "@/models/IntroRequest";
import Connection from "@/models/Connection";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const introRequest = await IntroRequest.findById(id);
    if (!introRequest) {
      return NextResponse.json({ msg: "Request not found" }, { status: 404 });
    }

    if (introRequest.status !== "pending") {
      return NextResponse.json({ msg: "Request already actioned" }, { status: 409 });
    }

    // Generate a unique shared connection token
    const connectionToken = randomUUID();

    // Update the intro request
    introRequest.status = "accepted";
    introRequest.connectionToken = connectionToken;
    await introRequest.save();

    // Create the Connection document for both users
    const connection = await Connection.create({
      token: connectionToken,
      userA: introRequest.senderId,
      userB: introRequest.receiverId,
      userABizName: introRequest.senderBizName,
      userBBizName: introRequest.receiverBizName,
      dealType: introRequest.dealType,
      requestId: introRequest._id,
      status: "active",
    });

    return NextResponse.json({
      msg: "Request accepted",
      connectionToken,
      connection,
      request: introRequest,
    });
  } catch (err: any) {
    console.error("Accept request error:", err);
    return NextResponse.json({ msg: "Server error", error: err.message }, { status: 500 });
  }
}
