import { FREE_FIRE_MAX_APK_PATH } from "@/src/lib/resolveNavForPath";
import { FREE_FIRE_MAX_APK_ARTICLE_HTML, FREE_FIRE_MAX_APK_FAQS } from "@/src/lib/freeFireMaxApkArticle";
import {
  FREE_FIRE_MAX_APK_FACTS,
  FREE_FIRE_MAX_APK_INSTALL,
  type FreeFireMaxApkFactsBlock,
  type FreeFireMaxApkInstallBlock,
} from "@/src/lib/freeFireMaxApkSections";

export const FREE_FIRE_MAX_APK_PAGE_KEY = "free-fire-max-apk";
export { FREE_FIRE_MAX_APK_PATH };

export const FREE_FIRE_MAX_PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.dts.freefiremax";

export type FreeFireMaxApkHeroButton = {
  label: string;
  href: string;
  visible: boolean;
};

export type FreeFireMaxApkCountdown = {
  visible: boolean;
  label: string;
  targetIso: string;
  dateText: string;
  liveMessage: string;
};

/** Public page shows a hero CTA only when Show is on, label and URL are both set. */
export function isFreeFireMaxApkHeroButtonPublic(btn: FreeFireMaxApkHeroButton): boolean {
  return btn.visible && Boolean(btn.label.trim()) && Boolean(btn.href.trim());
}

/** True while admin timer is on and the target time is still in the future. */
export function isFreeFireMaxApkCountdownTicking(
  countdown: Pick<FreeFireMaxApkCountdown, "visible" | "targetIso">,
  nowMs: number = Date.now(),
): boolean {
  if (!countdown.visible) return false;
  const target = countdown.targetIso.trim();
  if (!target) return false;
  const targetMs = Date.parse(target);
  return Number.isFinite(targetMs) && targetMs > nowMs;
}

/** Only real image paths/URLs — rejects title text pasted into the URL field by mistake. */
export function isUsableFreeFireMaxHeroImageSrc(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  return (
    v.startsWith("/") ||
    /^https?:\/\//i.test(v) ||
    v.startsWith("data:image/")
  );
}

/** Admin hint: why a button will / will not appear on /free-fire-max-apk. */
export function freeFireMaxApkHeroButtonPublicStatus(
  btn: FreeFireMaxApkHeroButton,
  countdown?: Pick<FreeFireMaxApkCountdown, "visible" | "targetIso">,
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
  if (countdown && isFreeFireMaxApkCountdownTicking(countdown)) {
    return {
      visible: false,
      message: "Public: HIDDEN while timer is counting — shows automatically when timer ends/off",
    };
  }
  return { visible: true, message: "Public: VISIBLE on /free-fire-max-apk" };
}

export type FreeFireMaxApkCard = {
  id: string;
  badge: string;
  icon: string;
  title: string;
  summary: string;
  points: string[];
  ctaLabel?: string;
  ctaHref?: string;
};

export type FreeFireMaxApkPageContent = {
  path: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  heroTitle: string;
  subtitleEn: string;
  pills: Array<{ label: string }>;
  heroButtons: {
    playStore: FreeFireMaxApkHeroButton;
    apk: FreeFireMaxApkHeroButton;
  };
  countdown: FreeFireMaxApkCountdown;
  heroImage: string;
  heroImageAlt: string;
  cards: FreeFireMaxApkCard[];
  preRegister: FreeFireMaxApkInstallBlock;
  facts: FreeFireMaxApkFactsBlock;
  articleHtml: string;
  faqs: Array<{ id: string; question: string; answer: string }>;
  faqTitle: string;
  commentsLead: string;
};

