import { z } from "zod";
import { prisma, tryPrisma } from "@/src/server/dbSafe";

export type RatingSummary = { average: number | null; count: number };

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

/** Server-side rating summary. Returns null when DB is unavailable in dev. */
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
  if (!summary) return null;

  return {
    average: summary.average != null ? Number(summary.average.toFixed(2)) : null,
    count: summary.count,
  };
}

export async function persistRating(
  targetType: "home" | "news" | "tool",
  targetId: string | undefined,
  value: number,
) {
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

export function normalizeRatingToolContext(raw: string | undefined) {
  return normalizeToolContext(raw);
}
