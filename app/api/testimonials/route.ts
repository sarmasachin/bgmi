import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { buildHomeRatingThankYouEmailHtml } from "@/src/lib/contactEmailTemplates";
import { checkRateLimit } from "@/src/server/rateLimit";
import { getRequestIp } from "@/src/server/requestIp";
import {
  createTestimonial,
  listApprovedTestimonials,
  type TestimonialGame,
} from "@/src/server/repositories/testimonialsRepository";
import { sendEmail } from "@/src/server/services/emailService";

const SUPPORT_EMAIL = "support@sensitivitysettings.com";

const postSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(200),
  rating: z.number().int().min(1).max(5),
  message: z.string().trim().min(2).max(300),
  game: z.enum(["bgmi", "pubg", "freefire", "freefire-max"]),
  phoneModel: z.string().trim().max(80).optional().nullable(),
  showName: z.boolean().default(true),
});

/** Public: approved testimonials only (max 20). */
export async function GET(request: NextRequest) {
  const ip = getRequestIp(request);
  const rl = checkRateLimit(`testimonials:get:${ip}`, 120, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const gameParam = request.nextUrl.searchParams.get("game");
  let game: TestimonialGame | undefined;
  if (
    gameParam === "bgmi" ||
    gameParam === "pubg" ||
    gameParam === "freefire" ||
    gameParam === "freefire-max"
  ) {
    game = gameParam;
  } else if (gameParam) {
    return NextResponse.json({ error: "Invalid game" }, { status: 400 });
  }

  const data = await listApprovedTestimonials({ game });
  return NextResponse.json({ data, maxApproved: 20 });
}

/** Public: submit testimonial (always starts as pending). */
export async function POST(request: NextRequest) {
  const ip = getRequestIp(request);
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

  const email = parsed.data.email.trim().toLowerCase();
  const created = await createTestimonial({
    name: parsed.data.name,
    email,
    rating: parsed.data.rating,
    message: parsed.data.message,
    game: parsed.data.game,
    phoneModel: parsed.data.phoneModel ?? null,
    showName: parsed.data.showName,
  });

  if (!created) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  // Background thank-you — never block the success response.
  void (async () => {
    try {
      const mail = buildHomeRatingThankYouEmailHtml({ email, value: parsed.data.rating });
      const result = await sendEmail(email, mail.subject, mail.html, {
        replyTo: SUPPORT_EMAIL,
      });
      if (!result.sent) {
        console.warn("[testimonials] thank-you email not sent:", result.reason);
      }
    } catch (err) {
      console.error("[testimonials] thank-you email failed:", err);
    }
  })();

  return NextResponse.json({
    ok: true,
    status: "pending",
    moderation: "queued",
    id: created.id,
  });
}
