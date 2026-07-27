import { createECDH } from "crypto";
import webpush from "web-push";

export type PushPayload = {
  endpoint: string;
  p256dh: string;
  auth: string;
  title: string;
  body: string;
};

export type SendPushResult = {
  sent: boolean;
  reason?: string;
  statusCode?: number;
};

type VapidConfig =
  | { ok: true; publicKey: string; privateKey: string; subject: string }
  | { ok: false; reason: string };

function stripWrappingQuotes(value: string) {
  const v = value.trim();
  if (
    (v.startsWith('"') && v.endsWith('"') && v.length >= 2) ||
    (v.startsWith("'") && v.endsWith("'") && v.length >= 2)
  ) {
    return v.slice(1, -1).trim();
  }
  return v;
}

function b64UrlToBuffer(value: string) {
  const pad = value + "=".repeat((4 - (value.length % 4)) % 4);
  return Buffer.from(pad.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

/** True only if private key derives to the given public key (P-256). */
export function vapidKeysMatch(publicKey: string, privateKey: string) {
  try {
    const priv = b64UrlToBuffer(privateKey);
    const pub = b64UrlToBuffer(publicKey);
    if (priv.length !== 32 || pub.length !== 65 || pub[0] !== 0x04) return false;
    const ecdh = createECDH("prime256v1");
    ecdh.setPrivateKey(priv);
    const derived = ecdh.getPublicKey(null, "uncompressed");
    return Buffer.compare(derived, pub) === 0;
  } catch {
    return false;
  }
}

/** Validate VAPID env before send — catches missing / truncated / mismatched pair. */
export function getVapidConfig(): VapidConfig {
  const publicKey = stripWrappingQuotes(process.env.VAPID_PUBLIC_KEY || "");
  const privateKey = stripWrappingQuotes(process.env.VAPID_PRIVATE_KEY || "");
  const subjectRaw = stripWrappingQuotes(
    process.env.VAPID_SUBJECT || "mailto:support@sensitivitysettings.com",
  );
  const subject =
    subjectRaw.startsWith("mailto:") || subjectRaw.startsWith("https://")
      ? subjectRaw
      : `mailto:${subjectRaw}`;

  if (!publicKey && !privateKey) {
    return { ok: false, reason: "VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY missing on server" };
  }
  if (!publicKey) return { ok: false, reason: "VAPID_PUBLIC_KEY missing on server" };
  if (!privateKey) return { ok: false, reason: "VAPID_PRIVATE_KEY missing on server" };
  if (publicKey.length < 80) {
    return { ok: false, reason: "VAPID_PUBLIC_KEY looks truncated — regenerate both keys together" };
  }
  if (privateKey.length < 20) {
    return { ok: false, reason: "VAPID_PRIVATE_KEY looks truncated — quote it in .env and regenerate if needed" };
  }
  if (!vapidKeysMatch(publicKey, privateKey)) {
    return {
      ok: false,
      reason:
        "VAPID public/private keys do not match in server env (.env vs .env.production mismatch). Put the SAME generate pair in both files and pm2 delete + start.",
    };
  }
  return { ok: true, publicKey, privateKey, subject };
}

function pushErrorDetail(error: unknown): { reason: string; statusCode?: number } {
  const statusCode =
    error && typeof error === "object" && "statusCode" in error
      ? Number((error as { statusCode?: number }).statusCode)
      : undefined;
  const body =
    error && typeof error === "object" && "body" in error
      ? String((error as { body?: unknown }).body ?? "").trim()
      : "";
  const message = error instanceof Error ? error.message : "Push delivery failed";

  if (statusCode === 401 || statusCode === 403) {
    return {
      statusCode,
      reason:
        "VAPID auth failed (403/401): browser subscribed with a different public key — delete PushSubscription, hard refresh, Enable again",
    };
  }
  if (statusCode === 404 || statusCode === 410) {
    return { statusCode, reason: "Subscription expired (404/410)" };
  }
  if (statusCode === 413) {
    return { statusCode, reason: "Payload too large for push service" };
  }
  if (statusCode === 429) {
    return { statusCode, reason: "Push service rate limited (429)" };
  }
  if (body) {
    return { statusCode, reason: `${message}${statusCode ? ` [${statusCode}]` : ""}: ${body.slice(0, 180)}` };
  }
  return { statusCode, reason: statusCode ? `${message} [${statusCode}]` : message };
}

export async function sendPush(payload: PushPayload): Promise<SendPushResult> {
  const vapid = getVapidConfig();
  if (!vapid.ok) {
    return { sent: false, reason: vapid.reason };
  }

  try {
    webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);
    await webpush.sendNotification(
      {
        endpoint: payload.endpoint,
        keys: {
          p256dh: payload.p256dh,
          auth: payload.auth,
        },
      },
      JSON.stringify({ title: payload.title, body: payload.body }),
      { TTL: 60 * 60 * 12, urgency: "normal" },
    );
    return { sent: true };
  } catch (error) {
    const detail = pushErrorDetail(error);
    console.error("[push] sendPush failed:", detail.statusCode, detail.reason);
    return { sent: false, reason: detail.reason, statusCode: detail.statusCode };
  }
}
