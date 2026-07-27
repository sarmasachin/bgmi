"use client";

import { FormEvent, useEffect, useState } from "react";
import styles from "./NotifyOptIn.module.css";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}

function detectTags(): string[] {
  const tags = ["all"];
  const ua = navigator.userAgent.toLowerCase();
  const mobile = /android|iphone|ipad|ipod|mobile/i.test(ua);
  tags.push(mobile ? "mobile" : "pc");
  if (/android/i.test(ua)) tags.push("android");
  if (/iphone|ipad|ipod/i.test(ua)) tags.push("ios");
  return tags;
}

/** Site opt-in for browser push + email campaigns. */
export function NotifyOptIn() {
  const [pushMsg, setPushMsg] = useState("");
  const [emailMsg, setEmailMsg] = useState("");
  const [email, setEmail] = useState("");
  const [busyPush, setBusyPush] = useState(false);
  const [busyEmail, setBusyEmail] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(
      typeof window !== "undefined" &&
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window,
    );
  }, []);

  async function enablePush() {
    if (!supported) {
      setPushMsg("Push is not supported in this browser.");
      return;
    }
    setBusyPush(true);
    setPushMsg("");
    try {
      const vapidRes = await fetch("/api/push/vapid-public");
      const vapidJson = (await vapidRes.json().catch(() => ({}))) as {
        publicKey?: string;
        error?: string;
      };
      if (!vapidRes.ok || !vapidJson.publicKey) {
        setPushMsg(vapidJson.error || "Push is not configured on the server.");
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setPushMsg("Notification permission denied.");
        return;
      }

      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const existing = await reg.pushManager.getSubscription();
      const subscription =
        existing ||
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidJson.publicKey),
        }));

      const json = subscription.toJSON();
      const res = await fetch("/api/subscribe/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: json.endpoint,
          p256dh: json.keys?.p256dh,
          auth: json.keys?.auth,
          tags: detectTags(),
        }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        setPushMsg(err.error || "Could not save push subscription.");
        return;
      }
      setPushMsg("Browser notifications enabled.");
    } catch {
      setPushMsg("Could not enable notifications. Try again.");
    } finally {
      setBusyPush(false);
    }
  }

  async function subscribeEmail(event: FormEvent) {
    event.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      setEmailMsg("Enter a valid email.");
      return;
    }
    setBusyEmail(true);
    setEmailMsg("");
    try {
      const res = await fetch("/api/subscribe/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, tags: detectTags() }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setEmailMsg(json.error || "Could not subscribe.");
        return;
      }
      setEmailMsg("Email subscribed for campaigns.");
      setEmail("");
    } catch {
      setEmailMsg("Network error. Please retry.");
    } finally {
      setBusyEmail(false);
    }
  }

  return (
    <aside className={styles.wrap} aria-label="Notification preferences">
      <p className={styles.title}>Get updates</p>
      <p className={styles.copy}>Enable browser alerts or email for site campaigns.</p>
      <div className={styles.actions}>
        <button type="button" className={styles.btn} onClick={() => void enablePush()} disabled={busyPush}>
          {busyPush ? "Enabling…" : "Enable browser notifications"}
        </button>
        {pushMsg ? <p className={styles.msg}>{pushMsg}</p> : null}
        <form className={styles.email} onSubmit={(e) => void subscribeEmail(e)}>
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label="Email for campaigns"
          />
          <button type="submit" disabled={busyEmail}>
            {busyEmail ? "Saving…" : "Subscribe email"}
          </button>
        </form>
        {emailMsg ? <p className={styles.msg}>{emailMsg}</p> : null}
      </div>
    </aside>
  );
}
