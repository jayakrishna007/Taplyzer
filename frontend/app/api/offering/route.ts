import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dbConnect from "@/lib/db";
import Offering from "@/models/Offering";
import { logGeminiUsage } from "@/lib/geminiLogger";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function generateEmbedding(text: string, userId?: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
  const result = await model.embedContent(text);

  // Log Gemini usage
  const estimatedTokens = Math.ceil(text.length / 4);
  await logGeminiUsage({
    userId,
    feature: "embedding_offering",
    model: "gemini-embedding-001",
    inputTokens: estimatedTokens,
    outputTokens: 0,
  });

  return result.embedding.values;
}



export async function POST(req: Request) {
  try {
    await dbConnect();
    const { userId, text } = await req.json();

    if (!userId || !text) {
      return NextResponse.json({ msg: "userId and text are required" }, { status: 400 });
    }

    const embedding = await generateEmbedding(text, userId);

    await Offering.findOneAndUpdate(
      { userId },
      { text, embedding },
      { upsert: true, new: true }
    );

    return NextResponse.json({ msg: "Offering saved successfully" });
  } catch (err: any) {
    return NextResponse.json({ msg: "Server Error", error: err.message }, { status: 500 });
  }
}
