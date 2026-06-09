import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import AdminLog from "@/models/AdminLog";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role") || "";

    const query: any = { role: { $in: ["ADMIN", "SUPER_ADMIN"] } };
    if (role) query.role = role;

    const admins = await User.find(query)
      .select("-password -__v")
      .sort({ role: 1, createdAt: -1 })
      .lean();

    // Get action counts for each admin from AdminLog
    const adminIds = admins.map((a: any) => a._id);
    const actionCounts = await AdminLog.aggregate([
      { $match: { adminId: { $in: adminIds } } },
      { $group: { _id: "$adminId", count: { $sum: 1 }, lastAction: { $max: "$createdAt" } } },
    ]);

    const countMap = new Map(actionCounts.map((a: any) => [a._id.toString(), { count: a.count, lastAction: a.lastAction }]));

    const enriched = admins.map((a: any) => ({
      ...a,
      actionCount: countMap.get(a._id.toString())?.count || 0,
      lastAction: countMap.get(a._id.toString())?.lastAction || null,
    }));

    const [totalAdmins, superAdmins] = await Promise.all([
      User.countDocuments({ role: { $in: ["ADMIN", "SUPER_ADMIN"] } }),
      User.countDocuments({ role: "SUPER_ADMIN" }),
    ]);

    return NextResponse.json({ admins: enriched, stats: { totalAdmins, superAdmins } });
  } catch (err) {
    console.error("Admins GET error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();
    const { targetAdminId, newRole, adminId } = await req.json();

    const validRoles = ["ADMIN", "SUPER_ADMIN", "USER"];
    if (!validRoles.includes(newRole)) return NextResponse.json({ error: "Invalid role" }, { status: 400 });

    await User.findByIdAndUpdate(targetAdminId, { role: newRole });
    if (adminId) {
      await AdminLog.create({
        adminId, action: "ADMIN_ROLE_CHANGED", targetType: "User", targetId: targetAdminId,
        notes: `Role changed to ${newRole}`,
      });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admins PATCH error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
