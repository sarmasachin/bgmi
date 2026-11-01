import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/src/server/rateLimit";
import { getRequestIp } from "@/src/server/requestIp";
import {
  getApkDownloadCount,
  incrementApkDownloadCount,
  isAllowedApkDownloadPageKey,
} from "@/src/server/repositories/apkDownloadCountRepository";

const bodySchema = z.object({
  pageKey: z.string().trim().min(1).max(80),
});

/** Public read: current download click count for an allowed APK page. */
export async function GET(request: NextRequest) {
  const ip = getRequestIp(request);
  const rl = checkRateLimit(`apk-dl:get:${ip}`, 120, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const pageKey = request.nextUrl.searchParams.get("pageKey")?.trim() ?? "";
  if (!isAllowedApkDownloadPageKey(pageKey)) {
    return NextResponse.json({ error: "Invalid pageKey" }, { status: 400 });
  }
  const count = await getApkDownloadCount(pageKey);
  return NextResponse.json({ pageKey, count });
}

/** Public write: count one APK download-button click. */
export async function POST(request: NextRequest) {
  const ip = getRequestIp(request);
  const rl = checkRateLimit(`apk-dl:post:${ip}`, 30, 10 * 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  if (!isAllowedApkDownloadPageKey(parsed.data.pageKey)) {
    return NextResponse.json({ error: "Invalid pageKey" }, { status: 400 });
  }

  try {
    const count = await incrementApkDownloadCount(parsed.data.pageKey);
    return NextResponse.json({ ok: true, pageKey: parsed.data.pageKey, count });
  } catch {
    return NextResponse.json({ error: "Could not update count" }, { status: 500 });
  }
}
