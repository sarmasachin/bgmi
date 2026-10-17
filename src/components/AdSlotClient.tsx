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

const MOBILE_MAX = 720;

/**
 * Injects ad HTML and re-executes inline <script> tags.
 * - Strips duplicate adsbygoogle.js (already in root layout).
 * - On phone widths, prefers horizontal format so Auto+FWR does not reserve a
 *   square (100vw × 100vw) that leaves white space under short multipled creatives.
 * - After fill, clamps wrap height to the iframe when AdSense reserved a taller box.
 */
export function AdSlotClient({ html, slotKey }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.maxHeight = "";
    el.style.overflow = "";
    el.innerHTML = html;

    const mobile = window.innerWidth <= MOBILE_MAX;
    el.querySelectorAll("ins.adsbygoogle").forEach((node) => {
      if (!(node instanceof HTMLElement)) return;
      if (mobile) {
        const format = (node.getAttribute("data-ad-format") || "").toLowerCase();
        if (format === "auto" || format === "") {
          node.setAttribute("data-ad-format", "horizontal");
        }
      }
      // Clear stale inline square height before AdSense runs.
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

    const pending = el.querySelectorAll("ins.adsbygoogle:not([data-adsbygoogle-status])");
    if (pending.length) {
      window.adsbygoogle = window.adsbygoogle || [];
      pending.forEach(() => {
        try {
          window.adsbygoogle!.push({});
        } catch {
          /* already processed */
        }
      });
    }

    const ins = el.querySelector("ins.adsbygoogle");
    if (!(ins instanceof HTMLElement)) return;

    const clampFilled = () => {
      const status = ins.getAttribute("data-ad-status");
      if (status === "unfilled") {
        el.style.display = "none";
        return;
      }
      if (status !== "filled") return;

      const iframe = ins.querySelector("iframe");
      const iframeH = iframe instanceof HTMLElement ? iframe.offsetHeight : 0;
      const h = ins.offsetHeight;
      const w = Math.max(ins.offsetWidth, 1);

      // AdSense reserved taller than the creative iframe → trim white gap.
      if (iframeH > 40 && h > iframeH + 20) {
        ins.style.height = `${iframeH}px`;
        ins.style.maxHeight = `${iframeH}px`;
        el.style.maxHeight = `${iframeH}px`;
        el.style.overflow = "hidden";
        return;
      }

      // Mobile near-square reserve with no usable iframe height yet.
      if (mobile && h >= w * 0.85 && h > 260) {
        const cap = Math.min(280, Math.round(w * 0.4));
        el.style.maxHeight = `${cap}px`;
        el.style.overflow = "hidden";
      }
    };

    const mo = new MutationObserver(clampFilled);
    mo.observe(ins, { attributes: true, attributeFilter: ["style", "data-ad-status"] });
    const t1 = window.setTimeout(clampFilled, 800);
    const t2 = window.setTimeout(clampFilled, 2000);
    const t3 = window.setTimeout(clampFilled, 4000);
    return () => {
      mo.disconnect();
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [html]);

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
