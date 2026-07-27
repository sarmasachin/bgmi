"use client";

import { FormEvent, useState } from "react";
import { detectPushTags } from "@/src/lib/webPushClient";
import styles from "./NotifyOptIn.module.css";

/** Footer email opt-in only (browser push uses the top soft-prompt banner). */
export function NotifyOptIn() {
  const [emailMsg, setEmailMsg] = useState("");
  const [email, setEmail] = useState("");
  const [busyEmail, setBusyEmail] = useState(false);

  async function subscribeEmail(event: FormEvent) {
    event.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      setEmailMsg("Enter a valid email.");
      return;
    }
    setBusyEmail(true);
    setEmailMsg("Saving…");
    try {
      const res = await fetch("/api/subscribe/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmed,
          tags: ["email-subscribe", ...detectPushTags()],
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setEmailMsg(
          json.error ||
            (res.status === 503
              ? "Server database unavailable. Email not saved."
              : "Could not subscribe."),
        );
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
    <aside className={styles.wrap} aria-label="Email updates">
      <form className={styles.email} onSubmit={(e) => void subscribeEmail(e)}>
        <input
          type="email"
          name="campaign-email"
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
      {emailMsg ? (
        <p className={styles.msg} aria-live="polite">
          {emailMsg}
        </p>
      ) : null}
    </aside>
  );
}
