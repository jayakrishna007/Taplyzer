import dbConnect from "@/lib/db";
import { FirestoreModel } from "@/lib/firestoreAdapter";

const GeminiLog = new FirestoreModel("geminiUsageLogs");

export async function logGeminiUsage(params: {
  userId?: string;
  feature: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
}) {
  try {
    await dbConnect();
    
    const pricing = {
      "gemini-2.5-flash": { inputPer1M: 0.075, outputPer1M: 0.30 },
      "gemini-1.5-flash": { inputPer1M: 0.075, outputPer1M: 0.30 },
      "gemini-1.5-pro":   { inputPer1M: 1.25,  outputPer1M: 5.00 },
      "gemini-pro":       { inputPer1M: 0.50,  outputPer1M: 1.50 },
      "gemini-embedding-001": { inputPer1M: 0.0, outputPer1M: 0.0 },
    };

    const modelName = params.model;
    const price = pricing[modelName as keyof typeof pricing] || pricing["gemini-2.5-flash"];
    const costUSD = (params.inputTokens / 1_000_000) * price.inputPer1M + (params.outputTokens / 1_000_000) * price.outputPer1M;

    await GeminiLog.create({
      userId: params.userId || "system",
      feature: params.feature,
      model: params.model,
      inputTokens: params.inputTokens,
      outputTokens: params.outputTokens,
      costUSD: Math.round(costUSD * 1000000) / 1000000,
    });
  } catch (err) {
    console.error("Failed to log Gemini usage:", err);
  }
}
