import { NextResponse } from "next/server";
import { getVapidConfig } from "@/src/server/services/pushService";

/** Public VAPID key + safe diagnostics (no private key). */
export async function GET() {
  const vapid = getVapidConfig();
  if (!vapid.ok) {
    return NextResponse.json(
      { error: vapid.reason, configured: false },
      { status: 503 },
    );
  }
  return NextResponse.json({
    publicKey: vapid.publicKey,
    configured: true,
    pairValid: true,
    publicKeyPrefix: vapid.publicKey.slice(0, 20),
  });
}
