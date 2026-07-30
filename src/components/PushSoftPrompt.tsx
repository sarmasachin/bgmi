"use client";

import { useEffect, useRef, useState } from "react";
import { isPushSupported, subscribeWebPush } from "@/src/lib/webPushClient";
import styles from "./PushSoftPrompt.module.css";

const STORAGE_DISMISS = "ss_push_soft_dismissed_v2";
const SHOW_AFTER_MS = 5_000;
const SHOW_AFTER_SCROLL_RATIO = 0.1;

/** Not now / successful Enable: hide permanently in this browser. */
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

function clearDismissed() {
  try {
    localStorage.removeItem(STORAGE_DISMISS);
  } catch {
    /* ignore */
  }
}

/**
 * Top soft prompt (not a blocking modal).
 * Never auto-opens the browser permission dialog — only after Enable.
 * If permission already granted (e.g. after DB wipe), silently re-sync subscription to server.
 */
export function PushSoftPrompt() {
  const [visible, setVisible] = useState(false);
  const shownRef = useRef(false);
  const busyRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.pathname.startsWith("/admin")) return;
    if (!isPushSupported()) return;

    // Already allowed in browser but row may be missing on server (DB wipe / failed save).
    if (Notification.permission === "granted") {
      const sync = () => {
        void (async () => {
          const result = await subscribeWebPush({ syncOnly: true });
          if (result.ok) {
            markDismissed();
          } else {
            console.error("[push] Sync failed:", result.message);
          }
        })();
      };
      // Defer off the first interaction window (helps INP); same sync logic.
      // Use typeof (not `in`) so TS does not narrow `window` to `never` in else.
      if (typeof window.requestIdleCallback === "function") {
        window.requestIdleCallback(sync, { timeout: 4000 });
      } else {
        window.setTimeout(sync, 2000);
      }
      return;
    }

    if (Notification.permission === "denied") return;
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
    setVisible(false);
    const result = await subscribeWebPush();
    busyRef.current = false;
    if (result.ok) {
      markDismissed();
      return;
    }
    // Failed save → allow banner again next visit / refresh
    clearDismissed();
    console.error("[push] Enable failed:", result.message);
  }

  if (!visible) return null;

  return (
    <div className={styles.root} role="region" aria-label="Notification preference">
      <div className={styles.banner}>
        <div className={styles.copy}>
          <p className={styles.title}>Get Update Alerts for Pro Sensi Setting</p>
          <p className={styles.text}>
            Get Update News, Calculator Update, Pro Free Fire &amp; FF Max Sensitivity Settings
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
