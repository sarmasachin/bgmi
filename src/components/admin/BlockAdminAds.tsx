"use client";

import { useEffect } from "react";

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
].join(",");

const HIDE_CSS = `
html[data-admin-no-ads] ins.adsbygoogle,
html[data-admin-no-ads] .google-auto-placed,
html[data-admin-no-ads] iframe[src*="googlesyndication"],
html[data-admin-no-ads] iframe[src*="doubleclick.net"],
html[data-admin-no-ads] iframe[id^="aswift_"],
html[data-admin-no-ads] iframe[id^="google_ads_iframe"],
html[data-admin-no-ads] #google-anno-sa,
html[data-admin-no-ads] .google-anno-skip {
  display: none !important;
  visibility: hidden !important;
  pointer-events: none !important;
}
`;

/** Auto ads can already be running if the user opened a public page first. */
export function BlockAdminAds() {
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-admin-no-ads", "");

    let cleaning = false;
    const strip = () => {
      if (cleaning) return;
      cleaning = true;
      document.querySelectorAll(AD_NODES).forEach((node) => node.remove());
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
      root.removeAttribute("data-admin-no-ads");
      if (!document.querySelector("script[src*='adsbygoogle.js']")) {
        const script = document.createElement("script");
        script.async = true;
        script.src = ADSENSE_AUTO_SRC;
        script.crossOrigin = "anonymous";
        document.head.appendChild(script);
      }
    };
  }, []);

  return <style dangerouslySetInnerHTML={{ __html: HIDE_CSS }} />;
}
