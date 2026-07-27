import webpush from "web-push";

export type PushPayload = {
  endpoint: string;
  p256dh: string;
  auth: string;
  title: string;
  body: string;
};

export async function sendPush(payload: PushPayload): Promise<{
  sent: boolean;
  reason?: string;
  statusCode?: number;
}> {
  const publicKey = process.env.VAPID_PUBLIC_KEY?.trim();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();
  const subject = process.env.VAPID_SUBJECT?.trim() || "mailto:admin@example.com";

  if (!publicKey || !privateKey) {
    return { sent: false, reason: "VAPID keys missing" };
  }

  try {
    webpush.setVapidDetails(subject, publicKey, privateKey);
    await webpush.sendNotification(
      {
        endpoint: payload.endpoint,
        keys: {
          p256dh: payload.p256dh,
          auth: payload.auth,
        },
      },
      JSON.stringify({ title: payload.title, body: payload.body }),
    );
    return { sent: true };
  } catch (error) {
    const statusCode =
      error && typeof error === "object" && "statusCode" in error
        ? Number((error as { statusCode?: number }).statusCode)
        : undefined;
    const reason =
      error instanceof Error ? error.message : "Push delivery failed";
    return { sent: false, reason, statusCode };
  }
}
