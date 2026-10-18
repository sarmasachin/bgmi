"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { readAdminNoAdsFlag } from "@/src/lib/adminNoAdsFlag";

const ADSENSE_AUTO_SRC =
  "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9467977262277079";

const AD_NODES = [
  "ins.adsbygoogle",
  ".google-auto-placed",
  "iframe[src*='googlesyndication']",
  "iframe[src*='doubleclick.net']",
  "iframe[id^='aswift_']",
  "iframe[id^='google_ads_iframe']",
  "div[id^='google_ads_iframe']",
  "#google-anno-sa",
  ".google-anno-skip",
  ".ff-public-ad",
  ".ff-home-ad",
  "[data-ad-slot]",
].join(",");

const HIDE_CSS = `
html[data-admin-no-ads] ins.adsbygoogle,
html[data-admin-no-ads] .google-auto-placed,
html[data-admin-no-ads] iframe[src*="googlesyndication"],
html[data-admin-no-ads] iframe[src*="doubleclick.net"],
html[data-admin-no-ads] iframe[id^="aswift_"],
html[data-admin-no-ads] iframe[id^="google_ads_iframe"],
html[data-admin-no-ads] #google-anno-sa,
html[data-admin-no-ads] .google-anno-skip,
html[data-admin-no-ads] .ff-public-ad,
html[data-admin-no-ads] .ff-home-ad,
html[data-admin-no-ads] [data-ad-slot] {
  display: none !important;
  visibility: hidden !important;
  pointer-events: none !important;
  height: 0 !important;
  min-height: 0 !important;
  margin: 0 !important;
  overflow: hidden !important;
}
`;

function shouldHideAds(pathname: string | null, sessionHidden: boolean): boolean {
  if (pathname?.startsWith("/admin")) return true;
  if (sessionHidden) return true;
  return readAdminNoAdsFlag(document.cookie);
}

type Props = {
  /** Signed admin session on this document. Stays true for that tab until a full reload. */
  sessionHidden?: boolean;
};

/**
 * Hides ads on /admin and on every page while this browser has an admin session
 * (including incognito). A logged-out visit to /admin still restores ads on the public site.
 */
export function BlockAdminAds({ sessionHidden = false }: Props) {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const hide = shouldHideAds(pathname, sessionHidden);

    if (!hide) {
      root.removeAttribute("data-admin-no-ads");
      if (!document.querySelector("script[src*='adsbygoogle.js']")) {
        const script = document.createElement("script");
        script.async = true;
        script.src = ADSENSE_AUTO_SRC;
        script.crossOrigin = "anonymous";
        document.head.appendChild(script);
      }
      return;
    }

    root.setAttribute("data-admin-no-ads", "");
    document.querySelectorAll("script[src*='adsbygoogle.js']").forEach((node) => node.remove());

    let cleaning = false;
    const strip = () => {
      if (cleaning) return;
      cleaning = true;
      document.querySelectorAll(AD_NODES).forEach((node) => node.remove());
      document.querySelectorAll("script[src*='adsbygoogle.js']").forEach((node) => node.remove());
      cleaning = false;
    };

    strip();
    let scheduled = false;
    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(() => {
        scheduled = false;
        strip();
      });
    };
    const observer = new MutationObserver(schedule);
    observer.observe(root, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, [pathname, sessionHidden]);

  return <style dangerouslySetInnerHTML={{ __html: HIDE_CSS }} />;
}
