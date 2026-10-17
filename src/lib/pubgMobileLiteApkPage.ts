import { BGMI_LITE_LAUNCH_TARGET_ISO } from "@/src/lib/bgmiLiteBetaApkPage";
import { PUBG_MOBILE_LITE_APK_PATH } from "@/src/lib/pubgMobileLite";
import {
  PUBG_MOBILE_LITE_APK_ARTICLE_HTML,
  PUBG_MOBILE_LITE_APK_FAQS,
} from "@/src/lib/pubgMobileLiteApkArticle";

export const PUBG_MOBILE_LITE_APK_PAGE_KEY = "pubg-mobile-lite-apk";

/** Same site-tracked launch target as BGMI Air APK (IST). */
export const PUBG_MOBILE_LITE_LAUNCH_TARGET_ISO = BGMI_LITE_LAUNCH_TARGET_ISO;

export type PubgMobileLiteApkCard = {
  id: string;
  badge: string;
  icon: string;
  title: string;
  summary: string;
  points: string[];
  ctaLabel?: string;
  ctaHref?: string;
};

export type PubgMobileLiteApkPageContent = {
  path: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  heroTitle: string;
  subtitleEn: string;
  pills: Array<{ label: string }>;
  countdown: {
    label: string;
    targetIso: string;
    dateText: string;
    liveMessage: string;
  };
  heroImage: string;
  heroImageAlt: string;
  cards: PubgMobileLiteApkCard[];
  articleHtml: string;
  faqs: Array<{ id: string; question: string; answer: string }>;
  commentsLead: string;
};

/**
 * Fan-made PUBG Mobile Flash APK page — same layout/timer as BGMI Air APK.
 * Does not host APKs or link to unofficial downloads.
 */
export const DEFAULT_PUBG_MOBILE_LITE_APK_PAGE: PubgMobileLiteApkPageContent = {
  path: PUBG_MOBILE_LITE_APK_PATH,
  seoTitle: "PUBG Mobile Flash APK & Launch Countdown",
  seoDescription:
    "PUBG Mobile Flash APK guide with 12 November 2026 launch countdown, Google Play install tips, safety notes, and PUBG Mobile Flash sensitivity help — we do not host APKs.",
  seoKeywords: [
    "PUBG Mobile Flash APK",
    "PUBG Flash APK",
    "PUBG Mobile Flash launch date",
    "PUBG Flash 12 November 2026",
    "PUBG Mobile Flash download",
    "PUBG Flash countdown",
    "PUBG Mobile Flash Google Play",
    "PUBG Flash vs PUBG Mobile",
    "PUBG Mobile Flash sensitivity",
  ],
  heroTitle: "PUBG Flash APK",
  subtitleEn:
    "Fan-made info guide for the lighter PUBG Mobile client for budget phones. Pre-registration and install happen on the official Google Play listing — this is an info page with a launch countdown, not a PUBG Flash APK download hub.",
  pills: [
    { label: "Launch target: 12 Nov 2026" },
    { label: "Android · Google Play" },
    { label: "No APK hosting" },
  ],
  countdown: {
    label: "Countdown to PUBG Mobile Flash launch (12 November 2026)",
    targetIso: PUBG_MOBILE_LITE_LAUNCH_TARGET_ISO,
    dateText:
      "PUBG Mobile Flash launch date · 12 November 2026 — confirm on Google Play / official channel",
    liveMessage:
      "PUBG Mobile Flash launch window reached — check Google Play for the official listing",
  },
  heroImage: "/pubg/pubg-mobile-lite-apk-hero.png",
  heroImageAlt:
    "PUBG Mobile Flash themed banner — lighter battle royale for budget Android phones",
  cards: [
    {
      id: "safe-download",
      badge: "Safety",
      icon: "fa-shield-halved",
      title: "No random APK mirrors",
      summary:
        "Publishers have not asked players to install PUBG Mobile Flash from random websites. Stick to the official Play Store listing when it is available.",
      points: [
        "Verify the publisher on Google Play",
        "Skip paid “PUBG Mobile Flash APK” links — those are scams",
        "This site does not host or mirror install files",
      ],
    },
    {
      id: "what-we-know",
      badge: "Confirmed",
      icon: "fa-circle-info",
      title: "What is confirmed so far",
      summary:
        "PUBG Mobile Flash targets budget / older Android phones with a smaller install footprint and smoother play on entry hardware.",
      points: [
        "Built for budget / older Android phones",
        "Install via Google Play when the listing is live",
        "Exact features & min specs — confirm on the store",
      ],
    },
    {
      id: "launch-window",
      badge: "Date",
      icon: "fa-calendar-day",
      title: "12 November 2026 countdown",
      summary:
        "This page counts down to 12 November 2026 (IST) — the same site target used for BGMI Air — so you can track launch day in one place. Confirm any official change on Play Store.",
      points: [
        "Site target date: 12 Nov 2026 (same as BGMI Air)",
        "Confirm on Google Play / official updates",
        "Retune sensi after the live client ships",
      ],
    },
    {
      id: "prereg",
      badge: "Play Store",
      icon: "fa-mobile-screen",
      title: "Pre-registration / install steps",
      summary:
        "Android players should use Google Play only. No account transfer ritual is required beyond what the official listing documents.",
      points: [
        "Search PUBG Mobile Flash on Google Play",
        "Tap Pre-register / Install when available",
        "Wait for the official release — skip sideload APKs",
      ],
    },
    {
      id: "vs-full",
      badge: "Compare",
      icon: "fa-table",
      title: "PUBG Mobile Flash vs full PUBG Mobile",
      summary:
        "PUBG Mobile Flash is for entry phones; full PUBG Mobile suits stronger devices and higher FPS modes. Use the matching calculator on this site.",
      points: [
        "PUBG Mobile Flash: smaller install, budget hardware focus",
        "Full PUBG: 60 / 90 / 120 FPS on stronger phones",
        "Don’t paste flagship codes into PUBG Mobile Flash",
      ],
      ctaLabel: "Open PUBG Mobile calculator",
      ctaHref: "/pubg",
    },
    {
      id: "sensi-ready",
      badge: "Aim",
      icon: "fa-crosshairs",
      title: "Get PUBG Mobile Flash sensitivity ready",
      summary:
        "When PUBG Mobile Flash goes live, use our PUBG Mobile Flash calculator for Camera, ADS, and Gyroscope baselines for 2GB–4GB / 30–60 FPS phones.",
      points: [
        "Don’t paste flagship 90/120 FPS full-game codes",
        "Prefer Scope On gyro on entry phones",
        "Fine-tune ±5 in Training Ground after install",
      ],
      ctaLabel: "Open PUBG Mobile Flash calculator",
      ctaHref: "/pubg-mobile-lite",
    },
  ],
  articleHtml: PUBG_MOBILE_LITE_APK_ARTICLE_HTML,
  faqs: PUBG_MOBILE_LITE_APK_FAQS.map((item) => ({ ...item })),
  commentsLead:
    "Ask questions or share PUBG Mobile Flash launch tips. Comments appear here after admin approval.",
};
