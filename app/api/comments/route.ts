import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/src/server/rateLimit";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  message: z.string().min(2),
  newsId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  const rl = checkRateLimit(`comments:${ip}`, 10, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    status: "pending",
    moderation: "queued",
  });
}
