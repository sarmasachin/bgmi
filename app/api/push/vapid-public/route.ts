import { NextResponse } from "next/server";

/** Public VAPID key only — safe for browser push subscribe. */
export async function GET() {
  const publicKey = process.env.VAPID_PUBLIC_KEY?.trim() || "";
  if (!publicKey) {
    return NextResponse.json({ error: "Push notifications are not configured." }, { status: 503 });
  }
  return NextResponse.json({ publicKey });
}
