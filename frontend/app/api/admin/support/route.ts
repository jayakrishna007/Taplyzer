import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Ticket from "@/models/Ticket";
import AdminLog from "@/models/AdminLog";

export const dynamic = "force-dynamic";

const priorityMap: Record<string, string> = {
  Abuse: "High", Payments: "High", Verification: "Medium",
  "Meeting Issues": "Medium", Bug: "Medium", Other: "Low",
};

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "15");
    const status = searchParams.get("status") || "";
    const category = searchParams.get("category") || "";

    const query: any = {};
    if (status) query.status = status;
    if (category) query.category = category;

    const [tickets, total] = await Promise.all([
      Ticket.find(query)
        .sort("-createdAt")
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Ticket.countDocuments(query),
    ]);

    const [open, inProgress, resolved, closed] = await Promise.all([
      Ticket.countDocuments({ status: "Open" }),
      Ticket.countDocuments({ status: "In Progress" }),
      Ticket.countDocuments({ status: "Resolved" }),
      Ticket.countDocuments({ status: "Closed" }),
    ]);

    return NextResponse.json({
      tickets, total, pages: Math.ceil(total / limit),
      stats: { open, inProgress, resolved, closed, total: open + inProgress + resolved + closed },
    });
  } catch (err) {
    console.error("Support GET error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const ticket = await Ticket.create({
      ...body,
      priority: priorityMap[body.category] || "Medium",
    });
    return NextResponse.json(ticket, { status: 201 });
  } catch (err) {
    console.error("Support POST error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();
    const { ticketId, status, adminNotes, adminId } = await req.json();

    const update: any = { status };
    if (adminNotes !== undefined) update.adminNotes = adminNotes;
    if (status === "Resolved" || status === "Closed") update.resolvedAt = new Date();

    await Ticket.findByIdAndUpdate(ticketId, update);

    if (adminId) {
      await AdminLog.create({
        adminId, action: "TICKET_UPDATED", targetType: "Ticket", targetId: ticketId,
        notes: `Status → ${status}${adminNotes ? ` | Note: ${adminNotes}` : ""}`,
      });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Support PATCH error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
