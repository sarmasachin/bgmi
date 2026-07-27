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

/** Validate VAPID env before send — catches missing / truncated / mismatched-looking keys. */
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
  // Uncompressed P-256 public ≈ 87 chars; private ≈ 43 (url-safe base64).
  if (publicKey.length < 80) {
    return { ok: false, reason: "VAPID_PUBLIC_KEY looks truncated — regenerate both keys together" };
  }
  if (privateKey.length < 20) {
    return { ok: false, reason: "VAPID_PRIVATE_KEY looks truncated — quote it in .env and regenerate if needed" };
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
        "VAPID auth failed (403/401): public/private key pair mismatch, or keys changed after users subscribed",
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
