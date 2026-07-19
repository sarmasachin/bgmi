import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requestResetToken } from "@/src/server/authService";

const schema = z.object({ email: z.string().email() });

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  const result = await requestResetToken(parsed.data.email);
  const payload: { ok: true; sent: boolean; token?: string } = {
    ok: true,
    sent: result.sent,
  };
  // Never expose reset tokens outside local development.
  if (process.env.NODE_ENV !== "production" && result.token) {
    payload.token = result.token;
  }
  return NextResponse.json(payload);
}
