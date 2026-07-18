import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/src/server/rateLimit";
import {
  createTestimonial,
  listApprovedTestimonials,
  type TestimonialGame,
} from "@/src/server/repositories/testimonialsRepository";

const postSchema = z.object({
  name: z.string().trim().min(1).max(80),
  rating: z.number().int().min(1).max(5),
  message: z.string().trim().min(2).max(300),
  game: z.enum(["bgmi", "pubg"]),
  phoneModel: z.string().trim().max(80).optional().nullable(),
  showName: z.boolean().default(true),
});

/** Public: approved testimonials only (max 20). */
export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  const rl = checkRateLimit(`testimonials:get:${ip}`, 120, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const gameParam = request.nextUrl.searchParams.get("game");
  let game: TestimonialGame | undefined;
  if (gameParam === "bgmi" || gameParam === "pubg") {
    game = gameParam;
  } else if (gameParam) {
    return NextResponse.json({ error: "Invalid game" }, { status: 400 });
  }

  const data = await listApprovedTestimonials({ game });
  return NextResponse.json({ data, maxApproved: 20 });
}

/** Public: submit testimonial (always starts as pending). */
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  const rl = checkRateLimit(`testimonials:post:${ip}`, 8, 60_000);
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
    return NextResponse.json({ error: "Invalid testimonial payload" }, { status: 400 });
  }

  const created = await createTestimonial({
    name: parsed.data.name,
    rating: parsed.data.rating,
    message: parsed.data.message,
    game: parsed.data.game,
    phoneModel: parsed.data.phoneModel ?? null,
    showName: parsed.data.showName,
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
