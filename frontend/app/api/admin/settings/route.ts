import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { FirestoreModel } from "@/lib/firestoreAdapter";

const Settings = new FirestoreModel("platformSettings");

export const dynamic = "force-dynamic";

// Default settings fallback
const DEFAULTS = {
  matchMinScore: 40,
  cacheHours: 12,
  maintenanceMode: false,
  registrationsEnabled: true,
  autoApproveVerification: false,
  supportEmail: "support@taplyzer.com",
  platformName: "Taplyzer",
  maxMatchesPerUser: 20,
  meetingDurationMinutes: 40,
};

export async function GET() {
  try {
    await dbConnect();
    const existing = await Settings.findOne({ docType: "main" });
    const settings = existing ? { ...DEFAULTS, ...existing } : DEFAULTS;
    // Remove Firestore internal fields
    delete settings._id;
    delete settings.id;
    delete settings.docType;
    delete settings.createdAt;
    delete settings.updatedAt;
    return NextResponse.json({ settings });
  } catch (err: any) {
    console.error("Settings GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();
    const updates = await req.json();

    // Remove non-settings fields from payload
    const { adminId, ...settingsData } = updates;

    // Validate types for known numeric/bool fields
    if (settingsData.matchMinScore !== undefined) {
      settingsData.matchMinScore = Math.min(100, Math.max(0, Number(settingsData.matchMinScore)));
    }
    if (settingsData.cacheHours !== undefined) {
      settingsData.cacheHours = Math.min(168, Math.max(1, Number(settingsData.cacheHours)));
    }
    if (settingsData.maxMatchesPerUser !== undefined) {
      settingsData.maxMatchesPerUser = Math.min(100, Math.max(5, Number(settingsData.maxMatchesPerUser)));
    }

    const existing = await Settings.findOne({ docType: "main" });

    if (existing) {
      await Settings.findByIdAndUpdate(existing._id, { ...settingsData, docType: "main" });
    } else {
      await Settings.create({ ...DEFAULTS, ...settingsData, docType: "main" });
    }

    const updated = await Settings.findOne({ docType: "main" });
    const result = { ...DEFAULTS, ...updated };
    delete result._id;
    delete result.id;
    delete result.docType;
    delete result.createdAt;
    delete result.updatedAt;

    return NextResponse.json({ msg: "Settings saved", settings: result });
  } catch (err: any) {
    console.error("Settings PATCH error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
