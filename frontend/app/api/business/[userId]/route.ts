import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Business from "@/models/Business";
import MatchRecord from "@/models/MatchRecord";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await dbConnect();
    const { userId } = await params;

    const business = await Business.findOne({ ownerId: userId });
    
    if (!business) {
      return NextResponse.json({ msg: "Business profile not found" }, { status: 404 });
    }

    return NextResponse.json(business);
  } catch (error: any) {
    console.error("Error fetching business profile:", error);
    return NextResponse.json({ msg: "Server Error", error: error.message }, { status: 500 });
  }
}

