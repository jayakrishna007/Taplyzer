import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import AdminLog from "@/models/AdminLog";
import Business from "@/models/Business";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_taplyzer_jwt_key_2026";

// ─── AUTH HELPER — cookie-first, body adminId fallback ───────────────────────
// The admin layout already gate-keeps these pages. This adds a server-side
// identity check: we try the JWT cookie first; if that fails (e.g. context
// issue) we accept an explicit adminId from the body and verify it in DB.
async function resolveAdmin(
  bodyAdminId?: string
): Promise<{ _id: string; role: string } | null> {
  await dbConnect();

  // 1. Try cookie
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("taplyzer_auth_token")?.value;
    if (token) {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const userFromCookie = await User.findById(decoded.userId)
        .select("role _id")
        .lean() as any;
      if (
        userFromCookie &&
        (userFromCookie.role === "ADMIN" || userFromCookie.role === "SUPER_ADMIN")
      ) {
        return userFromCookie;
      }
    }
  } catch {
    // Cookie failed — fall through to body fallback
  }

  // 2. Fallback: explicit adminId sent from the frontend
  if (bodyAdminId) {
    const userFromBody = await User.findById(bodyAdminId)
      .select("role _id")
      .lean() as any;
    if (
      userFromBody &&
      (userFromBody.role === "ADMIN" || userFromBody.role === "SUPER_ADMIN")
    ) {
      return userFromBody;
    }
  }

  return null;
}

// ─── GET — list users with filters + stats ───────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const role = searchParams.get("role") || "";
    const sort = searchParams.get("sort") || "-createdAt";

    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (status) query.status = status;
    if (role) query.role = role;

    const [users, total] = await Promise.all([
      User.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .select("-password -__v")
        .lean(),
      User.countDocuments(query),
    ]);

    const [totalCount, activeCount, suspendedCount, newToday] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: "ACTIVE" }),
      User.countDocuments({ status: "SUSPENDED" }),
      User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 86400000) } }),
    ]);

    return NextResponse.json({
      users,
      total,
      pages: Math.ceil(total / limit),
      stats: { total: totalCount, active: activeCount, suspended: suspendedCount, newToday },
    });
  } catch (err) {
    console.error("Users GET error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// ─── PATCH — in-place user actions ───────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { userId, action, adminId: bodyAdminId, reason } = body;

    if (!userId || !action)
      return NextResponse.json({ error: "userId and action are required" }, { status: 400 });

    // Resolve who is acting (cookie → body fallback)
    const admin = await resolveAdmin(bodyAdminId);
    if (!admin)
      return NextResponse.json({ error: "Unauthorized — must be ADMIN or SUPER_ADMIN" }, { status: 401 });

    // Prevent non-super-admins from acting on SUPER_ADMINs
    const target = await User.findById(userId).select("role email status verified").lean() as any;
    if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (target.role === "SUPER_ADMIN" && admin.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Cannot modify a Super Admin" }, { status: 403 });
    }

    const actionMap: Record<string, { update: any; logAction: string; notes: string }> = {
      suspend:      { update: { status: "SUSPENDED" }, logAction: "USER_SUSPENDED",    notes: reason || "Suspended by admin" },
      unsuspend:    { update: { status: "ACTIVE"    }, logAction: "USER_ACTIVATED",    notes: "Account reactivated by admin" },
      verify:       { update: { verified: true      }, logAction: "USER_VERIFIED",     notes: "Manually verified by admin" },
      unverify:     { update: { verified: false     }, logAction: "USER_UNVERIFIED",   notes: "Verification revoked by admin" },
      ban:          { update: { status: "BANNED"    }, logAction: "USER_BANNED",       notes: reason || "Banned by admin" },
      make_admin:   { update: { role: "ADMIN"       }, logAction: "USER_MADE_ADMIN",   notes: "Promoted to Admin by super admin" },
      remove_admin: { update: { role: "USER"        }, logAction: "USER_DEMOTED",      notes: "Admin role removed by super admin" },
    };

    // Role-change actions require SUPER_ADMIN
    if (["make_admin", "remove_admin"].includes(action) && admin.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Only Super Admins can change roles" }, { status: 403 });
    }

    const op = actionMap[action];
    if (!op) return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    const previousState = { status: target.status, role: target.role, verified: target.verified };
    await User.findByIdAndUpdate(userId, op.update);
    await AdminLog.create({
      adminId: admin._id,
      action: op.logAction,
      targetType: "User",
      targetId: userId,
      notes: op.notes,
      previousState,
    });

    return NextResponse.json({ success: true, action: op.logAction });
  } catch (err) {
    console.error("Users PATCH error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// ─── DELETE — permanently remove user + cascade ──────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const bodyAdminId = searchParams.get("adminId") || undefined;
    const reason = searchParams.get("reason") || "Deleted by super admin";

    if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });

    const admin = await resolveAdmin(bodyAdminId);
    if (!admin)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (admin.role !== "SUPER_ADMIN")
      return NextResponse.json({ error: "Only Super Admins can delete accounts" }, { status: 403 });

    const target = await User.findById(userId).select("name email role").lean() as any;
    if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (target.role === "SUPER_ADMIN")
      return NextResponse.json({ error: "Cannot delete a Super Admin account" }, { status: 403 });

    // Cascade: delete business profile
    await Business.deleteOne({ ownerId: userId });
    await User.findByIdAndDelete(userId);

    await AdminLog.create({
      adminId: admin._id,
      action: "USER_DELETED",
      targetType: "User",
      targetId: userId,
      notes: reason,
      previousState: { name: target.name, email: target.email, role: target.role },
    });

    return NextResponse.json({ success: true, message: `User ${target.email} deleted permanently` });
  } catch (err) {
    console.error("Users DELETE error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
