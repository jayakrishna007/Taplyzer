import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";

// We store test results in a "matchTests" Firestore collection
const MatchTest = new (require("@/lib/firestoreAdapter").FirestoreModel)("matchTests");

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();

    const history = await MatchTest.find({}).sort("-timestamp").limit(20).lean();

    // Populate testUserId with user name
    const enriched = await Promise.all(
      history.map(async (test: any) => {
        const user = await User.findById(test.testUserId).lean();
        return { ...test, testUserId: user || { name: "Unknown" } };
      })
    );

    return NextResponse.json({ history: enriched });
  } catch (err: any) {
    console.error("match-testing/history error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
