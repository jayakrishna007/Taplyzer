import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { FirestoreModel } from "@/lib/firestoreAdapter";

const Notification = new FirestoreModel("adminNotifications");

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();
    const notifications = await Notification.find({}).sort("-sentAt").limit(50).lean();
    return NextResponse.json({ notifications });
  } catch (err: any) {
    console.error("Notifications GET error:", err);
    return NextResponse.json({ msg: "Server Error", error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { title, message, audience, type, adminName } = body;

    if (!title || !message) {
      return NextResponse.json({ msg: "title and message are required" }, { status: 400 });
    }

    const notification = await Notification.create({
      title,
      message,
      audience: audience || "all",
      type: type || "announcement",
      adminName: adminName || "Admin",
      sentAt: new Date(),
      status: "Sent",
    });

    return NextResponse.json({ msg: "Notification broadcast", notification });
  } catch (err: any) {
    console.error("Notifications POST error:", err);
    return NextResponse.json({ msg: "Server Error", error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ msg: "id required" }, { status: 400 });
    await Notification.deleteOne({ _id: id });
    return NextResponse.json({ msg: "Deleted" });
  } catch (err: any) {
    return NextResponse.json({ msg: "Server Error", error: err.message }, { status: 500 });
  }
}
