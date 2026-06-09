import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Business from "@/models/Business";

export async function GET() {
  try {
    await dbConnect();
    const businesses = await Business.find({}).sort({ createdAt: -1 });
    return NextResponse.json(businesses);
  } catch (error) {
    console.error("API Error (GET BUSINESSES):", error);
    return NextResponse.json({ error: "Failed to fetch businesses" }, { status: 500 });
  }
}
