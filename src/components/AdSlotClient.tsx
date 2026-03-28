"use client";

import { useEffect, useRef } from "react";

type Props = {
  html: string;
  slotKey: string;
};

/**
 * Injects ad HTML and re-executes <script> tags (React innerHTML does not run scripts).
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
    <div
      ref={ref}
      className="ad-slot"
      data-ad-slot={slotKey}
      aria-label="Advertisement"
    />
  );
}
