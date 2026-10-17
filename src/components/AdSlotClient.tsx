"use client";

import { useEffect, useRef } from "react";

type Props = {
  html: string;
  slotKey: string;
};

/**
 * Injects ad HTML and re-executes <script> tags (React innerHTML does not run scripts).
 * Public ads are borderless and full-width (overrides global .ad-slot dashed box).
 */
export function AdSlotClient({ html, slotKey }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = html;
    el.querySelectorAll("script").forEach((oldScript) => {
      const s = document.createElement("script");
      for (const attr of oldScript.attributes) {
        s.setAttribute(attr.name, attr.value);
      }
      s.textContent = oldScript.textContent;
      oldScript.replaceWith(s);
    });
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
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0;
          height: auto !important;
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
          overflow: hidden;
        }
        .ad-slot.ad-slot--flush:empty {
          display: none;
        }
        .ad-slot.ad-slot--flush ins,
        .ad-slot.ad-slot--flush > div {
          display: block;
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box;
        }
        .ad-slot.ad-slot--flush iframe,
        .ad-slot.ad-slot--flush img {
          display: block;
          width: 100% !important;
          max-width: 100% !important;
          height: auto;
        }
      `}</style>
    </>
  );
}
