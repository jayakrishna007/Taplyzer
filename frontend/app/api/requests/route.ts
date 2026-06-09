import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import IntroRequest from "@/models/IntroRequest";
import Business from "@/models/Business";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { senderId, receiverId, dealType, message, summary, matchScore } = await req.json();

    if (!senderId || !receiverId || !dealType || !message) {
      return NextResponse.json({ msg: "Missing required fields" }, { status: 400 });
    }

    if (senderId === receiverId) {
      return NextResponse.json({ msg: "Cannot send request to yourself" }, { status: 400 });
    }

    // Prevent duplicate pending requests
    const existing = await IntroRequest.findOne({
      senderId,
      receiverId,
      status: "pending",
    });
    if (existing) {
      return NextResponse.json({ msg: "A pending request already exists to this user" }, { status: 409 });
    }

    // Fetch business names for display
    const senderBiz = await Business.findOne({ ownerId: senderId }).lean() as any;
    const receiverBiz = await Business.findOne({ ownerId: receiverId }).lean() as any;

    const introRequest = await IntroRequest.create({
      senderId,
      receiverId,
      senderBizName: senderBiz?.companyName || "Unknown",
      receiverBizName: receiverBiz?.companyName || "Unknown",
      dealType,
      message,
      summary: summary || "",
      matchScore: matchScore || 0,
      status: "pending",
    });

    return NextResponse.json({ msg: "Request sent", request: introRequest }, { status: 201 });
  } catch (err: any) {
    console.error("Send request error:", err);
    return NextResponse.json({ msg: "Server error", error: err.message }, { status: 500 });
  }
}
