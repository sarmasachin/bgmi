"use client";

import { useEffect, useRef, useState } from "react";
import { isPushSupported, subscribeWebPush } from "@/src/lib/webPushClient";
import styles from "./PushSoftPrompt.module.css";

const STORAGE_DISMISS = "ss_push_soft_dismissed_v1";
const SHOW_AFTER_MS = 5_000;
const SHOW_AFTER_SCROLL_RATIO = 0.1;

/** Enable / Not now: hide permanently in this browser (localStorage). */
function wasDismissed() {
  try {
    return localStorage.getItem(STORAGE_DISMISS) === "1";
  } catch {
    return false;
  }
}

function markDismissed() {
  try {
    localStorage.setItem(STORAGE_DISMISS, "1");
  } catch {
    /* ignore */
  }
}

/**
 * Top soft prompt (not a blocking modal).
 * Never auto-opens the browser permission dialog — only after Enable.
 * Shows after 5s or ~10% scroll. Enable or Not now → hide immediately, no status message.
 */
export function PushSoftPrompt() {
  const [visible, setVisible] = useState(false);
  const shownRef = useRef(false);
  const busyRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.pathname.startsWith("/admin")) return;
    if (!isPushSupported()) return;
    if (Notification.permission === "granted" || Notification.permission === "denied") return;
    if (wasDismissed()) return;

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
    markDismissed();
    setVisible(false);
  }

  async function onEnable() {
    if (busyRef.current) return;
    busyRef.current = true;
    markDismissed();
    setVisible(false);
    await subscribeWebPush();
    busyRef.current = false;
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
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.primary} onClick={() => void onEnable()}>
            Enable
          </button>
          <button type="button" className={styles.secondary} onClick={dismiss}>
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
