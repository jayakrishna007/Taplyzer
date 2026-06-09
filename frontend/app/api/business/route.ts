import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Business from "@/models/Business";
import User from "@/models/User";
import MatchRecord from "@/models/MatchRecord";

export async function POST(req: Request) {
  try {
    await dbConnect();
    
    // In a real app with auth, we'd get the user ID from the session/token.
    // Since there's no auth connected yet, we'll extract it from the request body
    // or use a dummy ID for testing purposes (like Riya's ID from seed).
    const body = await req.json();
    
    const { ownerId, ...businessData } = body;
    
    if (!ownerId) {
      return NextResponse.json({ msg: "ownerId is required" }, { status: 400 });
    }

    // Update the business profile
    const business = await Business.findOneAndUpdate(
      { ownerId },
      businessData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Also update the User's lastActive status
    await User.findByIdAndUpdate(ownerId, { lastActive: new Date() });

    // Invalidate match cache since profile changed
    await MatchRecord.deleteMany({ userId: ownerId });

    return NextResponse.json({ msg: "Business profile saved successfully", business });
  } catch (error: any) {
    console.error("Error saving business profile:", error);
    return NextResponse.json({ msg: "Server Error", error: error.message }, { status: 500 });
  }
}
