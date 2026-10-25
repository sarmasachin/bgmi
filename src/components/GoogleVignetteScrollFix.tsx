"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/** AdSense Auto ads vignette sets this hash and locks body scroll. */
const VIGNETTE_HASH = "#google_vignette";

function isVignetteHash(hash: string): boolean {
  const h = (hash || "").toLowerCase();
  return h === VIGNETTE_HASH || h.includes("google_vignette");
}

function siteMenuOpen(): boolean {
  return Boolean(document.querySelector(".home-side-menu.is-open"));
}

/** Large fixed high-z layer - typical while the interstitial is on screen. */
function vignetteUiPresent(): boolean {
  const nodes = document.querySelectorAll("iframe, div, ins");
  for (const node of nodes) {
    if (!(node instanceof HTMLElement)) continue;
    const st = window.getComputedStyle(node);
    if (st.position !== "fixed") continue;
    if (st.visibility === "hidden" || st.display === "none" || st.opacity === "0") {
      continue;
    }
    const z = Number(st.zIndex);
    if (!Number.isFinite(z) || z < 1000) continue;
    const r = node.getBoundingClientRect();
    if (r.width >= window.innerWidth * 0.75 && r.height >= window.innerHeight * 0.45) {
      return true;
    }
  }
  return false;
}

function unlockBodyScroll() {
  // Hamburger menu also sets body overflow:hidden — don't clear while open.
  if (siteMenuOpen()) return;
  const { body, documentElement } = document;
  if (body.style.overflow === "hidden") body.style.overflow = "";
  if (documentElement.style.overflow === "hidden") {
    documentElement.style.overflow = "";
  }
  // AdSense vignette sometimes freezes scroll with position:fixed + top offset.
  if (body.style.position === "fixed") {
    const top = body.style.top;
    body.style.position = "";
    body.style.top = "";
    body.style.left = "";
    body.style.right = "";
    body.style.width = "";
    const y = top ? Math.abs(Number.parseInt(top, 10) || 0) : 0;
    if (y > 0) window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior });
  }
}

function stripVignetteHash() {
  if (!isVignetteHash(window.location.hash)) return;
  const clean = `${window.location.pathname}${window.location.search}`;
  window.history.replaceState(null, "", clean);
}

/**
 * Fixes stuck AdSense `#google_vignette` scroll lock (URL shows ads name after /).
 * Does not remove the hash while the interstitial UI is still visible.
 */
export function GoogleVignetteScrollFix() {
  const pathname = usePathname();
  const hashSinceRef = useRef<number | null>(null);

  useEffect(() => {
    // Soft nav away: never keep vignette hash/lock on the next page.
    stripVignetteHash();
    unlockBodyScroll();
    // Menu close may commit one frame later — unlock again after paint.
    const t0 = window.setTimeout(() => unlockBodyScroll(), 0);
    const t1 = window.setTimeout(() => unlockBodyScroll(), 120);
    hashSinceRef.current = null;
    return () => {
      window.clearTimeout(t0);
      window.clearTimeout(t1);
    };
  }, [pathname]);

  useEffect(() => {
    const noteHash = () => {
      if (isVignetteHash(window.location.hash)) {
        if (hashSinceRef.current == null) hashSinceRef.current = Date.now();
      } else {
        hashSinceRef.current = null;
        unlockBodyScroll();
      }
    };
    noteHash();

    const onHash = () => noteHash();
    const onPop = () =>
      window.setTimeout(() => {
        noteHash();
        if (!isVignetteHash(window.location.hash)) unlockBodyScroll();
      }, 0);

    window.addEventListener("hashchange", onHash);
    window.addEventListener("popstate", onPop);

    const timer = window.setInterval(() => {
      if (!isVignetteHash(window.location.hash)) return;
      if (siteMenuOpen()) return;
      if (vignetteUiPresent()) return;
      // Grace: let Google finish mounting the overlay before treating as stuck.
      const since = hashSinceRef.current ?? Date.now();
      if (Date.now() - since < 4000) return;
      stripVignetteHash();
      unlockBodyScroll();
      hashSinceRef.current = null;
    }, 2000);

    return () => {
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("popstate", onPop);
      window.clearInterval(timer);
    };
  }, []);

  return null;
}
