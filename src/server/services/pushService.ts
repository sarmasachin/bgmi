import webpush from "web-push";

export type PushPayload = {
  endpoint: string;
  p256dh: string;
  auth: string;
  title: string;
  body: string;
};

export async function sendPush(payload: PushPayload) {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:admin@example.com";

  if (!publicKey || !privateKey) {
    return { sent: false, reason: "VAPID keys missing" };
  }

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
}
