"use client";

import { useEffect } from "react";

const FA_BASE = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0";
/** Solid-only (site uses fa-solid) — smaller than all.min.css */
const FA_CSS = [
  `${FA_BASE}/css/fontawesome.min.css`,
  `${FA_BASE}/css/solid.min.css`,
] as const;

/**
 * Load Font Awesome once (non-blocking) to fix:
 * - font-display / invisible text
 * - critical request chain (HTML → CSS → woff2)
 * - forced reflow from many duplicate <link> injections
 */
export function FontAwesomeLoader() {
  useEffect(() => {
    if (document.querySelector('link[data-fa-site="1"]')) return;

    for (const href of FA_CSS) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.dataset.faSite = "1";
      link.media = "print";
      link.onload = () => {
        link.media = "all";
      };
      document.head.appendChild(link);
    }
  }, []);

  return (
    <noscript>
      {FA_CSS.map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}
    </noscript>
  );
}
