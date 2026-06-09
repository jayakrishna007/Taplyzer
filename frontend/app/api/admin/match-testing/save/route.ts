import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { FirestoreModel } from "@/lib/firestoreAdapter";

const MatchTest = new FirestoreModel("matchTests");

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { testUserId, results } = await req.json();

    if (!testUserId || !results || !Array.isArray(results)) {
      return NextResponse.json({ error: "testUserId and results[] are required" }, { status: 400 });
    }

    const totalEvaluated = results.length;
    const relevantCount = results.filter((r: any) => r.isRelevant === true).length;
    const matchQualityPercentage = totalEvaluated > 0 ? (relevantCount / totalEvaluated) * 100 : 0;

    // Count problem tags
    const tagCounts: Record<string, number> = {};
    for (const r of results) {
      if (r.problemTag) {
        tagCounts[r.problemTag] = (tagCounts[r.problemTag] || 0) + 1;
      }
    }

    const testRecord = await MatchTest.create({
      testUserId,
      results,
      timestamp: new Date(),
      metrics: {
        totalEvaluated,
        relevantCount,
        matchQualityPercentage: Math.round(matchQualityPercentage * 10) / 10,
        tagCounts,
      },
    });

    return NextResponse.json({ success: true, testRecord });
  } catch (err: any) {
    console.error("match-testing/save error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
