"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export type DeferredScriptPayload = {
  externalSrc?: string;
  inlineJs?: string;
  crossOrigin?: boolean;
  id: string;
};

type Props = {
  analytics?: DeferredScriptPayload | null;
  adsense?: DeferredScriptPayload | null;
  /** AdSense delay after open (ms). Short so impressions are not lost. */
  adsenseDelayMs?: number;
  /** Analytics delay after open (ms). Longer — less impact on INP/LCP. */
  analyticsDelayMs?: number;
};

function isAdminPath(pathname: string | null): boolean {
  return Boolean(pathname?.startsWith("/admin"));
}

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
 * AdSense: loads soon after page open (revenue).
 * Analytics: later.
 * Never inject on first click/tap (that hurt INP).
 */
export function DeferredMarketingScripts({
  analytics,
  adsense,
  adsenseDelayMs = 1200,
  analyticsDelayMs = 4500,
}: Props) {
  const pathname = usePathname();

  useEffect(() => {
    if (isAdminPath(pathname)) return;
    if (!analytics && !adsense) return;

    let adsenseDone = false;
    let analyticsDone = false;
    const timers: number[] = [];
    const idleIds: number[] = [];

    const runAdsense = () => {
      if (adsenseDone || !adsense) return;
      adsenseDone = true;
      injectPayload(adsense);
    };

    const runAnalytics = () => {
      if (analyticsDone || !analytics) return;
      analyticsDone = true;
      injectPayload(analytics);
    };

    if (adsense) {
      // Soon after open so ads show; idle may fire even earlier if main thread is free.
      timers.push(window.setTimeout(runAdsense, adsenseDelayMs));
      if ("requestIdleCallback" in window) {
        idleIds.push(
          window.requestIdleCallback(runAdsense, { timeout: adsenseDelayMs }),
        );
      }
    }

    if (analytics) {
      timers.push(window.setTimeout(runAnalytics, analyticsDelayMs));
      if ("requestIdleCallback" in window) {
        idleIds.push(
          window.requestIdleCallback(runAnalytics, {
            timeout: analyticsDelayMs + 1500,
          }),
        );
      }
    }

    return () => {
      for (const t of timers) window.clearTimeout(t);
      if ("cancelIdleCallback" in window) {
        for (const id of idleIds) window.cancelIdleCallback(id);
      }
    };
  }, [analytics, adsense, adsenseDelayMs, analyticsDelayMs, pathname]);

  return null;
}
