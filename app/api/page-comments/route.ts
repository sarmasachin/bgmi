import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { FREE_FIRE_ADVANCE_SERVER_PATH } from "@/src/lib/ffAdvanceServerPage";
import { BGMI_LITE_APK_PAGE_KEY } from "@/src/lib/bgmiLiteBetaApkPage";
import { BGMI_LITE_REDEEM_PAGE_KEY } from "@/src/lib/bgmiLiteRedeemCodes";
import { BGMI_LITE_STYLISH_PAGE_KEY } from "@/src/lib/bgmiLiteStylishNamePage";
import { PUBG_MOBILE_LITE_APK_PAGE_KEY } from "@/src/lib/pubgMobileLiteApkPage";
import { PUBG_MOBILE_LITE_REDEEM_PAGE_KEY } from "@/src/lib/pubgMobileLiteRedeemCodes";
import { PUBG_MOBILE_LITE_NAME_PAGE_KEY } from "@/src/lib/pubgMobileLiteNamePage";
import { FREE_FIRE_REDEEM_PAGE_KEY } from "@/src/lib/freeFireRedeemCodes";
import { FREE_FIRE_MAX_REDEEM_PAGE_KEY } from "@/src/lib/freeFireMaxRedeemCodes";
import { FREE_FIRE_STYLISH_NAME_PAGE_KEY } from "@/src/lib/freeFireStylishNamePage";
import { FREE_FIRE_MAX_STYLISH_NAME_PAGE_KEY } from "@/src/lib/freeFireMaxStylishNamePage";
import { checkRateLimit } from "@/src/server/rateLimit";
import { getRequestIp } from "@/src/server/requestIp";
import {
  createPageComment,
  listApprovedPageComments,
} from "@/src/server/repositories/pageCommentsRepository";
import { trackEmailForCampaigns } from "@/src/server/repositories/emailSubscribersRepository";

/** Allowed public page comment keys (prevent open spam targets). */
const ALLOWED_PAGE_KEYS = new Set([
  FREE_FIRE_ADVANCE_SERVER_PATH.replace(/^\//, ""),
  "free-fire-advance-server",
  BGMI_LITE_APK_PAGE_KEY,
  BGMI_LITE_REDEEM_PAGE_KEY,
  BGMI_LITE_STYLISH_PAGE_KEY,
  PUBG_MOBILE_LITE_APK_PAGE_KEY,
  PUBG_MOBILE_LITE_REDEEM_PAGE_KEY,
  PUBG_MOBILE_LITE_NAME_PAGE_KEY,
  FREE_FIRE_REDEEM_PAGE_KEY,
  FREE_FIRE_MAX_REDEEM_PAGE_KEY,
  FREE_FIRE_STYLISH_NAME_PAGE_KEY,
  FREE_FIRE_MAX_STYLISH_NAME_PAGE_KEY,
]);

const postSchema = z.object({
  pageKey: z.string().trim().min(1).max(120),
  name: z.string().trim().min(1).max(80),
  email: z
    .union([z.string().trim().email().max(200), z.literal(""), z.undefined()])
    .optional()
    .transform((v) => (typeof v === "string" && v.trim() ? v.trim().toLowerCase() : undefined)),
  message: z.string().trim().min(2).max(1000),
});

/** Public: approved comments for a page. */
export async function GET(request: NextRequest) {
  const ip = getRequestIp(request);
  const rl = checkRateLimit(`page-comments:get:${ip}`, 120, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const pageKey = request.nextUrl.searchParams.get("pageKey")?.trim() ?? "";
  if (!pageKey || !ALLOWED_PAGE_KEYS.has(pageKey)) {
    return NextResponse.json({ error: "pageKey required" }, { status: 400 });
  }

  const data = await listApprovedPageComments(pageKey);
  return NextResponse.json({ data });
}

/** Public: submit page comment (pending until admin approval). */
export async function POST(request: NextRequest) {
  const ip = getRequestIp(request);
  const rl = checkRateLimit(`page-comments:post:${ip}`, 10, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (!ALLOWED_PAGE_KEYS.has(parsed.data.pageKey)) {
    return NextResponse.json({ error: "Unknown page" }, { status: 404 });
  }

  const created = await createPageComment({
    pageKey: parsed.data.pageKey,
    name: parsed.data.name,
    email: parsed.data.email ?? null,
    message: parsed.data.message,
  });

  if (!created) {
    return NextResponse.json({ error: "Could not save comment" }, { status: 503 });
  }

  if (parsed.data.email) {
    void trackEmailForCampaigns(parsed.data.email, "comment");
  }

  return NextResponse.json({
    ok: true,
    status: "pending",
    moderation: "queued",
    id: created.id,
  });
}
