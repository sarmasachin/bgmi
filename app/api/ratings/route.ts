import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/src/server/rateLimit";
import { prisma, tryPrisma } from "@/src/server/dbSafe";
import { z } from "zod";

const contextSchema = z
  .string()
  .trim()
  .min(1)
  .max(200)
  .refine((s) => !/[\r\n\0]/.test(s), "Invalid context");

const postSchema = z.object({
  targetType: z.enum(["home", "news", "tool"]),
  targetId: z.string().optional(),
  value: z.number().int().min(1).max(5),
});

function normalizeToolContext(raw: string | undefined) {
  const parsed = contextSchema.safeParse(raw?.replace(/^\/+/, "") ?? "");
  return parsed.success ? parsed.data : null;
}

type Summary = { average: number | null; count: number };

async function readSummary(targetType: "home" | "news" | "tool", targetId: string | undefined): Promise<Summary> {
  if (targetType === "home") {
    const agg = await prisma.homeRating.aggregate({
      _avg: { value: true },
      _count: { value: true },
    });
    const count = agg._count.value ?? 0;
    const avg = count > 0 ? Number(agg._avg.value ?? 0) : null;
    return { average: avg, count };
  }
  if (targetType === "news") {
    if (!targetId?.trim()) return { average: null, count: 0 };
    const news = await prisma.newsPost.findFirst({
      where: { id: targetId.trim(), status: "published" },
      select: { id: true },
    });
    if (!news) return { average: null, count: 0 };
    const agg = await prisma.newsRating.aggregate({
      where: { newsId: targetId.trim() },
      _avg: { value: true },
      _count: { value: true },
    });
    const count = agg._count.value ?? 0;
    const avg = count > 0 ? Number(agg._avg.value ?? 0) : null;
    return { average: avg, count };
  }
  const ctx = normalizeToolContext(targetId);
  if (!ctx) return { average: null, count: 0 };
  const agg = await prisma.toolRating.aggregate({
    where: { context: ctx },
    _avg: { value: true },
    _count: { value: true },
  });
  const count = agg._count.value ?? 0;
  const avg = count > 0 ? Number(agg._avg.value ?? 0) : null;
  return { average: avg, count };
}

async function persistRating(targetType: "home" | "news" | "tool", targetId: string | undefined, value: number) {
  if (targetType === "home") {
    await prisma.homeRating.create({ data: { value } });
    return true;
  }
  if (targetType === "news") {
    if (!targetId?.trim()) return false;
    const id = targetId.trim();
    const news = await prisma.newsPost.findFirst({
      where: { id, status: "published" },
      select: { id: true },
    });
    if (!news) return false;
    await prisma.newsRating.create({ data: { newsId: id, value } });
    return true;
  }
  const ctx = normalizeToolContext(targetId);
  if (!ctx) return false;
  await prisma.toolRating.create({ data: { context: ctx, value } });
  return true;
}

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

  const summary = await tryPrisma(() => readSummary(targetType, targetId));
  if (summary === null) {
    if (process.env.NODE_ENV !== "production" && !process.env.DATABASE_URL) {
      return NextResponse.json({ average: null, count: 0 });
    }
    return NextResponse.json({ error: "Summary unavailable" }, { status: 503 });
  }

  return NextResponse.json({
    average: summary.average != null ? Number(summary.average.toFixed(2)) : null,
    count: summary.count,
  });
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
    const ctx = normalizeToolContext(targetId);
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

  const after = await tryPrisma(() => readSummary(targetType, targetId));
  return NextResponse.json({
    ok: true,
    saved: true,
    average: after?.average != null ? Number(after.average.toFixed(2)) : null,
    count: after?.count ?? 0,
  });
}
