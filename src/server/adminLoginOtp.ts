import { createHash, randomBytes, randomInt } from "crypto";

const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 30 * 1000;
const MAX_ATTEMPTS = 5;

type OtpRecord = {
  userId: string;
  email: string;
  otpHash: string;
  expiresAt: number;
  attempts: number;
  createdAt: number;
  lastSentAt: number;
};

const pendingByToken = new Map<string, OtpRecord>();
const tokenByEmail = new Map<string, string>();

function getOtpPepper(): string {
  const secret = process.env.SESSION_SECRET?.trim();
  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be set (min 32 chars) in production");
  }
  return "dev-only-session-secret-change-me!!";
}

function hashOtp(otp: string, token: string) {
  return createHash("sha256")
    .update(`${otp}:${token}:${getOtpPepper()}`)
    .digest("hex");
}

function purgeExpired() {
  const now = Date.now();
  for (const [token, record] of pendingByToken) {
    if (record.expiresAt <= now) {
      pendingByToken.delete(token);
      if (tokenByEmail.get(record.email) === token) {
        tokenByEmail.delete(record.email);
      }
    }
  }
}

function cooldownLeftSec(record: OtpRecord) {
  const leftMs = record.lastSentAt + RESEND_COOLDOWN_MS - Date.now();
  return Math.max(0, Math.ceil(leftMs / 1000));
}

export function generateAdminOtpCode() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function createAdminLoginOtp(input: { userId: string; email: string; otp: string }) {
  purgeExpired();
  const email = input.email.trim().toLowerCase();
  const previousToken = tokenByEmail.get(email);
  if (previousToken) {
    pendingByToken.delete(previousToken);
  }

  const token = randomBytes(24).toString("hex");
  const now = Date.now();
  pendingByToken.set(token, {
    userId: input.userId,
    email,
    otpHash: hashOtp(input.otp, token),
    expiresAt: now + OTP_TTL_MS,
    attempts: 0,
    createdAt: now,
    lastSentAt: now,
  });
  tokenByEmail.set(email, token);
  return {
    otpToken: token,
    expiresInSec: Math.floor(OTP_TTL_MS / 1000),
    resendCooldownSec: Math.floor(RESEND_COOLDOWN_MS / 1000),
  };
}

export function resendAdminLoginOtp(input: { otpToken: string; otp: string }):
  | { ok: true; otpToken: string; email: string; expiresInSec: number; resendCooldownSec: number }
  | { ok: false; error: string; status: 400 | 410 | 429; retryAfterSec?: number } {
  purgeExpired();
  const token = input.otpToken.trim();
  if (!token) {
    return { ok: false, error: "OTP session expired. Please login again.", status: 410 };
  }

  const record = pendingByToken.get(token);
  if (!record) {
    return { ok: false, error: "OTP expired or invalid. Please login again.", status: 410 };
  }
  if (record.expiresAt <= Date.now()) {
    pendingByToken.delete(token);
    if (tokenByEmail.get(record.email) === token) tokenByEmail.delete(record.email);
    return { ok: false, error: "OTP expired. Please login again.", status: 410 };
  }

  const waitSec = cooldownLeftSec(record);
  if (waitSec > 0) {
    return {
      ok: false,
      error: `Wait ${waitSec}s before resending OTP.`,
      status: 429,
      retryAfterSec: waitSec,
    };
  }

  const now = Date.now();
  record.otpHash = hashOtp(input.otp, token);
  record.lastSentAt = now;
  record.expiresAt = now + OTP_TTL_MS;
  record.attempts = 0;

  return {
    ok: true,
    otpToken: token,
    email: record.email,
    expiresInSec: Math.floor(OTP_TTL_MS / 1000),
    resendCooldownSec: Math.floor(RESEND_COOLDOWN_MS / 1000),
  };
}

