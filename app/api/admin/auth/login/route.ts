import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCredentials } from "@/src/server/authService";
import {
  clearAdminLoginFailures,
  formatLockMessage,
  getAdminLoginLockKey,
  getAdminLoginLockStatus,
  recordAdminLoginFailure,
} from "@/src/server/adminLoginLockout";
import {
  buildAdminOtpEmailHtml,
  createAdminLoginOtp,
  generateAdminOtpCode,
  maskEmail,
} from "@/src/server/adminLoginOtp";
import { sendEmail } from "@/src/server/services/emailService";
import { checkRateLimit } from "@/src/server/rateLimit";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  // Accept stored passwords of any length; enforce min length on create/reset only.
  password: z.string().min(1).max(200),
});

export async function POST(request: NextRequest) {
  const lockKey = getAdminLoginLockKey(request);
  const rl = checkRateLimit(`admin-login:${lockKey}`, 30, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many login attempts. Try again shortly." }, { status: 429 });
  }

  const lock = getAdminLoginLockStatus(lockKey);
  if (lock.locked) {
    return NextResponse.json(
      { error: formatLockMessage(lock.retryAfterSec), retryAfterSec: lock.retryAfterSec },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const user = await verifyAdminCredentials(parsed.data.email, parsed.data.password);
  if (!user || !("id" in user) || !user.id) {
    const afterFail = recordAdminLoginFailure(lockKey);
    if (afterFail.locked) {
      return NextResponse.json(
        {
          error: formatLockMessage(afterFail.retryAfterSec),
          retryAfterSec: afterFail.retryAfterSec,
        },
        { status: 429 },
      );
    }
    const left = 5 - afterFail.fails;
    return NextResponse.json(
      {
        error:
          left > 0
            ? `Invalid credentials. ${left} attempt${left === 1 ? "" : "s"} left before a 10-minute lock.`
            : "Invalid credentials",
      },
      { status: 401 },
    );
  }

  clearAdminLoginFailures(lockKey);

  const email = String(user.email).trim().toLowerCase();
  const otp = generateAdminOtpCode();
  let otpToken: string;
  let expiresInSec: number;
  let resendCooldownSec = 30;
  try {
    const created = createAdminLoginOtp({
      userId: String(user.id),
      email,
      otp,
    });
    otpToken = created.otpToken;
    expiresInSec = created.expiresInSec;
    resendCooldownSec = created.resendCooldownSec;
  } catch (err) {
    console.error("[admin-login] otp create failed:", err);
    return NextResponse.json(
      { error: "Login temporarily unavailable. Please try again later." },
      { status: 500 },
    );
  }

  try {
    const mail = await sendEmail(
      email,
      "Your admin login OTP — Sensitivity Settings",
      buildAdminOtpEmailHtml(otp),
    );
    if (!mail.sent) {
      if (process.env.NODE_ENV !== "production") {
        console.info(`[admin-login] SMTP not configured. DEV OTP for ${email}: ${otp}`);
      } else {
        console.error("[admin-login] OTP email not sent:", mail.reason);
        return NextResponse.json(
          { error: "Could not send OTP email. Check SMTP settings." },
          { status: 503 },
        );
      }
    }
  } catch (err) {
    console.error("[admin-login] OTP email failed:", err);
    if (process.env.NODE_ENV !== "production") {
      console.info(`[admin-login] DEV OTP for ${email}: ${otp}`);
    } else {
      return NextResponse.json(
        { error: "Could not send OTP email. Please try again later." },
        { status: 503 },
      );
    }
  }

  return NextResponse.json({
    ok: true,
    requiresOtp: true,
    otpToken,
    expiresInSec,
    resendCooldownSec,
    emailHint: maskEmail(email),
  });
}
