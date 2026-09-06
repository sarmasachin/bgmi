import { PUBG_APK_PATH } from "@/src/lib/resolveNavForPath";
import { PUBG_APK_ARTICLE_HTML, PUBG_APK_FAQS } from "@/src/lib/pubgApkArticle";
import {
  PUBG_APK_FACTS,
  PUBG_APK_INSTALL,
  type PubgApkFactsBlock,
  type PubgApkInstallBlock,
} from "@/src/lib/pubgApkSections";

export const PUBG_APK_PAGE_KEY = "pubg-apk";
export { PUBG_APK_PATH };

export const PUBG_PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.tencent.ig";

export type PubgApkHeroButton = {
  label: string;
  href: string;
  visible: boolean;
};

export type PubgApkCountdown = {
  visible: boolean;
  label: string;
  targetIso: string;
  dateText: string;
  liveMessage: string;
};

export type PubgApkCard = {
  id: string;
  badge: string;
  icon: string;
  title: string;
  summary: string;
  points: string[];
  ctaLabel?: string;
  ctaHref?: string;
};

export type PubgApkPageContent = {
  path: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  heroTitle: string;
  subtitleEn: string;
  pills: Array<{ label: string }>;
  heroButtons: {
    playStore: PubgApkHeroButton;
    apk: PubgApkHeroButton;
  };
  countdown: PubgApkCountdown;
  heroImage: string;
  heroImageAlt: string;
  cards: PubgApkCard[];
  preRegister: PubgApkInstallBlock;
  facts: PubgApkFactsBlock;
  articleHtml: string;
  faqs: Array<{ id: string; question: string; answer: string }>;
  faqTitle: string;
  commentsLead: string;
};

export const PUBG_APK_PAGE_SECTIONS = [
  { id: "seo", label: "SEO" },
  { id: "hero", label: "Hero" },
  { id: "heroButtons", label: "Hero buttons" },
  { id: "countdown", label: "Update countdown" },
  { id: "cards", label: "Content cards" },
  { id: "preRegister", label: "Install steps" },
  { id: "facts", label: "Facts table" },
  { id: "article", label: "Article" },
  { id: "faqs", label: "FAQs" },
] as const;

export type PubgApkPageSectionId = (typeof PUBG_APK_PAGE_SECTIONS)[number]["id"];

export const DEFAULT_PUBG_APK_PAGE: PubgApkPageContent = {
  path: PUBG_APK_PATH,
  seoTitle: "PUBG Mobile APK & Play Store Download Guide",
  seoDescription:
    "PUBG Mobile APK and Play Store guide: official Google Play install, optional APK button, safety notes, and full PUBG Mobile details — we do not host APK files.",
  seoKeywords: [
    "PUBG Mobile APK",
    "PUBG Mobile Play Store",
    "PUBG Mobile download",
    "PUBG APK",
    "PUBG Mobile official download",
    "PUBG Mobile Krafton",
    "PUBG Mobile vs PUBG Lite",
    "PUBG Mobile sensitivity",
  ],
  heroTitle: "PUBG Mobile APK",
  subtitleEn:
    "Fan-made info page for full PUBG Mobile. Use Play Store for the official listing. The APK button can be shown or hidden by admin — this site does not host APK files.",
  pills: [
    { label: "Android · Google Play" },
    { label: "Global PUBG Mobile (not BGMI)" },
    { label: "Full client (not Lite)" },
  ],
  heroButtons: {
    playStore: {
      label: "Play Store",
      href: PUBG_PLAY_STORE_URL,
      visible: true,
    },
    apk: {
      label: "APK",
      href: "",
      visible: true,
    },
  },
  countdown: {
    visible: false,
    label: "Countdown to next PUBG Mobile update",
    targetIso: "",
    dateText: "Set the official update date in admin — confirm on Google Play",
    liveMessage: "Update window reached — check Play Store for the latest PUBG Mobile version",
  },
  heroImage: "",
  heroImageAlt: "PUBG Mobile download guide — Play Store and APK options",
  cards: [
    {
      id: "play-store",
      badge: "Official",
      icon: "fa-store",
      title: "Install from Google Play",
      summary:
        "The Play Store button above opens the official PUBG Mobile listing. That is the safest way to install and keep the game updated.",
      points: [
        "Confirm the publisher name on the store page",
        "Play Protect and store updates stay on",
        "Admin can hide or change the Play Store button",
      ],
    },
    {
      id: "apk-button",
      badge: "APK",
      icon: "fa-download",
      title: "APK button (admin-controlled)",
      summary:
        "The APK button appears only when admin turns it on and pastes a URL. We do not host the file on this website.",
      points: [
        "Show / hide and URL are all editable in admin",
        "Skip paid “mod APK” and random mirror sites",
        "Empty URL = button stays off on the public page",
      ],
    },
    {
      id: "safe-download",
      badge: "Safety",
      icon: "fa-shield-halved",
      title: "No random APK mirrors",
      summary:
        "Fake PUBG APK pages often ask for OTP, WhatsApp, or payment. Stick to Play Store or the single APK link this page shows when enabled.",
      points: [
        "Never pay for a “PUBG APK unlock”",
        "Ignore DMs that send APK files",
        "This site does not host or mirror install files",
      ],
    },
    {
      id: "vs-lite",
      badge: "Compare",
      icon: "fa-table",
      title: "Full PUBG Mobile vs Lite",
      summary:
        "This page is for full PUBG Mobile. Lite is a separate lighter client for budget phones, with its own Play listing and calculator.",
      points: [
        "Full PUBG Mobile: stronger phones, higher FPS modes",
        "Lite: smaller install, entry-level hardware",
        "Don’t mix Lite and full PUBG Mobile sensitivity codes",
      ],
      ctaLabel: "Open PUBG Lite APK page",
      ctaHref: "/pubg-mobile-lite-apk",
    },
    {
      id: "device",
      badge: "Device",
      icon: "fa-mobile-screen",
      title: "What you need to play",
      summary:
        "PUBG Mobile needs a capable Android phone, storage for the download, and a stable FPS before you copy sensitivity codes.",
      points: [
        "Use Smooth + lowest graphics if FPS drops",
        "Close background apps before ranked",
        "Retune sensi after a big game update",
      ],
    },
    {
      id: "sensi-ready",
      badge: "Aim",
      icon: "fa-crosshairs",
      title: "PUBG Mobile sensitivity after install",
      summary:
        "Once PUBG Mobile is installed, use our PUBG calculator for Camera, ADS, and Gyroscope baselines matched to RAM and FPS.",
      points: [
        "Pick your device RAM and target FPS first",
        "Prefer Scope On gyro if the camera drifts",
        "Fine-tune ±5 in Training Ground",
      ],
      ctaLabel: "Open PUBG Mobile calculator",
      ctaHref: "/pubg",
    },
  ],
  preRegister: {
    ...PUBG_APK_INSTALL,
    steps: [...PUBG_APK_INSTALL.steps],
  },
  facts: {
    ...PUBG_APK_FACTS,
    rows: PUBG_APK_FACTS.rows.map((row) => ({ ...row })),
  },
  articleHtml: PUBG_APK_ARTICLE_HTML,
  faqs: PUBG_APK_FAQS.map((item) => ({ ...item })),
  faqTitle: "PUBG Mobile APK FAQ",
  commentsLead:
    "Ask questions about PUBG Mobile Play Store or APK install. Comments appear here after admin approval.",
};
