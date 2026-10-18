"use client";

import { useEffect, useRef } from "react";
import { readAdminNoAdsFlag } from "@/src/lib/adminNoAdsFlag";

type Props = {
  html: string;
  slotKey: string;
};

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

function isAdReady(ins: HTMLElement): boolean {
  const status = (ins.getAttribute("data-ad-status") || "").toLowerCase();
  if (status === "filled" || status === "unfill-optimized") return true;
  return Boolean(ins.querySelector("iframe"));
}

/** Stable slot floor — prevents CLS from 0→ad. Still hugs taller creatives. */
const AD_SLOT_MIN_PX = 90;

/** Actual creative height — ignore AdSense's oversized empty reserve. */
function measureCreativeHeight(ins: HTMLElement): number {
  const iframe = ins.querySelector("iframe");
  if (iframe instanceof HTMLElement && iframe.offsetHeight > 20) {
    return Math.ceil(iframe.offsetHeight);
  }

  let childMax = 0;
  for (const child of Array.from(ins.children)) {
    if (!(child instanceof HTMLElement)) continue;
    if (child.tagName === "SCRIPT") continue;
    childMax = Math.max(childMax, child.offsetHeight, child.scrollHeight);
  }
  if (childMax > 20) return Math.ceil(childMax);

  return 0;
}

function fitWrapToAd(el: HTMLElement, ins: HTMLElement) {
  if (!isAdReady(ins)) return;

  const creativeH = measureCreativeHeight(ins);
  if (creativeH < 20) return;

  // Never collapse below the reserved floor (big CLS source was 0 → N px).
  const target = Math.max(creativeH, AD_SLOT_MIN_PX);
  const h = `${target}px`;
  const minH = `${AD_SLOT_MIN_PX}px`;
  if (el.style.height === h && ins.style.height === h) return;

  ins.style.minHeight = minH;
  ins.style.height = h;
  ins.style.maxHeight = h;
  el.style.minHeight = minH;
  el.style.height = h;
  el.style.maxHeight = h;
  el.style.overflow = "hidden";
  el.style.display = "block";

  const shell = el.closest(".ff-home-ad, .ff-public-ad");
  if (shell instanceof HTMLElement) {
    shell.style.minHeight = minH;
    shell.style.height = "auto";
    shell.style.display = "block";
  }
}

/**
 * Injects ad HTML and re-executes inline <script> tags.
 * Wrap width = 100% (responsive). Height hugs the creative — no tall empty div.
 */
export function AdSlotClient({ html, slotKey }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      readAdminNoAdsFlag(document.cookie) ||
      document.documentElement.hasAttribute("data-admin-no-ads")
    ) {
      el.innerHTML = "";
      return;
    }
    let cancelled = false;

    el.style.display = "";
    el.style.height = "";
    el.style.maxHeight = "";
    el.style.minHeight = "";
    el.style.overflow = "";
    el.innerHTML = html;

    el.querySelectorAll("ins.adsbygoogle").forEach((node) => {
      if (!(node instanceof HTMLElement)) return;
      // Responsive unit: full width of parent, AdSense picks height.
      node.setAttribute("data-full-width-responsive", "true");
      const format = (node.getAttribute("data-ad-format") || "").toLowerCase();
      if (!format || format === "rectangle") {
        node.setAttribute("data-ad-format", "auto");
      }
      node.style.display = "block";
      node.style.width = "100%";
      node.style.maxWidth = "100%";
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

    const fit = () => {
      if (cancelled) return;
      fitWrapToAd(el, ins);
    };

    const mo = new MutationObserver(fit);
    mo.observe(ins, {
      attributes: true,
      attributeFilter: ["style", "data-ad-status", "data-adsbygoogle-status"],
      childList: true,
      subtree: true,
    });

    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(fit) : null;
    ro?.observe(ins);

    const times = [400, 1000, 2000, 4000, 7000].map((ms) => window.setTimeout(fit, ms));

    return () => {
      cancelled = true;
      mo.disconnect();
      ro?.disconnect();
      window.clearTimeout(pushTimer);
      for (const t of times) window.clearTimeout(t);
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
          display: block;
          width: 100%;
          max-width: 100%;
          min-width: 0;
          min-height: 90px;
          height: auto;
          box-sizing: border-box;
          background: transparent !important;
          border: 0 !important;
          border-radius: 0 !important;
          outline: 0 !important;
          box-shadow: none !important;
          padding: 0 !important;
          margin: 0 !important;
          contain: layout;
        }
        .ad-slot.ad-slot--flush:empty {
          display: none;
          min-height: 0;
        }
        .ad-slot.ad-slot--flush ins.adsbygoogle {
          display: block;
          width: 100% !important;
          max-width: 100%;
          min-width: 0;
          min-height: 90px;
          box-sizing: border-box;
          margin: 0 !important;
          padding: 0 !important;
          background: transparent !important;
        }
        .ad-slot.ad-slot--flush iframe {
          display: block;
          width: 100% !important;
          max-width: 100%;
          border: 0;
          margin: 0;
          vertical-align: bottom;
        }
      `}</style>
    </>
  );
}
