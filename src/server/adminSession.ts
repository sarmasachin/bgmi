/** Signed admin session tokens (Edge + Node safe via Web Crypto). */

export const ADMIN_SESSION_COOKIE = "bgmi_admin_session";

/** 7 days */
export const ADMIN_SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7;

export type AdminSessionPayload = {
  sub: string;
  email: string;
  iat: number;
  exp: number;
};

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET?.trim();
  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be set (min 32 chars) in production");
  }
  return "dev-only-session-secret-change-me!!";
}

function bytesToBase64Url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (let i = 0; i < arr.length; i++) binary += String.fromCharCode(arr[i]!);
  const b64 = btoa(binary);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (padded.length % 4)) % 4;
  const b64 = padded + "=".repeat(padLen);
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

function utf8ToBytes(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    utf8ToBytes(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function signPayload(body: string): Promise<string> {
  const key = await importHmacKey(getSessionSecret());
  const sig = await crypto.subtle.sign("HMAC", key, utf8ToBytes(body));
  return bytesToBase64Url(sig);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i)! ^ b.charCodeAt(i)!;
  return diff === 0;
}

export async function createAdminSessionToken(input: {
  userId: string;
  email: string;
}): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: AdminSessionPayload = {
    sub: input.userId,
    email: input.email.trim().toLowerCase(),
    iat: now,
    exp: now + ADMIN_SESSION_MAX_AGE_SEC,
  };
  const body = bytesToBase64Url(utf8ToBytes(JSON.stringify(payload)));
  const sig = await signPayload(body);
  return `${body}.${sig}`;
}

export async function verifyAdminSessionToken(
  token: string | undefined | null,
): Promise<AdminSessionPayload | null> {
  if (!token || typeof token !== "string") return null;
  // Reject legacy forgeable cookie value
  if (token === "active") return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  if (!body || !sig) return null;

  let expected: string;
  try {
    expected = await signPayload(body);
  } catch {
    return null;
  }
  if (!timingSafeEqual(sig, expected)) return null;

  try {
    const json = new TextDecoder().decode(base64UrlToBytes(body));
    const payload = JSON.parse(json) as AdminSessionPayload;
    if (
      typeof payload.sub !== "string" ||
      !payload.sub ||
      typeof payload.email !== "string" ||
      typeof payload.exp !== "number" ||
      typeof payload.iat !== "number"
    ) {
      return null;
    }
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) return null;
    return payload;
  } catch {
    return null;
  }
}

export function adminSessionCookieOptions(maxAge = ADMIN_SESSION_MAX_AGE_SEC) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}
