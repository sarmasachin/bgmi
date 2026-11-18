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

/** Phone: square card. Wider screens: horizontal bar, sized to the column. */
const SQUARE_MAX_PX = 720;
const SQUARE_WIDTH = 300;
const SQUARE_HEIGHT = 250;

function useSquareAd() {
  return window.matchMedia(`(max-width: ${SQUARE_MAX_PX}px)`).matches;
}

function applyAdShape(el: HTMLElement, ins: HTMLElement | null) {
  const square = useSquareAd();
  el.dataset.adShape = square ? "square" : "horizontal";
  el.style.display = "block";
  el.style.marginLeft = "auto";
  el.style.marginRight = "auto";
  el.style.maxWidth = "100%";
  if (!ins) return;

  if (square) {
    ins.setAttribute("data-ad-format", "rectangle");
    ins.setAttribute("data-full-width-responsive", "false");
    ins.style.display = "inline-block";
    ins.style.width = `${SQUARE_WIDTH}px`;
    ins.style.maxWidth = "100%";
    ins.style.height = `${SQUARE_HEIGHT}px`;
    ins.style.maxHeight = `${SQUARE_HEIGHT}px`;
    el.style.width = `${SQUARE_WIDTH}px`;
    el.style.height = `${SQUARE_HEIGHT}px`;
    el.style.maxHeight = `${SQUARE_HEIGHT}px`;
    el.style.overflow = "hidden";
    return;
  }

  ins.setAttribute("data-ad-format", "horizontal");
  ins.setAttribute("data-full-width-responsive", "true");
  ins.style.display = "block";
  ins.style.width = "100%";
  ins.style.maxWidth = "100%";
  ins.style.height = "";
  ins.style.minHeight = "";
  ins.style.maxHeight = "";
  el.style.width = "100%";
  el.style.height = "auto";
  el.style.maxHeight = "none";
  el.style.overflow = "visible";
}

/**
 * Injects ad HTML and re-executes inline <script> tags.
 * Desktop and tablet: horizontal responsive ad. Phone: 300×250 square.
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
    const mobileOnly = el.closest("[data-mobile-only-ad]");
    if (mobileOnly instanceof HTMLElement) {
      const max = Number(mobileOnly.getAttribute("data-mobile-max") || 720);
      if (!window.matchMedia(`(max-width: ${max}px)`).matches) {
        el.innerHTML = "";
        return;
      }
    }
    let cancelled = false;

    el.style.display = "";
    el.style.height = "";
    el.style.maxHeight = "";
    el.style.minHeight = "";
    el.style.overflow = "";
    el.innerHTML = html;
    const firstIns = el.querySelector("ins.adsbygoogle");
    applyAdShape(el, firstIns instanceof HTMLElement ? firstIns : null);

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
      if (cancelled || !isAdReady(ins)) return;
      const square = useSquareAd();
      if (square) {
        if (el.dataset.adShape === "square" && ins.style.width === "300px") return;
      } else if (el.dataset.adShape === "horizontal" && ins.style.width === "100%") {
        return;
      }
      applyAdShape(el, ins);
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
          height: auto;
          box-sizing: border-box;
          background: transparent !important;
          border: 0 !important;
          border-radius: 0 !important;
          outline: 0 !important;
          box-shadow: none !important;
          padding: 0 !important;
          margin: 12px auto !important;
          overflow: visible;
        }
        .ad-slot.ad-slot--flush:empty {
          display: none;
        }
        .ad-slot.ad-slot--flush ins.adsbygoogle,
        .ad-slot.ad-slot--flush iframe,
        .ad-slot.ad-slot--flush img {
          display: block;
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box;
          margin: 0 auto !important;
          padding: 0 !important;
          border: 0;
          background: transparent !important;
        }
        .ad-slot.ad-slot--flush[data-ad-shape="square"] {
          width: 300px;
          height: 250px;
          overflow: hidden;
        }
        .ad-slot.ad-slot--flush[data-ad-shape="square"] ins.adsbygoogle,
        .ad-slot.ad-slot--flush[data-ad-shape="square"] iframe,
        .ad-slot.ad-slot--flush[data-ad-shape="square"] img {
          width: 300px !important;
          height: 250px !important;
          object-fit: contain;
        }
      `}</style>
    </>
  );
}
