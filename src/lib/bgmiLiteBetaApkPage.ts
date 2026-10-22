import type { ApkHeroButton, ApkHeroCountdown } from "@/src/lib/apkHeroCta";
import { BGMI_LITE_APK_PATH } from "@/src/lib/resolveNavForPath";
import {
  BGMI_LITE_APK_ARTICLE_HTML,
  BGMI_LITE_APK_FAQS,
} from "@/src/lib/bgmiLiteBetaApkArticle";
import {
  BGMI_LITE_BETA_FACTS,
  BGMI_LITE_BETA_PREREGISTER,
  type BgmiLiteBetaFactsBlock,
  type BgmiLiteBetaPreRegisterBlock,
} from "@/src/lib/bgmiLiteBetaApkSections";

export const BGMI_LITE_APK_PAGE_KEY = "bgmi-lite-apk";

export type BgmiLiteApkHeroButton = ApkHeroButton;
export type BgmiLiteApkCountdown = ApkHeroCountdown;

/** @deprecated Use BGMI_LITE_APK_PATH */
export const BGMI_LITE_BETA_APK_PATH = BGMI_LITE_APK_PATH;
/** @deprecated Use BGMI_LITE_APK_PAGE_KEY */
export const BGMI_LITE_BETA_APK_PAGE_KEY = BGMI_LITE_APK_PAGE_KEY;

export { BGMI_LITE_APK_PATH };

/** Site-tracked launch target (IST). Confirm on Google Play / Krafton. */
export const BGMI_LITE_LAUNCH_TARGET_ISO = "2026-11-12T00:00:00+05:30";

export type BgmiLiteBetaApkCard = {
  id: string;
  badge: string;
  icon: string;
  title: string;
  summary: string;
  points: string[];
  ctaLabel?: string;
  ctaHref?: string;
};

export type BgmiLiteBetaApkPageContent = {
  path: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  heroTitle: string;
  subtitleEn: string;
  pills: Array<{ label: string }>;
  heroButtons: {
    playStore: BgmiLiteApkHeroButton;
    apk: BgmiLiteApkHeroButton;
  };
  countdown: BgmiLiteApkCountdown;
  heroImage: string;
  heroImageAlt: string;
  cards: BgmiLiteBetaApkCard[];
  preRegister: BgmiLiteBetaPreRegisterBlock;
  facts: BgmiLiteBetaFactsBlock;
  articleHtml: string;
  faqs: Array<{ id: string; question: string; answer: string }>;
  faqTitle: string;
  commentsLead: string;
};

export const BGMI_LITE_APK_PAGE_SECTIONS = [
  { id: "seo", label: "SEO" },
  { id: "hero", label: "Hero" },
  { id: "heroButtons", label: "Hero buttons" },
  { id: "countdown", label: "Countdown" },
  { id: "cards", label: "Content cards" },
  { id: "preRegister", label: "Pre-register" },
  { id: "facts", label: "Facts table" },
  { id: "article", label: "Article" },
  { id: "faqs", label: "FAQs" },
] as const;

export type BgmiLiteApkPageSectionId = (typeof BGMI_LITE_APK_PAGE_SECTIONS)[number]["id"];

/**
 * Fan-made BGMI Air APK / pre-launch info page.
 * Does not host APKs or link to unofficial downloads.
 */
