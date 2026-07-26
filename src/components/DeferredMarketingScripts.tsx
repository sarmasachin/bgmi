"use client";

import { useEffect } from "react";

export type DeferredScriptPayload = {
  externalSrc?: string;
  inlineJs?: string;
  crossOrigin?: boolean;
  id: string;
};

type Props = {
  analytics?: DeferredScriptPayload | null;
  adsense?: DeferredScriptPayload | null;
  /** Delay before injecting (ms). Keeps LCP free of gtag/ads. */
  delayMs?: number;
};

function injectExternal(src: string, id: string, crossOrigin?: boolean) {
  if (document.getElementById(id)) return;
  const el = document.createElement("script");
  el.id = id;
  el.async = true;
  el.src = src;
  if (crossOrigin) el.crossOrigin = "anonymous";
  document.head.appendChild(el);
}

function injectInline(js: string, id: string) {
  if (document.getElementById(id)) return;
  const el = document.createElement("script");
  el.id = id;
  el.text = js;
  document.head.appendChild(el);
}

function injectPayload(p: DeferredScriptPayload) {
  if (p.externalSrc) {
    injectExternal(p.externalSrc, `${p.id}-src`, p.crossOrigin);
  }
  if (p.inlineJs) {
    injectInline(p.inlineJs, p.id);
  }
}

/**
 * Inject GA / AdSense into <head> after LCP window.
 * Still ends up in head (Google-compatible), but not on the critical path.
 */
export function DeferredMarketingScripts({
  analytics,
  adsense,
  delayMs = 3500,
}: Props) {
  useEffect(() => {
    if (!analytics && !adsense) return;

    let done = false;
    const run = () => {
      if (done) return;
      done = true;
      if (analytics) injectPayload(analytics);
      if (adsense) injectPayload(adsense);
    };

    const onInteract = () => run();
    const events = ["scroll", "touchstart", "click", "keydown"] as const;
    for (const ev of events) {
      window.addEventListener(ev, onInteract, { once: true, passive: true });
    }

    const t = window.setTimeout(run, delayMs);
    const ric =
      "requestIdleCallback" in window
        ? window.requestIdleCallback(() => run(), { timeout: delayMs + 1500 })
        : 0;

    return () => {
      window.clearTimeout(t);
      if (ric && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(ric);
      }
      for (const ev of events) {
        window.removeEventListener(ev, onInteract);
      }
    };
  }, [analytics, adsense, delayMs]);

  return null;
}
