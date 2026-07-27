import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/src/server/rateLimit";
import { getRequestIp } from "@/src/server/requestIp";
import {
  getRatingSummary,
  normalizeRatingToolContext,
  persistRating,
  persistToolRatingMock,
} from "@/src/server/repositories/ratingSummaryRepository";
import { tryPrisma } from "@/src/server/dbSafe";
import { sendEmail } from "@/src/server/services/emailService";
import { trackEmailForCampaigns } from "@/src/server/repositories/emailSubscribersRepository";
import { buildHomeRatingThankYouEmailHtml } from "@/src/lib/contactEmailTemplates";
import { FREE_FIRE_ADVANCE_SERVER_PAGE_KEY } from "@/src/lib/ffAdvanceServerPage";
import { z } from "zod";

const SUPPORT_EMAIL = "support@sensitivitysettings.com";

/** Advance Server page only: one rating per browser cookie + IP (best-effort). */
const FF_AS_RATED_COOKIE = "ff_as_rated";
const FF_AS_RATED_MAX_AGE = 60 * 60 * 24 * 365;
const advanceServerRatedIps = new Set<string>();

function isAdvanceServerTool(targetType: string, targetId: string | undefined) {
  return targetType === "tool" && targetId === FREE_FIRE_ADVANCE_SERVER_PAGE_KEY;
}

function alreadyRatedAdvanceServer(request: NextRequest, ip: string) {
  if (request.cookies.get(FF_AS_RATED_COOKIE)?.value === "1") return true;
  return advanceServerRatedIps.has(ip);
}

function attachAdvanceServerRatedCookie(res: NextResponse, ip: string) {
  advanceServerRatedIps.add(ip);
  res.cookies.set(FF_AS_RATED_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: FF_AS_RATED_MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}

const postSchema = z.object({
  targetType: z.enum(["home", "news", "tool"]),
  targetId: z.string().optional(),
  value: z.number().int().min(1).max(5),
  email: z.string().trim().email().max(200).optional(),
});

/** Public read: average + count for a rating target */
export async function GET(request: NextRequest) {
  const ip = getRequestIp(request);
  const rl = checkRateLimit(`ratings:get:${ip}`, 120, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const { searchParams } = request.nextUrl;
  const targetType = searchParams.get("targetType");
  const targetId = searchParams.get("targetId") ?? undefined;

  if (targetType !== "home" && targetType !== "news" && targetType !== "tool") {
    return NextResponse.json({ error: "Invalid targetType" }, { status: 400 });
  }
  if (targetType === "news" && !targetId?.trim()) {
    return NextResponse.json({ error: "targetId required for news" }, { status: 400 });
  }
  if (targetType === "tool" && !targetId?.trim()) {
    return NextResponse.json({ error: "targetId required for tool" }, { status: 400 });
  }

  const summary = await getRatingSummary(targetType, targetId);
  if (summary === null) {
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json({ average: null, count: 0 });
    }
    return NextResponse.json({ error: "Summary unavailable" }, { status: 503 });
  }

  return NextResponse.json(summary);
}

export async function POST(request: NextRequest) {
  const ip = getRequestIp(request);
  const rl = checkRateLimit(`ratings:post:${ip}`, 30, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid rating payload" }, { status: 400 });
  }

  const { targetType, value } = parsed.data;
  let { targetId } = parsed.data;
  const email = parsed.data.email?.trim().toLowerCase();

  if (targetType === "home") {
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    targetId = undefined;
  } else if (targetType === "news") {
    if (!targetId?.trim()) {
      return NextResponse.json({ error: "targetId required for news" }, { status: 400 });
    }
    targetId = targetId.trim();
  } else if (targetType === "tool") {
    const ctx = normalizeRatingToolContext(targetId);
    if (!ctx) {
      return NextResponse.json({ error: "Invalid tool context" }, { status: 400 });
    }
    targetId = ctx;
  }

  if (isAdvanceServerTool(targetType, targetId) && alreadyRatedAdvanceServer(request, ip)) {
    return NextResponse.json({ error: "You have already rated this page." }, { status: 409 });
  }

  const ok = await tryPrisma(() =>
    persistRating(targetType, targetId, value, targetType === "home" ? { email } : undefined),
  );

  if (ok === null) {
    // DB down: keep tool ratings working via memory (Advance Server page, etc.).
    if (targetType === "tool") {
      const mock = persistToolRatingMock(targetId, value);
      if (mock) {
        const res = NextResponse.json({
          ok: true,
          saved: true,
          average: mock.average,
          count: mock.count,
        });
        if (isAdvanceServerTool(targetType, targetId)) {
          return attachAdvanceServerRatedCookie(res, ip);
        }
        return res;
      }
    }
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }
    return NextResponse.json({ ok: true, saved: false, average: null, count: 0 });
  }

  if (!ok) {
    return NextResponse.json({ error: "Could not save rating" }, { status: 404 });
  }

  // Background: thank-you mail only (no feedback invite). Never block the success response.
  if (targetType === "home" && email) {
    void trackEmailForCampaigns(email, "rating");
    void (async () => {
      try {
        const mail = buildHomeRatingThankYouEmailHtml({ email, value });
        const result = await sendEmail(email, mail.subject, mail.html, {
          replyTo: SUPPORT_EMAIL,
        });
        if (!result.sent) {
          console.warn("[ratings] thank-you email not sent:", result.reason);
        }
      } catch (err) {
        console.error("[ratings] thank-you email failed:", err);
      }
    })();
  }

  const after = await getRatingSummary(targetType, targetId);
  const res = NextResponse.json({
    ok: true,
    saved: true,
    average: after?.average ?? null,
    count: after?.count ?? 0,
  });
  if (isAdvanceServerTool(targetType, targetId)) {
    return attachAdvanceServerRatedCookie(res, ip);
  }
  return res;
}
