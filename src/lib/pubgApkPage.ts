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

/** Public page shows a hero CTA only when Show is on, label and URL are both set. */
export function isPubgApkHeroButtonPublic(btn: PubgApkHeroButton): boolean {
  return btn.visible && Boolean(btn.label.trim()) && Boolean(btn.href.trim());
}

/** True while admin timer is on and the target time is still in the future. */
export function isPubgApkCountdownTicking(
  countdown: Pick<PubgApkCountdown, "visible" | "targetIso">,
  nowMs: number = Date.now(),
): boolean {
  if (!countdown.visible) return false;
  const target = countdown.targetIso.trim();
  if (!target) return false;
  const targetMs = Date.parse(target);
  return Number.isFinite(targetMs) && targetMs > nowMs;
}

/** Only real image paths/URLs — rejects title text pasted into the URL field by mistake. */
export function isUsablePubgHeroImageSrc(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  return (
    v.startsWith("/") ||
    /^https?:\/\//i.test(v) ||
    v.startsWith("data:image/")
  );
}

/** Admin hint: why a button will / will not appear on /pubg-apk. */
export function pubgApkHeroButtonPublicStatus(
  btn: PubgApkHeroButton,
  countdown?: Pick<PubgApkCountdown, "visible" | "targetIso">,
): {
  visible: boolean;
  message: string;
} {
  if (!btn.visible) {
    return { visible: false, message: "Public: HIDDEN — Show is off" };
  }
  if (!btn.label.trim()) {
    return { visible: false, message: "Public: HIDDEN — label is empty" };
  }
  if (!btn.href.trim()) {
    return {
      visible: false,
      message: "Public: HIDDEN — paste URL below (Show alone is not enough)",
    };
  }
  if (countdown && isPubgApkCountdownTicking(countdown)) {
    return {
      visible: false,
      message: "Public: HIDDEN while timer is counting — shows automatically when timer ends/off",
    };
  }
  return { visible: true, message: "Public: VISIBLE on /pubg-apk" };
}

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
      visible: false,
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
      id: "latest-update-features",
      badge: "Update",
      icon: "fa-rocket",
      title: "PUBG Mobile Latest Update Features & Patch Highlights",
      summary:
        "Quick look at what the newest PUBG Mobile patch usually brings — modes, balance tweaks, fixes — and what you should do right after updating.",
      points: [
        "Confirm the live version and full changelog on Google Play / Krafton",
        "New weapons, maps, or modes can change recoil — test in Training Ground",
        "After a big patch, retune Camera, ADS, and Gyroscope sensitivity",
        "If the game crashes post-update, clear cache or reinstall from Play Store",
      ],
      ctaLabel: "Open PUBG Mobile calculator",
      ctaHref: "/pubg",
    },
    {
      id: "common-errors-fixes",
      badge: "Fixes",
      icon: "fa-wrench",
      title: "Common Errors & Fixes (High-Intent Problem Solving)",
      summary:
        "Stuck on install, login, or update errors? Use these quick fixes before you try random APK sites or paid “repair” links.",
      points: [
        "App not installing / parse error — free storage, allow unknown apps only if you use APK, then retry from Play Store",
        "Update stuck or fails — clear Play Store cache, check network, restart phone, try Wi‑Fi",
        "Game crashes on open — update Android System WebView/Chrome, clear PUBG Mobile cache, reinstall if needed",
        "Login / ban / device limit — use official Krafton help; never share OTP or account password",
        "Black screen or low FPS — lower graphics to Smooth, close background apps, cool the device",
      ],
      ctaLabel: "Read PUBG Mobile APK guide",
      ctaHref: "#pubg-apk-guide",
    },
    {
      id: "obb-file-setup",
      badge: "OBB",
      icon: "fa-file-zipper",
      title: "OBB File Setup (Direct Search Intent)",
      summary:
        "Looking for PUBG Mobile OBB / data pack setup? Here’s where files go, how version matching works, and how to avoid fake OBB download traps.",
      points: [
        "Play Store installs usually fetch data packs for you — prefer that over random OBB links",
        "Sideload APK only with the matching OBB/version pair; mismatched packs cause black screen or stuck loading",
        "Typical path: Android/obb/com.tencent.ig/ — do not rename folders or mix Lite/full packs",
        "Need free storage for main + data; clear junk before a big update",
        "Never pay for “OBB unlock” files or OTP links — we do not host OBB/APK on this site",
      ],
      ctaLabel: "Read PUBG Mobile APK guide",
      ctaHref: "#pubg-apk-guide",
    },
    {
      id: "fps-graphics-unlock",
      badge: "FPS",
      icon: "fa-gauge-high",
      title: "90 FPS / Graphics Unlock Guide",
      summary:
        "Want 90 FPS or higher graphics on PUBG Mobile? Use device-supported in-game options first — skip fake “unlock config” APKs and paid GFX tools.",
      points: [
        "Open Settings → Graphics: pick Smooth/Balanced and the highest FPS your phone lists (60 / 90 / Extreme if available)",
        "90 FPS only appears on supported devices and game versions — Force / magisk “unlock” packs risk ban and crashes",
        "Heat or FPS drops? Lower style to Smooth, turn off shadows/anti-aliasing, close background apps, cool the phone",
        "After a big update, re-check graphics + retune sensi — higher FPS changes aim feel",
        "Never download “90 FPS unlocker”, GameGuardian scripts, or paid config files from random links",
      ],
      ctaLabel: "Open PUBG Mobile calculator",
      ctaHref: "/pubg",
    },
    {
      id: "ban-prevention-safety",
      badge: "Ban",
      icon: "fa-user-shield",
      title: "Ban Prevention & Account Safety Rules",
      summary:
        "Keep your PUBG Mobile account safe — follow these ban-prevention rules and skip shady APKs, mods, and account-sharing traps.",
      points: [
        "Play only official PUBG Mobile (Play Store or the single admin APK link on this page) — mod / hack / aimbot clients = high ban risk",
        "Never share OTP, password, or Krafton ID with “recovery” or “unban” sellers on WhatsApp/Telegram",
        "Don’t use VPN spoof regions, emulator farms, or multi-login tools that break Krafton device rules",
        "Avoid paid “UC generator”, guest-to-main converters, and config unlock packs — they steal accounts",
        "If you get a device limit or ban notice, use official Krafton support only; we do not sell unban services",
      ],
      ctaLabel: "Read PUBG Mobile APK guide",
      ctaHref: "#pubg-apk-guide",
    },
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
