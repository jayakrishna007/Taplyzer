import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Business from "@/models/Business";
import User from "@/models/User";
import AdminLog from "@/models/AdminLog";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_taplyzer_jwt_key_2026";

// ─── AUTH HELPER — cookie-first, body adminId fallback ───────────────────────
async function resolveAdmin(
  bodyAdminId?: string
): Promise<{ _id: string; role: string } | null> {
  await dbConnect();

  // 1. Try JWT cookie
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
    // Cookie failed — fall through
  }

  // 2. Fallback: explicit adminId from request body/params
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

// ─── GET — list businesses with verification filter + stats ────────────────
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "15");
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";

    // Build query — show ALL businesses by default, filter by tier when specified
    const query: any = {};
    if (status) {
      query["trust.verificationStatus"] = status;
    }
    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: "i" } },
        { brandName: { $regex: search, $options: "i" } },
        { industry: { $regex: search, $options: "i" } },
        { ownerName: { $regex: search, $options: "i" } },
      ];
    }

    const [businesses, total] = await Promise.all([
      Business.find(query)
        .populate("ownerId", "name email status role")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Business.countDocuments(query),
    ]);

    const [notVerified, basicVerified, businessVerified, trustedPartner, unset] =
      await Promise.all([
        Business.countDocuments({ "trust.verificationStatus": "Not Verified" }),
        Business.countDocuments({ "trust.verificationStatus": "Basic Verified" }),
        Business.countDocuments({ "trust.verificationStatus": "Business Verified" }),
        Business.countDocuments({ "trust.verificationStatus": "Trusted Partner" }),
        Business.countDocuments({
          $or: [
            { "trust.verificationStatus": { $exists: false } },
            { trust: { $exists: false } },
          ],
        }),
      ]);

    const totalBusinesses = await Business.countDocuments();

    return NextResponse.json({
      businesses,
      total,
      pages: Math.ceil(total / limit),
      stats: {
        notVerified,
        basicVerified,
        businessVerified,
        trustedPartner,
        unset,
        total: totalBusinesses,
      },
    });
  } catch (err) {
    console.error("Verification GET error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// ─── PATCH — set verification level OR suspend/reinstate a business ──────────
export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { businessId, action, verificationStatus, adminNotes, reason, adminId: bodyAdminId } = body;

    if (!businessId)
      return NextResponse.json({ error: "businessId is required" }, { status: 400 });

    const admin = await resolveAdmin(bodyAdminId);
    if (!admin)
      return NextResponse.json({ error: "Unauthorized — must be ADMIN or SUPER_ADMIN" }, { status: 401 });

    const biz = await Business.findById(businessId)
      .select("ownerId trust companyName status")
      .lean() as any;
    if (!biz) return NextResponse.json({ error: "Business not found" }, { status: 404 });

    let update: any = {};
    let logAction = "";
    let notes = "";

    if (action === "set_verification") {
      const validStatuses = [
        "Not Verified",
        "Basic Verified",
        "Business Verified",
        "Trusted Partner",
      ];
      if (!validStatuses.includes(verificationStatus)) {
        return NextResponse.json({ error: "Invalid verification status" }, { status: 400 });
      }
      update = {
        "trust.verificationStatus": verificationStatus,
        ...(adminNotes ? { adminNotes } : {}),
      };
      logAction = `BUSINESS_VERIFICATION_SET_${verificationStatus.toUpperCase().replace(/ /g, "_")}`;
      notes = adminNotes || `Verification set to ${verificationStatus}`;

      // Sync user.verified flag — Business Verified & Trusted Partner = verified user
      if (biz.ownerId) {
        const shouldBeVerified =
          verificationStatus === "Business Verified" ||
          verificationStatus === "Trusted Partner";
        await User.findByIdAndUpdate(biz.ownerId, { verified: shouldBeVerified });
      }
    } else if (action === "suspend_business") {
      update = { status: "SUSPENDED" };
      logAction = "BUSINESS_SUSPENDED";
      notes = reason || "Business suspended by admin";
    } else if (action === "reinstate_business") {
      update = { status: "APPROVED" };
      logAction = "BUSINESS_REINSTATED";
      notes = reason || "Business reinstated by admin";
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use: set_verification | suspend_business | reinstate_business" },
        { status: 400 }
      );
    }

    await Business.findByIdAndUpdate(businessId, update);
    await AdminLog.create({
      adminId: admin._id,
      action: logAction,
      targetType: "Business",
      targetId: businessId,
      notes,
    });

    return NextResponse.json({ success: true, action: logAction });
  } catch (err) {
    console.error("Verification PATCH error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// ─── DELETE — permanently remove a business profile ─────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get("businessId");
    const bodyAdminId = searchParams.get("adminId") || undefined;
    const reason = searchParams.get("reason") || "Deleted by super admin";

    if (!businessId)
      return NextResponse.json({ error: "businessId is required" }, { status: 400 });

    const admin = await resolveAdmin(bodyAdminId);
    if (!admin)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (admin.role !== "SUPER_ADMIN")
      return NextResponse.json(
        { error: "Only Super Admins can delete business profiles" },
        { status: 403 }
      );

    const biz = await Business.findById(businessId)
      .select("ownerId companyName brandName")
      .lean() as any;
    if (!biz) return NextResponse.json({ error: "Business not found" }, { status: 404 });

    // Revoke verified flag on the owner
    if (biz.ownerId) {
      await User.findByIdAndUpdate(biz.ownerId, { verified: false });
    }

    await Business.findByIdAndDelete(businessId);

    await AdminLog.create({
      adminId: admin._id,
      action: "BUSINESS_DELETED",
      targetType: "Business",
      targetId: businessId,
      notes: reason,
      previousState: {
        companyName: biz.companyName,
        brandName: biz.brandName,
        ownerId: biz.ownerId,
      },
    });

    return NextResponse.json({ success: true, message: "Business profile deleted permanently" });
  } catch (err) {
    console.error("Verification DELETE error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
