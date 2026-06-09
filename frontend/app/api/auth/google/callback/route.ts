import { NextResponse } from "next/server";
import { google } from "googleapis";
import dbConnect from "@/lib/db";
import User from "@/models/User";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const userId = url.searchParams.get("state");

    if (!code || !userId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      `${NEXT_PUBLIC_APP_URL}/api/auth/google/callback`
    );

    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      console.warn("No refresh token received. User might have previously authorized the app.");
    }

    oauth2Client.setCredentials(tokens);

    // Get user's email to store it
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const googleEmail = userInfo.data.email;

    await dbConnect();

    const updateData: any = { googleEmail };
    if (tokens.refresh_token) {
      updateData.googleRefreshToken = tokens.refresh_token;
    }

    await User.findByIdAndUpdate(userId, updateData);

    // Redirect to the meetings dashboard
    return NextResponse.redirect(`${NEXT_PUBLIC_APP_URL}/meetings`);

  } catch (error) {
    console.error("Google Auth Callback Error:", error);
    return NextResponse.json({ error: "Failed to authenticate with Google" }, { status: 500 });
  }
}