export function consumeAdminLoginOtp(input: {
  otpToken: string;
  otp: string;
}):
  | { ok: true; userId: string; email: string }
  | { ok: false; error: string; status: 400 | 401 | 410 | 429 } {
  purgeExpired();
  const token = input.otpToken.trim();
  const otp = input.otp.trim();
  if (!token || !/^\d{6}$/.test(otp)) {
    return { ok: false, error: "Enter the 6-digit OTP.", status: 400 };
  }

  const record = pendingByToken.get(token);
  if (!record) {
    return { ok: false, error: "OTP expired or invalid. Please login again.", status: 410 };
  }
  if (record.expiresAt <= Date.now()) {
    pendingByToken.delete(token);
    if (tokenByEmail.get(record.email) === token) tokenByEmail.delete(record.email);
    return { ok: false, error: "OTP expired. Please login again.", status: 410 };
  }
  if (record.attempts >= MAX_ATTEMPTS) {
    pendingByToken.delete(token);
    if (tokenByEmail.get(record.email) === token) tokenByEmail.delete(record.email);
    return { ok: false, error: "Too many wrong OTP attempts. Please login again.", status: 429 };
  }

  record.attempts += 1;
  const expected = record.otpHash;
  const actual = hashOtp(otp, token);
  if (expected !== actual) {
    const left = MAX_ATTEMPTS - record.attempts;
    return {
      ok: false,
      error:
        left > 0
          ? `Invalid OTP. ${left} attempt${left === 1 ? "" : "s"} left.`
          : "Too many wrong OTP attempts. Please login again.",
      status: left > 0 ? 401 : 429,
    };
  }

  pendingByToken.delete(token);
  if (tokenByEmail.get(record.email) === token) tokenByEmail.delete(record.email);
  return { ok: true, userId: record.userId, email: record.email };
}

export function maskEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  const [local, domain] = normalized.split("@");
  if (!local || !domain) return normalized;
  if (local.length <= 2) return `${local[0] ?? "*"}***@${domain}`;
  return `${local.slice(0, 2)}***@${domain}`;
}

export function buildAdminOtpEmailHtml(otp: string) {
  const safeOtp = otp.replace(/[^\d]/g, "").slice(0, 6);
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>Admin login OTP</title>
</head>
<body style="margin:0;padding:0;background:#e8edf3;font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#e8edf3;padding:32px 14px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:580px;border-radius:18px;overflow:hidden;border:1px solid #d5dee8;background:#ffffff;">
          <!-- Full-bleed dark brand bar -->
          <tr>
            <td style="background:#0b1220;padding:0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding:26px 32px 22px;">
                    <p style="margin:0;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#5eead4;font-weight:700;">
                      Sensitivity Settings
                    </p>
                    <p style="margin:10px 0 0;font-size:26px;line-height:1.25;color:#f8fafc;font-weight:800;">
                      Verify your login
                    </p>
                    <p style="margin:8px 0 0;font-size:14px;line-height:1.5;color:#94a3b8;">
                      Admin access · one-time code
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="height:3px;background:#2dd4bf;font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Clean white body -->
          <tr>
            <td style="padding:34px 32px 12px;background:#ffffff;">
              <p style="margin:0;font-size:15px;line-height:1.65;color:#475569;">
                Enter this code on the admin login screen to finish signing in.
              </p>
            </td>
          </tr>

          <!-- OTP pill / code chip -->
          <tr>
            <td align="center" style="padding:22px 32px 10px;background:#ffffff;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto;">
                <tr>
                  <td align="center" style="background:#0b1220;border-radius:999px;padding:16px 34px;">
                    <span style="display:inline-block;font-family:Consolas,'Courier New',monospace;font-size:30px;line-height:1;letter-spacing:0.34em;font-weight:800;color:#f8fafc;padding-left:0.34em;">
                      ${safeOtp}
                    </span>
                  </td>
                </tr>
              </table>
              <p style="margin:14px 0 0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#94a3b8;font-weight:700;">
                OTP code
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:18px 32px 28px;background:#ffffff;">
              <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#64748b;">
                This code expires in <strong style="color:#0f172a;">10 minutes</strong>. Don’t share it with anyone.
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;">
                <tr>
                  <td style="padding:14px 16px;font-size:13px;line-height:1.55;color:#64748b;">
                    Didn’t request this? You can ignore this email — your account remains secure.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:16px 32px 22px;background:#f8fafc;border-top:1px solid #eef2f7;text-align:center;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:#94a3b8;">
                © ${year} Sensitivity Settings · sensitivitysettings.com
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}


