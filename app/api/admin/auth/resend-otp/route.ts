import { NextRequest, NextResponse } from "next/server";
import {
  buildAdminOtpEmailHtml,
  generateAdminOtpCode,
  maskEmail,
  resendAdminLoginOtp,
} from "@/src/server/adminLoginOtp";
import { sendEmail } from "@/src/server/services/emailService";
import { checkRateLimit } from "@/src/server/rateLimit";
import { getAdminLoginLockKey } from "@/src/server/adminLoginLockout";
import { z } from "zod";

const schema = z.object({
  otpToken: z.string().min(16).max(128),
});

export async function POST(request: NextRequest) {
  const lockKey = getAdminLoginLockKey(request);
  const rl = checkRateLimit(`admin-otp-resend:${lockKey}`, 20, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many resend attempts. Try again shortly." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "OTP session expired. Please login again." }, { status: 410 });
  }

  const otp = generateAdminOtpCode();
  const result = resendAdminLoginOtp({ otpToken: parsed.data.otpToken, otp });
  if (!result.ok) {
    return NextResponse.json(
      {
        error: result.error,
        ...(result.retryAfterSec ? { retryAfterSec: result.retryAfterSec } : {}),
      },
      { status: result.status },
    );
  }

  try {
    const mail = await sendEmail(
      result.email,
      "Your admin login OTP — Sensitivity Settings",
      buildAdminOtpEmailHtml(otp),
    );
    if (!mail.sent) {
      if (process.env.NODE_ENV !== "production") {
        console.info(`[admin-resend-otp] SMTP not configured. DEV OTP for ${result.email}: ${otp}`);
      } else {
        console.error("[admin-resend-otp] OTP email not sent:", mail.reason);
        return NextResponse.json(
          { error: "Could not send OTP email. Check SMTP settings." },
          { status: 503 },
        );
      }
    }
  } catch (err) {
    console.error("[admin-resend-otp] OTP email failed:", err);
    if (process.env.NODE_ENV !== "production") {
      console.info(`[admin-resend-otp] DEV OTP for ${result.email}: ${otp}`);
    } else {
      return NextResponse.json(
        { error: "Could not send OTP email. Please try again later." },
        { status: 503 },
      );
    }
  }

  return NextResponse.json({
    ok: true,
    otpToken: result.otpToken,
    expiresInSec: result.expiresInSec,
    resendCooldownSec: result.resendCooldownSec,
    emailHint: maskEmail(result.email),
  });
}
