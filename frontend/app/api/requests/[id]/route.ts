import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import IntroRequest from "@/models/IntroRequest";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const [received, sent] = await Promise.all([
      IntroRequest.find({ receiverId: id }).sort({ createdAt: -1 }).lean(),
      IntroRequest.find({ senderId: id }).sort({ createdAt: -1 }).lean(),
    ]);

    return NextResponse.json({ received, sent });
  } catch (err: any) {
    console.error("Fetch requests error:", err);
    return NextResponse.json({ msg: "Server error", error: err.message }, { status: 500 });
  }
}
