import { NextResponse } from "next/server";
import { google } from "googleapis";
import jwt from "jsonwebtoken";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_taplyzer_jwt_key_2026";

export async function GET(req: Request) {
  try {
    // 1. Get the user ID from the auth cookie to pass in 'state'
    const cookieHeader = req.headers.get("cookie");
    if (!cookieHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tokenMatch = cookieHeader.match(/taplyzer_auth_token=([^;]+)/);
    if (!tokenMatch) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = tokenMatch[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = decoded.userId;

    // 2. Configure OAuth2 Client
    const oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      `${NEXT_PUBLIC_APP_URL}/api/auth/google/callback`
    );

    // 3. Generate Auth URL
    const scopes = [
      "https://www.googleapis.com/auth/calendar.events",
      "https://www.googleapis.com/auth/userinfo.email"
    ];

    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      prompt: "consent", // Forces Google to provide a refresh token every time
      state: userId // Pass userId so we know who authorized upon callback
    });

    return NextResponse.redirect(url);

  } catch (error) {
    console.error("Google Auth Error:", error);
    return NextResponse.json({ error: "Failed to initialize Google Auth" }, { status: 500 });
  }
}
