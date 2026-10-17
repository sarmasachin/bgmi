"use client";

import { useEffect, useRef } from "react";

type Props = {
  html: string;
  slotKey: string;
};

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * Injects ad HTML and re-executes inline <script> tags.
 * - Strips duplicate adsbygoogle.js (already in root layout).
 * - Delayed push so React Strict Mode remount does not double-push / flash-hide.
 * - Never clips creatives with % height caps (that caused half-ads).
 * - Never hides slots on AdSense "unfilled" (that caused show-then-hide).
 * - Only trims clear white space when the iframe is shorter than the reserved box.
 */
export function AdSlotClient({ html, slotKey }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;

    el.style.display = "";
    el.style.maxHeight = "";
    el.style.overflow = "";
    el.innerHTML = html;

    el.querySelectorAll("ins.adsbygoogle").forEach((node) => {
      if (!(node instanceof HTMLElement)) return;
      node.style.height = "";
      node.style.minHeight = "";
      node.style.maxHeight = "";
    });

    el.querySelectorAll("script").forEach((oldScript) => {
      const src = (oldScript.getAttribute("src") || "").toLowerCase();
      if (src.includes("adsbygoogle.js")) {
        oldScript.remove();
        return;
      }
      const s = document.createElement("script");
      for (const attr of oldScript.attributes) {
        s.setAttribute(attr.name, attr.value);
      }
      s.textContent = oldScript.textContent;
      oldScript.replaceWith(s);
    });

    // Defer push: Strict Mode cleanup cancels the first scheduled push.
    const pushTimer = window.setTimeout(() => {
      if (cancelled) return;
      const pending = el.querySelectorAll("ins.adsbygoogle:not([data-adsbygoogle-status])");
      if (!pending.length) return;
      window.adsbygoogle = window.adsbygoogle || [];
      pending.forEach(() => {
        try {
          window.adsbygoogle!.push({});
        } catch {
          /* already processed */
        }
      });
    }, 50);

    const ins = el.querySelector("ins.adsbygoogle");
    if (!(ins instanceof HTMLElement)) {
      return () => {
        cancelled = true;
        window.clearTimeout(pushTimer);
      };
    }

    const trimWhiteGapOnly = () => {
      if (cancelled) return;
      if (ins.getAttribute("data-ad-status") !== "filled") return;
      const iframe = ins.querySelector("iframe");
      const iframeH = iframe instanceof HTMLElement ? iframe.offsetHeight : 0;
      const h = ins.offsetHeight;
      if (iframeH > 40 && h > iframeH + 24) {
        ins.style.height = `${iframeH}px`;
        ins.style.maxHeight = `${iframeH}px`;
        el.style.maxHeight = `${iframeH}px`;
        el.style.overflow = "hidden";
      }
    };

    const mo = new MutationObserver(trimWhiteGapOnly);
    mo.observe(ins, { attributes: true, attributeFilter: ["style", "data-ad-status"] });
    const t1 = window.setTimeout(trimWhiteGapOnly, 1200);
    const t2 = window.setTimeout(trimWhiteGapOnly, 3500);

    return () => {
      cancelled = true;
      mo.disconnect();
      window.clearTimeout(pushTimer);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [html, slotKey]);

  return (
    <>
      <div
        ref={ref}
        className="ad-slot ad-slot--flush"
        data-ad-slot={slotKey}
        aria-label="Advertisement"
      />
      <style>{`
        .ad-slot.ad-slot--flush {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
          background: transparent !important;
          border: 0 !important;
          border-radius: 0 !important;
          outline: 0 !important;
          box-shadow: none !important;
          color: inherit;
          text-align: left;
          padding: 0 !important;
          margin: 0 !important;
        }
        .ad-slot.ad-slot--flush:empty {
          display: none;
        }
        .ad-slot.ad-slot--flush ins.adsbygoogle {
          display: block;
          width: 100%;
          box-sizing: border-box;
          max-width: 100%;
        }
        .ad-slot.ad-slot--flush iframe {
          display: block;
          max-width: 100%;
        }
      `}</style>
    </>
  );
}
