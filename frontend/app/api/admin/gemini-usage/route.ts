import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { FirestoreModel } from "@/lib/firestoreAdapter";

const GeminiLog = new FirestoreModel("geminiUsageLogs");

export const dynamic = "force-dynamic";

// Gemini pricing (per 1M tokens)
const PRICING = {
  "gemini-2.5-flash": { inputPer1M: 0.075, outputPer1M: 0.30 },
  "gemini-1.5-flash": { inputPer1M: 0.075, outputPer1M: 0.30 },
  "gemini-1.5-pro":   { inputPer1M: 1.25,  outputPer1M: 5.00 },
  "gemini-pro":       { inputPer1M: 0.50,  outputPer1M: 1.50 },
  "gemini-embedding-001": { inputPer1M: 0.025, outputPer1M: 0.00 },
};

function estimateCost(model: string, inputTokens: number, outputTokens: number): number {
  const price = PRICING[model as keyof typeof PRICING] || { inputPer1M: 0.0, outputPer1M: 0.0 };
  return (inputTokens / 1_000_000) * price.inputPer1M + (outputTokens / 1_000_000) * price.outputPer1M;
}

export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "30");
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const allLogs = await GeminiLog.find({ createdAt: { $gte: since } }).sort("-createdAt").limit(500).lean();

    // Aggregate totals
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let totalCalls = allLogs.length;
    let totalCostUSD = 0;

    const byFeature: Record<string, { calls: number; inputTokens: number; outputTokens: number; costUSD: number }> = {};
    const byModel: Record<string, { calls: number; inputTokens: number; outputTokens: number }> = {};
    const dailyMap: Record<string, { calls: number; tokens: number; costUSD: number }> = {};

    for (const log of allLogs as any[]) {
      const inp = log.inputTokens || 0;
      const out = log.outputTokens || 0;
      const cost = log.costUSD || estimateCost(log.model || "gemini-2.5-flash", inp, out);
      const feature = log.feature || "unknown";
      const model = log.model || "gemini-2.5-flash";
      const day = new Date(log.createdAt).toISOString().split("T")[0];

      totalInputTokens += inp;
      totalOutputTokens += out;
      totalCostUSD += cost;

      // By feature
      if (!byFeature[feature]) byFeature[feature] = { calls: 0, inputTokens: 0, outputTokens: 0, costUSD: 0 };
      byFeature[feature].calls++;
      byFeature[feature].inputTokens += inp;
      byFeature[feature].outputTokens += out;
      byFeature[feature].costUSD += cost;

      // By model
      if (!byModel[model]) byModel[model] = { calls: 0, inputTokens: 0, outputTokens: 0 };
      byModel[model].calls++;
      byModel[model].inputTokens += inp;
      byModel[model].outputTokens += out;

      // Daily
      if (!dailyMap[day]) dailyMap[day] = { calls: 0, tokens: 0, costUSD: 0 };
      dailyMap[day].calls++;
      dailyMap[day].tokens += inp + out;
      dailyMap[day].costUSD += cost;
    }

    // Today's stats
    const todayKey = new Date().toISOString().split("T")[0];
    const today = dailyMap[todayKey] || { calls: 0, tokens: 0, costUSD: 0 };

    // Recent logs (last 20)
    const recentLogs = (allLogs as any[]).slice(0, 20).map((l: any) => ({
      _id: l._id,
      feature: l.feature,
      model: l.model,
      inputTokens: l.inputTokens,
      outputTokens: l.outputTokens,
      costUSD: l.costUSD || estimateCost(l.model || "gemini-2.5-flash", l.inputTokens || 0, l.outputTokens || 0),
      createdAt: l.createdAt,
      userId: l.userId,
    }));

    // Sort daily by date
    const dailyBreakdown = Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({ date, ...data }));

    return NextResponse.json({
      summary: {
        totalCalls,
        totalInputTokens,
        totalOutputTokens,
        totalTokens: totalInputTokens + totalOutputTokens,
        totalCostUSD: Math.round(totalCostUSD * 10000) / 10000,
        periodDays: days,
      },
      today,
      byFeature,
      byModel,
      dailyBreakdown,
      recentLogs,
      // Free tier info
      freeTierInfo: {
        model: "gemini-2.5-flash",
        freeRequestsPerMinute: 10,
        freeRequestsPerDay: 1500,
        note: "Free tier limits are rate-based, not token-based. Upgrade to paid for higher throughput.",
        dashboardUrl: "https://aistudio.google.com/app/apikey",
      },
    });
  } catch (err: any) {
    console.error("Gemini usage error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
