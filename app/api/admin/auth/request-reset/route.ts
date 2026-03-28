import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requestResetToken } from "@/src/server/authService";

const schema = z.object({ email: z.string().email() });

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  const result = await requestResetToken(parsed.data.email);
  return NextResponse.json({
    ok: true,
    sent: result.sent,
    // For development visibility; remove in production response.
    token: result.token,
  });
}
