import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/src/server/rateLimit";
import { getNewsById } from "@/src/server/repositories/newsRepository";
import {
  createComment,
  listApprovedCommentsByNewsId,
} from "@/src/server/repositories/commentsRepository";

const postSchema = z.object({
  name: z.string().trim().min(1).max(80),
  message: z.string().trim().min(2).max(1000),
  newsId: z.string().trim().min(1).max(64),
});

/** Public: approved comments for a news article. */
export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  const rl = checkRateLimit(`comments:get:${ip}`, 120, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const newsId = request.nextUrl.searchParams.get("newsId")?.trim() ?? "";
  if (!newsId) {
    return NextResponse.json({ error: "newsId required" }, { status: 400 });
  }

  const data = await listApprovedCommentsByNewsId(newsId);
  return NextResponse.json({ data });
}

/** Public: submit comment (always starts as pending). */
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  const rl = checkRateLimit(`comments:post:${ip}`, 10, 60_000);
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

  const news = await getNewsById(parsed.data.newsId);
  if (!news || news.status !== "published") {
    return NextResponse.json({ error: "News article not found" }, { status: 404 });
  }

  const created = await createComment({
    newsId: parsed.data.newsId,
    name: parsed.data.name,
    message: parsed.data.message,
  });

  if (!created) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  return NextResponse.json({
    ok: true,
    status: "pending",
    moderation: "queued",
    id: created.id,
  });
}