export const DEFAULT_BGMI_LITE_APK_PAGE: BgmiLiteBetaApkPageContent = {
  path: BGMI_LITE_APK_PATH,
  seoTitle: "BGMI Air APK & Launch Countdown",
  seoDescription:
    "BGMI Air APK guide with 12 November 2026 launch countdown, Google Play pre-registration tips, safety notes, and BGMI Air sensitivity help — we do not host APKs.",
  seoKeywords: [
    "BGMI Air APK",
    "BGMI Air launch date",
    "BGMI Air 12 November 2026",
    "BGMI Air pre-registration",
    "BGMI Air download",
    "BGMI Air countdown",
    "BGMI Air Google Play",
    "BGMI Air vs BGMI",
    "BGMI Air sensitivity",
  ],
  heroTitle: "BGMI Air APK",
  subtitleEn:
    "Fan-made info guide for Krafton’s lighter BGMI client for budget phones. Pre-registration and install happen on the official Google Play listing — this is an info page with a launch countdown, not a BGMI Air APK download hub.",
  pills: [
    { label: "Launch target: 12 Nov 2026" },
    { label: "Android · Google Play" },
    { label: "~1GB first download" },
  ],
  heroButtons: {
    playStore: {
      label: "Play Store",
      href: "",
      visible: true,
    },
    apk: {
      label: "APK",
      href: "",
      visible: false,
    },
  },
  countdown: {
    visible: true,
    label: "Countdown to BGMI Air launch (12 November 2026)",
    targetIso: BGMI_LITE_LAUNCH_TARGET_ISO,
    dateText:
      "BGMI Air launch date · 12 November 2026 — confirm on Google Play / Krafton India",
    liveMessage: "BGMI Air launch window reached — check Google Play for the official listing",
  },
  heroImage: "/bgmi/lite-beta-hero.png",
  heroImageAlt:
    "BGMI Air themed banner — lighter battle royale for budget Android phones",
  cards: [
    {
      id: "safe-download",
      badge: "Safety",
      icon: "fa-shield-halved",
      title: "No random APK mirrors",
      summary:
        "Krafton has not asked players to install BGMI Air from random websites. Stick to the official Play Store listing when it is available.",
      points: [
        "Verify the publisher is Krafton on Google Play",
        "Skip paid “BGMI Air APK” links — those are scams",
        "This site does not host or mirror install files",
      ],
    },
    {
      id: "what-we-know",
      badge: "Confirmed",
      icon: "fa-circle-info",
      title: "What is confirmed so far",
      summary:
        "Krafton India confirmed BGMI Air for India (end-of-2026 window) and Android pre-registration with an initial download around 1GB.",
      points: [
        "Built for budget / older Android phones",
        "Pre-registration via Google Play (Android)",
        "Exact features & min specs still pending from Krafton",
      ],
    },
    {
      id: "launch-window",
      badge: "Date",
      icon: "fa-calendar-day",
      title: "12 November 2026 countdown",
      summary:
        "This page counts down to 12 November 2026 (IST) so you can track launch day in one place. Confirm any official change on Play Store / Krafton.",
      points: [
        "Krafton window: end of 2026",
        "Site target date: 12 Nov 2026",
        "Retune sensi after the live client ships",
      ],
    },
    {
      id: "prereg",
      badge: "Play Store",
      icon: "fa-mobile-screen",
      title: "Pre-registration steps",
      summary:
        "Android players can pre-register on Google Play. No account transfer ritual is required beyond what Krafton documents on the listing.",
      points: [
        "Search BGMI Air on Google Play",
        "Tap Pre-register / enable auto-install if you want",
        "Wait for Krafton’s release — skip sideload APKs",
      ],
    },
    {
      id: "vs-full",
      badge: "Compare",
      icon: "fa-table",
      title: "BGMI Air vs full BGMI",
      summary:
        "BGMI Air is for entry phones; full BGMI suits stronger devices and higher FPS modes. Use the matching calculator on this site.",
      points: [
        "BGMI Air: smaller install, budget hardware focus",
        "Full BGMI: 60 / 90 / 120 FPS on stronger phones",
        "Don’t paste flagship codes into BGMI Air",
      ],
      ctaLabel: "Open full BGMI calculator",
      ctaHref: "/bgmi",
    },
    {
      id: "sensi-ready",
      badge: "Aim",
      icon: "fa-crosshairs",
      title: "Get BGMI Air sensitivity ready",
      summary:
        "When BGMI Air goes live, use our BGMI Air calculator for Camera, ADS, and Gyroscope baselines for 2GB–4GB / 30–60 FPS phones.",
      points: [
        "Don’t paste flagship 90/120 FPS full-BGMI codes",
        "Prefer Scope On gyro on entry phones",
        "Fine-tune ±5 in Training Ground after install",
      ],
      ctaLabel: "Open BGMI Air calculator",
      ctaHref: "/bgmi-air",
    },
  ],
  preRegister: {
    ...BGMI_LITE_BETA_PREREGISTER,
    steps: [...BGMI_LITE_BETA_PREREGISTER.steps],
  },
  facts: {
    ...BGMI_LITE_BETA_FACTS,
    rows: BGMI_LITE_BETA_FACTS.rows.map((row) => ({ ...row })),
  },
  articleHtml: BGMI_LITE_APK_ARTICLE_HTML,
  faqs: BGMI_LITE_APK_FAQS.map((item) => ({ ...item })),
  faqTitle: "BGMI Air APK FAQ",
  commentsLead:
    "Ask questions or share BGMI Air launch tips. Comments appear here after admin approval.",
};

/** @deprecated Use DEFAULT_BGMI_LITE_APK_PAGE */
export const DEFAULT_BGMI_LITE_BETA_APK_PAGE = DEFAULT_BGMI_LITE_APK_PAGE;
