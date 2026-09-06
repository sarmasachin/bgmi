import { BGMI_APK_PATH } from "@/src/lib/resolveNavForPath";
import { BGMI_APK_ARTICLE_HTML, BGMI_APK_FAQS } from "@/src/lib/bgmiApkArticle";
import {
  BGMI_APK_FACTS,
  BGMI_APK_INSTALL,
  type BgmiApkFactsBlock,
  type BgmiApkInstallBlock,
} from "@/src/lib/bgmiApkSections";

export const BGMI_APK_PAGE_KEY = "bgmi-apk";
export { BGMI_APK_PATH };

export const BGMI_PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.pubg.imobile";

export type BgmiApkHeroButton = {
  label: string;
  href: string;
  visible: boolean;
};

export type BgmiApkCountdown = {
  visible: boolean;
  label: string;
  targetIso: string;
  dateText: string;
  liveMessage: string;
};

export type BgmiApkCard = {
  id: string;
  badge: string;
  icon: string;
  title: string;
  summary: string;
  points: string[];
  ctaLabel?: string;
  ctaHref?: string;
};

export type BgmiApkPageContent = {
  path: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  heroTitle: string;
  subtitleEn: string;
  pills: Array<{ label: string }>;
  heroButtons: {
    playStore: BgmiApkHeroButton;
    apk: BgmiApkHeroButton;
  };
  countdown: BgmiApkCountdown;
  heroImage: string;
  heroImageAlt: string;
  cards: BgmiApkCard[];
  preRegister: BgmiApkInstallBlock;
  facts: BgmiApkFactsBlock;
  articleHtml: string;
  faqs: Array<{ id: string; question: string; answer: string }>;
  faqTitle: string;
  commentsLead: string;
};

export const BGMI_APK_PAGE_SECTIONS = [
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

export type BgmiApkPageSectionId = (typeof BGMI_APK_PAGE_SECTIONS)[number]["id"];

export const DEFAULT_BGMI_APK_PAGE: BgmiApkPageContent = {
  path: BGMI_APK_PATH,
  seoTitle: "BGMI APK & Play Store Download Guide",
  seoDescription:
    "BGMI APK and Play Store guide: official Google Play install, optional APK button, safety notes, and full BGMI details — we do not host APK files.",
  seoKeywords: [
    "BGMI APK",
    "BGMI Play Store",
    "BGMI download",
    "Battlegrounds Mobile India APK",
    "BGMI official download",
    "BGMI Krafton",
    "BGMI vs BGMI Lite",
    "BGMI sensitivity",
  ],
  heroTitle: "BGMI APK",
  subtitleEn:
    "Fan-made info page for full Battlegrounds Mobile India. Use Play Store for the official Krafton listing. The APK button can be shown or hidden by admin — this site does not host APK files.",
  pills: [
    { label: "Android · Google Play" },
    { label: "Publisher: Krafton" },
    { label: "Full BGMI (not Lite)" },
  ],
  heroButtons: {
    playStore: {
      label: "Play Store",
      href: BGMI_PLAY_STORE_URL,
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
    label: "Countdown to next BGMI update",
    targetIso: "",
    dateText: "Set the official update date in admin — confirm on Google Play / Krafton",
    liveMessage: "Update window reached — check Play Store for the latest BGMI version",
  },
  heroImage: "",
  heroImageAlt: "BGMI download guide — Play Store and APK options",
  cards: [
    {
      id: "play-store",
      badge: "Official",
      icon: "fa-store",
      title: "Install from Google Play",
      summary:
        "The Play Store button above opens Krafton’s BGMI listing. That is the safest way to install and keep the game updated.",
      points: [
        "Confirm publisher: KRAFTON, Inc.",
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
        "Fake BGMI APK pages often ask for OTP, WhatsApp, or payment. Stick to Play Store or the single APK link this page shows when enabled.",
      points: [
        "Never pay for a “BGMI APK unlock”",
        "Ignore DMs that send APK files",
        "This site does not host or mirror install files",
      ],
    },
    {
      id: "vs-lite",
      badge: "Compare",
      icon: "fa-table",
      title: "Full BGMI vs BGMI Lite",
      summary:
        "This page is for full BGMI. Lite is a separate lighter client for budget phones, with its own Play listing and calculator.",
      points: [
        "Full BGMI: stronger phones, higher FPS modes",
        "Lite: smaller install, entry-level hardware",
        "Don’t mix Lite and full BGMI sensitivity codes",
      ],
      ctaLabel: "Open BGMI Lite APK page",
      ctaHref: "/bgmi-lite-apk",
    },
    {
      id: "device",
      badge: "Device",
      icon: "fa-mobile-screen",
      title: "What you need to play",
      summary:
        "BGMI needs a capable Android phone, storage for the download, and a stable FPS before you copy sensitivity codes.",
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
      title: "BGMI sensitivity after install",
      summary:
        "Once BGMI is installed, use our full BGMI calculator for Camera, ADS, and Gyroscope baselines matched to RAM and FPS.",
      points: [
        "Pick your device RAM and target FPS first",
        "Prefer Scope On gyro if the camera drifts",
        "Fine-tune ±5 in Training Ground",
      ],
      ctaLabel: "Open BGMI calculator",
      ctaHref: "/bgmi",
    },
  ],
  preRegister: {
    ...BGMI_APK_INSTALL,
    steps: [...BGMI_APK_INSTALL.steps],
  },
  facts: {
    ...BGMI_APK_FACTS,
    rows: BGMI_APK_FACTS.rows.map((row) => ({ ...row })),
  },
  articleHtml: BGMI_APK_ARTICLE_HTML,
  faqs: BGMI_APK_FAQS.map((item) => ({ ...item })),
  faqTitle: "BGMI APK FAQ",
  commentsLead:
    "Ask questions about BGMI Play Store or APK install. Comments appear here after admin approval.",
};
