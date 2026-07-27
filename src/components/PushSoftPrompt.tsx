"use client";

import { useEffect, useRef, useState } from "react";
import { isPushSupported, subscribeWebPush } from "@/src/lib/webPushClient";
import styles from "./PushSoftPrompt.module.css";

const STORAGE_DISMISS = "ss_push_soft_dismissed_session_v1";
const SHOW_AFTER_MS = 5_000;
const SHOW_AFTER_SCROLL_RATIO = 0.1;

/** Not Now: hide only for this browser session. Closing the tab/site → show again next visit. */
function wasDismissedThisSession() {
  try {
    return sessionStorage.getItem(STORAGE_DISMISS) === "1";
  } catch {
    return false;
  }
}

function markDismissedThisSession() {
  try {
    sessionStorage.setItem(STORAGE_DISMISS, "1");
  } catch {
    /* ignore */
  }
}

/**
 * Top soft prompt (not a blocking modal).
 * Never auto-opens the browser permission dialog — only after Enable.
 * Shows after 5s or ~10% scroll. "Not now" lasts for this session only.
 */
export function PushSoftPrompt() {
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const shownRef = useRef(false);
  const busyRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.pathname.startsWith("/admin")) return;
    if (!isPushSupported()) return;
    if (Notification.permission === "granted" || Notification.permission === "denied") return;
    if (wasDismissedThisSession()) return;

    const reveal = () => {
      if (shownRef.current) return;
      shownRef.current = true;
      setVisible(true);
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };

    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      if (window.scrollY / max >= SHOW_AFTER_SCROLL_RATIO) reveal();
    };

    const timer = window.setTimeout(reveal, SHOW_AFTER_MS);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  function dismiss() {
    markDismissedThisSession();
    setVisible(false);
    setStatus("");
  }

  async function onEnable() {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setStatus("Waiting for your choice…");
    const result = await subscribeWebPush();
    busyRef.current = false;
    setBusy(false);
    if (result.ok) {
      setStatus("Thanks — alerts enabled.");
      markDismissedThisSession();
      window.setTimeout(() => setVisible(false), 1600);
      return;
    }
    setStatus(result.message);
    if (Notification.permission === "denied") {
      markDismissedThisSession();
    }
  }

  if (!visible) return null;

  return (
    <div className={styles.root} role="region" aria-label="Notification preference">
      <div className={styles.banner}>
        <div className={styles.copy}>
          <p className={styles.title}>Get Update Alerts for Premium Sensi Setting</p>
          <p className={styles.text}>
            Get Update News, One Tap Headshot Update, Premium Free Fire &amp; FF Max
            Sensitivity Settings
          </p>
          {status ? (
            <p className={styles.status} aria-live="polite">
              {status}
            </p>
          ) : null}
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.primary} disabled={busy} onClick={() => void onEnable()}>
            {busy ? "Enabling…" : "Enable"}
          </button>
          <button type="button" className={styles.secondary} disabled={busy} onClick={dismiss}>
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
