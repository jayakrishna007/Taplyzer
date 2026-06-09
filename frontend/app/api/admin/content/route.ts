import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Banner from "@/models/Banner";
import AdminLog from "@/models/AdminLog";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "";

    const query: any = {};
    if (type) query.type = type;

    const items = await Banner.find(query)
      .populate("businessId", "name industry")
      .sort({ order: 1, createdAt: -1 })
      .lean();

    const [banners, announcements, featured] = await Promise.all([
      Banner.countDocuments({ type: "banner" }),
      Banner.countDocuments({ type: "announcement" }),
      Banner.countDocuments({ type: "featured_business" }),
    ]);

    return NextResponse.json({ items, stats: { banners, announcements, featured } });
  } catch (err) {
    console.error("Content GET error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { adminId, ...data } = body;

    const item = await Banner.create({ ...data, createdBy: adminId || null });

    if (adminId) {
      await AdminLog.create({
        adminId, action: "CONTENT_CREATED", targetType: "Banner", targetId: item._id,
        notes: `Created ${data.type}: ${data.title}`,
      });
    }
    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error("Content POST error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();
    const { itemId, adminId, ...updates } = await req.json();

    const item = await Banner.findByIdAndUpdate(itemId, updates, { new: true });
    if (adminId) {
      await AdminLog.create({
        adminId, action: "CONTENT_UPDATED", targetType: "Banner", targetId: itemId,
        notes: `Updated content item`,
      });
    }
    return NextResponse.json(item);
  } catch (err) {
    console.error("Content PATCH error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("id");
    const adminId = searchParams.get("adminId");

    await Banner.findByIdAndDelete(itemId);
    if (adminId) {
      await AdminLog.create({
        adminId, action: "CONTENT_DELETED", targetType: "Banner", targetId: itemId,
        notes: "Content item deleted",
      });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Content DELETE error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
