import { randomUUID } from "crypto";
import { z } from "zod";
import { mockStore } from "@/src/server/mockStore";
import { prisma, tryPrisma } from "@/src/server/dbSafe";

export type RatingSummary = { average: number | null; count: number };

/** Days after a home rating before the same email may submit site feedback. */
export const RATING_FEEDBACK_COOLDOWN_DAYS = 20;

const contextSchema = z
  .string()
  .trim()
  .min(1)
  .max(200)
  .refine((s) => !/[\r\n\0]/.test(s), "Invalid context");

function normalizeToolContext(raw: string | undefined) {
  const parsed = contextSchema.safeParse(raw?.replace(/^\/+/, "") ?? "");
  return parsed.success ? parsed.data : null;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function mockToolSummary(ctx: string): RatingSummary {
  const rows = mockStore.toolRatings.filter((r) => r.context === ctx);
  const count = rows.length;
  if (!count) return { average: null, count: 0 };
  const sum = rows.reduce((acc, r) => acc + r.value, 0);
  return { average: Number((sum / count).toFixed(2)), count };
}

async function readSummary(
  targetType: "home" | "news" | "tool",
  targetId: string | undefined,
): Promise<RatingSummary> {
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

/** Server-side rating summary. Tool ratings fall back to memory when DB is down. */
export async function getRatingSummary(
  targetType: "home" | "news" | "tool",
  targetId?: string,
): Promise<RatingSummary | null> {
  if (targetType === "news" && !targetId?.trim()) {
    return { average: null, count: 0 };
  }
  if (targetType === "tool" && !targetId?.trim()) {
    return { average: null, count: 0 };
  }

  const summary = await tryPrisma(() => readSummary(targetType, targetId));
  if (summary) {
    return {
      average: summary.average != null ? Number(summary.average.toFixed(2)) : null,
      count: summary.count,
    };
  }

  if (targetType === "tool") {
    const ctx = normalizeToolContext(targetId);
    if (!ctx) return { average: null, count: 0 };
    return mockToolSummary(ctx);
  }

  return null;
}

export async function persistRating(
  targetType: "home" | "news" | "tool",
  targetId: string | undefined,
  value: number,
  options?: { email?: string },
) {
  if (targetType === "home") {
    const email = options?.email ? normalizeEmail(options.email) : null;
    await prisma.homeRating.create({
      data: { value, ...(email ? { email } : {}) },
    });
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

/** Persist tool rating to memory when DB is unavailable (local/dev). */
export function persistToolRatingMock(targetId: string | undefined, value: number): RatingSummary | null {
  const ctx = normalizeToolContext(targetId);
  if (!ctx || value < 1 || value > 5) return null;
  mockStore.toolRatings.unshift({
    id: randomUUID(),
    context: ctx,
    value,
    createdAt: new Date().toISOString(),
  });
  return mockToolSummary(ctx);
}

/**
 * After a home rating, the same email may submit feedback only once the cooldown elapses.
 * Emails that never rated are always allowed.
 * DB unavailable → allow (do not block).
 */
export async function canEmailSubmitFeedback(email: string): Promise<boolean> {
  const normalized = normalizeEmail(email);
  if (!normalized) return true;

  const latest = await tryPrisma(() =>
    prisma.homeRating.findFirst({
      where: { email: normalized },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
  );

  if (latest === null) return true;
  if (!latest) return true;

  const unlockAt =
    latest.createdAt.getTime() + RATING_FEEDBACK_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
  return Date.now() >= unlockAt;
}

export function normalizeRatingToolContext(raw: string | undefined) {
  return normalizeToolContext(raw);
}
