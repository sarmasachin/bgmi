import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/src/server/rateLimit";
import {
  getRatingSummary,
  normalizeRatingToolContext,
  persistRating,
} from "@/src/server/repositories/ratingSummaryRepository";
import { tryPrisma } from "@/src/server/dbSafe";
import { z } from "zod";

const postSchema = z.object({
  targetType: z.enum(["home", "news", "tool"]),
  targetId: z.string().optional(),
  value: z.number().int().min(1).max(5),
});

/** Public read: average + count for a rating target */
export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
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
  const ip = request.headers.get("x-forwarded-for") ?? "local";
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

  if (targetType === "news") {
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
  } else {
    targetId = undefined;
  }

  const ok = await tryPrisma(() => persistRating(targetType, targetId, value));

  if (ok === null) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }
    return NextResponse.json({ ok: true, saved: false, average: null, count: 0 });
  }

  if (!ok) {
    return NextResponse.json({ error: "Could not save rating" }, { status: 404 });
  }

  const after = await getRatingSummary(targetType, targetId);
  return NextResponse.json({
    ok: true,
    saved: true,
    average: after?.average ?? null,
    count: after?.count ?? 0,
  });
}
