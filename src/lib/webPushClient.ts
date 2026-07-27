/** Client-only web push helpers (browser). */

export function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}

export function detectPushTags(): string[] {
  const tags = ["all"];
  const ua = navigator.userAgent.toLowerCase();
  const mobile = /android|iphone|ipad|ipod|mobile/i.test(ua);
  tags.push(mobile ? "mobile" : "pc");
  if (/android/i.test(ua)) tags.push("android");
  if (/iphone|ipad|ipod/i.test(ua)) tags.push("ios");
  return tags;
}

export function isPushSupported() {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export type SubscribePushResult =
  | { ok: true }
  | { ok: false; message: string };

/**
 * Soft-prompt flow only: call AFTER the user clicks Enable.
 * Never call on page load (Google quieter-messaging / UX guidelines).
 */
export async function subscribeWebPush(): Promise<SubscribePushResult> {
  if (!isPushSupported()) {
    return { ok: false, message: "Push is not supported in this browser." };
  }

  try {
    const vapidRes = await fetch("/api/push/vapid-public", { cache: "no-store" });
    const vapidJson = (await vapidRes.json().catch(() => ({}))) as {
      publicKey?: string;
      error?: string;
    };
    if (!vapidRes.ok || !vapidJson.publicKey) {
      return {
        ok: false,
        message: vapidJson.error || "Push is not configured on the server.",
      };
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return {
        ok: false,
        message: "Notification permission denied. You can allow it later in browser settings.",
      };
    }

    const reg =
      (await navigator.serviceWorker.getRegistration("/")) ||
      (await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      }));
    await navigator.serviceWorker.ready;

    let subscription = await reg.pushManager.getSubscription();
    const existingJson = subscription?.toJSON();
    if (subscription && (!existingJson?.keys?.p256dh || !existingJson?.keys?.auth)) {
      await subscription.unsubscribe();
      subscription = null;
    }
    if (!subscription) {
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidJson.publicKey),
      });
    }

    const json = subscription.toJSON();
    if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
      return { ok: false, message: "Browser did not return push keys. Try another browser." };
    }

    const res = await fetch("/api/subscribe/push", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: json.endpoint,
        p256dh: json.keys.p256dh,
        auth: json.keys.auth,
        tags: detectPushTags(),
      }),
    });
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      return {
        ok: false,
        message:
          err.error ||
          (res.status === 503
            ? "Server database unavailable. Subscription not saved."
            : "Could not save push subscription."),
      };
    }
    return { ok: true };
  } catch (error) {
    const detail = error instanceof Error ? error.message : "";
    return {
      ok: false,
      message:
        detail.includes("push service error") || detail.includes("Registration failed")
          ? "Push subscribe failed. Check site is HTTPS and VAPID keys are valid."
          : "Could not enable notifications. Try again.",
    };
  }
}
