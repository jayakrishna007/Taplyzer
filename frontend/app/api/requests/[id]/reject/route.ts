import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import IntroRequest from "@/models/IntroRequest";

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

    introRequest.status = "rejected";
    await introRequest.save();

    return NextResponse.json({ msg: "Request rejected", request: introRequest });
  } catch (err: any) {
    console.error("Reject request error:", err);
    return NextResponse.json({ msg: "Server error", error: err.message }, { status: 500 });
  }
}
