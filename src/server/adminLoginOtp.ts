import { createHash, randomBytes, randomInt } from "crypto";

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

type OtpRecord = {
  userId: string;
  email: string;
  otpHash: string;
  expiresAt: number;
  attempts: number;
  createdAt: number;
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
  });
  tokenByEmail.set(email, token);
  return {
    otpToken: token,
    expiresInSec: Math.floor(OTP_TTL_MS / 1000),
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
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a;max-width:520px;margin:0 auto;padding:24px;">
      <h2 style="margin:0 0 12px;font-size:20px;">Admin login OTP</h2>
      <p style="margin:0 0 16px;">Use this one-time code to finish signing in to Sensitivity Settings admin.</p>
      <p style="margin:0 0 8px;font-size:28px;letter-spacing:6px;font-weight:700;">${otp}</p>
      <p style="margin:16px 0 0;color:#475569;font-size:13px;">This code expires in 10 minutes. If you did not request it, ignore this email.</p>
    </div>
  `.trim();
}
