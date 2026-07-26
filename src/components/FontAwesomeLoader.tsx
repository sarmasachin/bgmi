"use client";

import { useEffect } from "react";

const FA_BASE = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0";
/** Solid-only (site uses fa-solid) — smaller than all.min.css */
const FA_CSS = [
  `${FA_BASE}/css/fontawesome.min.css`,
  `${FA_BASE}/css/solid.min.css`,
] as const;

/**
 * Load Font Awesome after first paint / idle — avoids unused CSS on mobile LCP.
 */
export function FontAwesomeLoader() {
  useEffect(() => {
    if (document.querySelector('link[data-fa-site="1"]')) return;

    let loaded = false;
    const load = () => {
      if (loaded) return;
      loaded = true;
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
    };

    const t = window.setTimeout(load, 2500);
    const ric =
      "requestIdleCallback" in window
        ? window.requestIdleCallback(load, { timeout: 4000 })
        : 0;
    const onInteract = () => load();
    window.addEventListener("scroll", onInteract, { once: true, passive: true });
    window.addEventListener("touchstart", onInteract, { once: true, passive: true });

    return () => {
      window.clearTimeout(t);
      if (ric && "cancelIdleCallback" in window) window.cancelIdleCallback(ric);
      window.removeEventListener("scroll", onInteract);
      window.removeEventListener("touchstart", onInteract);
    };
  }, []);

  return (
    <noscript>
      {FA_CSS.map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}
    </noscript>
  );
}
