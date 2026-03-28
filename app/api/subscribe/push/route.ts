import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  endpoint: z.string().url(),
  p256dh: z.string().min(1),
  auth: z.string().min(1),
  tags: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  return NextResponse.json({ ok: true, subscribed: true });
}
