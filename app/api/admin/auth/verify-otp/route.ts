import { NextRequest, NextResponse } from "next/server";
import { consumeAdminLoginOtp } from "@/src/server/adminLoginOtp";
import {
  ADMIN_SESSION_COOKIE,
  adminSessionCookieOptions,
  createAdminSessionToken,
} from "@/src/server/adminSession";
import { checkRateLimit } from "@/src/server/rateLimit";
import { getAdminLoginLockKey } from "@/src/server/adminLoginLockout";
import { z } from "zod";

const schema = z.object({
  otpToken: z.string().min(16).max(128),
  otp: z.string().regex(/^\d{6}$/),
});

export async function POST(request: NextRequest) {
  const lockKey = getAdminLoginLockKey(request);
  const rl = checkRateLimit(`admin-otp-verify:${lockKey}`, 40, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many OTP attempts. Try again shortly." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter the 6-digit OTP." }, { status: 400 });
  }

  const result = consumeAdminLoginOtp(parsed.data);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  try {
    const token = await createAdminSessionToken({
      userId: result.userId,
      email: result.email,
    });
    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_SESSION_COOKIE, token, adminSessionCookieOptions());
    return response;
  } catch (err) {
    console.error("[admin-verify-otp] session create failed:", err);
    return NextResponse.json(
      { error: "Login temporarily unavailable. Please try again later." },
      { status: 500 },
    );
  }
}