export const FREE_FIRE_MAX_APK_PAGE_SECTIONS = [
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

export type FreeFireMaxApkPageSectionId = (typeof FREE_FIRE_MAX_APK_PAGE_SECTIONS)[number]["id"];

export const DEFAULT_FREE_FIRE_MAX_APK_PAGE: FreeFireMaxApkPageContent = {
  path: FREE_FIRE_MAX_APK_PATH,
  seoTitle: "Free Fire MAX APK & Play Store Download Guide",
  seoDescription:
    "Free Fire MAX APK and Play Store guide: official Google Play install, optional APK button, safety notes, and Free Fire MAX details — we do not host APK files.",
  seoKeywords: [
    "Free Fire MAX APK",
    "Free Fire MAX Play Store",
    "Free Fire MAX download",
    "FF Max Apk",
    "Free Fire MAX official download",
    "Free Fire MAX Garena",
    "Free Fire MAX vs Free Fire",
    "Free Fire MAX sensitivity",
  ],
  heroTitle: "Free Fire MAX APK",
  subtitleEn:
    "Fan-made info page for Free Fire MAX. Use Play Store for the official listing. The APK button can be shown or hidden by admin — this site does not host APK files.",
  pills: [
    { label: "Android · Google Play" },
    { label: "Official Garena Free Fire MAX" },
    { label: "Sensitivity calculator on this site" },
  ],
  heroButtons: {
    playStore: {
      label: "Play Store",
      href: FREE_FIRE_MAX_PLAY_STORE_URL,
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
    label: "Countdown to next Free Fire MAX update",
    targetIso: "",
    dateText: "Set the official update date in admin — confirm on Google Play",
    liveMessage: "Update window reached — check Play Store for the latest Free Fire MAX version",
  },
  heroImage: "",
  heroImageAlt: "Free Fire MAX download guide — Play Store and APK options",
  cards: [
    {
      id: "latest-update-features",
      badge: "Update",
      icon: "fa-rocket",
      title: "Free Fire MAX Latest Update Features & Patch Highlights",
      summary:
        "Quick look at what the newest Free Fire MAX patch usually brings — modes, balance tweaks, fixes — and what you should do right after updating.",
      points: [
        "Confirm the live version and full changelog on Google Play / Garena",
        "New weapons, maps, or modes can change recoil — test in training mode",
        "After a big patch, retune General, Red Dot, and scope sensitivity",
        "If the game crashes post-update, clear cache or reinstall from Play Store",
      ],
      ctaLabel: "Open Free Fire MAX calculator",
      ctaHref: "/free-fire-max-sensitivity-settings-calculator",
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
        "Game crashes on open — update Android System WebView/Chrome, clear Free Fire MAX cache, reinstall if needed",
        "Login / ban / device limit — use official Garena help; never share OTP or account password",
        "Black screen or low FPS — lower graphics to Smooth, close background apps, cool the device",
      ],
      ctaLabel: "Read Free Fire MAX APK guide",
      ctaHref: "#free-fire-max-apk-guide",
    },
    {
      id: "obb-file-setup",
      badge: "OBB",
      icon: "fa-file-zipper",
      title: "OBB File Setup (Direct Search Intent)",
      summary:
        "Looking for Free Fire MAX OBB / data pack setup? Here’s where files go, how version matching works, and how to avoid fake OBB download traps.",
      points: [
        "Play Store installs usually fetch data packs for you — prefer that over random OBB links",
        "Sideload APK only with the matching OBB/version pair; mismatched packs cause black screen or stuck loading",
        "Typical path: Android/obb/com.dts.freefiremax/ — do not rename the folder or mix standard Free Fire files into this pack",
        "Need free storage for main + data; clear junk before a big update",
        "Never pay for “OBB unlock” files or OTP links — we do not host OBB/APK on this site",
      ],
      ctaLabel: "Read Free Fire MAX APK guide",
      ctaHref: "#free-fire-max-apk-guide",
    },
    {
      id: "fps-graphics-unlock",
      badge: "FPS",
      icon: "fa-gauge-high",
      title: "90 FPS / Graphics Unlock Guide",
      summary:
        "Want 90 FPS or higher graphics on Free Fire MAX? Use device-supported in-game options first — skip fake “unlock config” APKs and paid GFX tools.",
      points: [
        "Open Settings → Graphics: pick Smooth/Balanced and the highest FPS your phone lists (60 / 90 / Extreme if available)",
        "90 FPS only appears on supported devices and game versions — Force / magisk “unlock” packs risk ban and crashes",
        "Heat or FPS drops? Lower style to Smooth, turn off shadows/anti-aliasing, close background apps, cool the phone",
        "After a big update, re-check graphics + retune sensi — higher FPS changes aim feel",
        "Never download “90 FPS unlocker”, GameGuardian scripts, or paid config files from random links",
      ],
      ctaLabel: "Open Free Fire MAX calculator",
      ctaHref: "/free-fire-max-sensitivity-settings-calculator",
    },
    {
      id: "ban-prevention-safety",
      badge: "Ban",
      icon: "fa-user-shield",
      title: "Ban Prevention & Account Safety Rules",
      summary:
        "Keep your Free Fire MAX account safe — follow these ban-prevention rules and skip shady APKs, mods, and account-sharing traps.",
      points: [
        "Play only official Free Fire MAX (Play Store or the single admin APK link on this page) — mod / hack / aimbot clients = high ban risk",
        "Never share OTP, password, or Garena ID with “recovery” or “unban” sellers on WhatsApp/Telegram",
        "Don’t use VPN spoof regions, emulator farms, or multi-login tools that break Garena device rules",
        "Avoid paid “diamond generator”, guest-to-main converters, and config unlock packs — they steal accounts",
        "If you get a device limit or ban notice, use official Garena support only; we do not sell unban services",
      ],
      ctaLabel: "Read Free Fire MAX APK guide",
      ctaHref: "#free-fire-max-apk-guide",
    },
    {
      id: "play-store",
      badge: "Official",
      icon: "fa-store",
      title: "Install from Google Play",
      summary:
        "The Play Store button above opens the official Free Fire MAX listing. That is the safest way to install and keep the game updated.",
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
        "Fake FF Max Apk pages often ask for OTP, WhatsApp, or payment. Stick to Play Store or the single APK link this page shows when enabled.",
      points: [
        "Never pay for a “FF Max Apk unlock”",
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
        "Free Fire MAX needs a capable Android phone, storage for the download, and a stable FPS before you copy sensitivity codes.",
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
      title: "Free Fire MAX vs Free Fire",
      summary:
        "This page is for Free Fire MAX. Standard Free Fire is the lighter client with its own calculator on this site.",
      points: [
        "Free Fire MAX: higher graphics, heavier on the phone",
        "Free Fire: the standard client, separate sensitivity",
        "Don’t paste standard Free Fire codes into Free Fire MAX",
      ],
      ctaLabel: "Open Free Fire calculator",
      ctaHref: "/",
    },
    {
      id: "sensi-ready",
      badge: "Aim",
      icon: "fa-crosshairs",
      title: "Free Fire MAX sensitivity after install",
      summary:
        "Once Free Fire MAX is installed, use our Free Fire MAX calculator for General, Red Dot, and scope baselines matched to RAM and FPS.",
      points: [
        "Pick your device RAM and target FPS first",
        "Lower Red Dot a little if the aim feels too fast",
        "Fine-tune ±5 in training mode",
      ],
      ctaLabel: "Open Free Fire MAX calculator",
      ctaHref: "/free-fire-max-sensitivity-settings-calculator",
    },
  ],
  preRegister: {
    ...FREE_FIRE_MAX_APK_INSTALL,
    steps: [...FREE_FIRE_MAX_APK_INSTALL.steps],
  },
  facts: {
    ...FREE_FIRE_MAX_APK_FACTS,
    rows: FREE_FIRE_MAX_APK_FACTS.rows.map((row) => ({ ...row })),
  },
  articleHtml: FREE_FIRE_MAX_APK_ARTICLE_HTML,
  faqs: FREE_FIRE_MAX_APK_FAQS.map((item) => ({ ...item })),
  faqTitle: "Free Fire MAX APK FAQ",
  commentsLead:
    "Ask questions about Free Fire MAX Play Store or APK install. Comments appear here after admin approval.",
};
