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

/** Public page shows a hero CTA only when Show is on, label and URL are both set. */
export function isBgmiApkHeroButtonPublic(btn: BgmiApkHeroButton): boolean {
  return btn.visible && Boolean(btn.label.trim()) && Boolean(btn.href.trim());
}

/** True while admin timer is on and the target time is still in the future. */
export function isBgmiApkCountdownTicking(
  countdown: Pick<BgmiApkCountdown, "visible" | "targetIso">,
  nowMs: number = Date.now(),
): boolean {
  if (!countdown.visible) return false;
  const target = countdown.targetIso.trim();
  if (!target) return false;
  const targetMs = Date.parse(target);
  return Number.isFinite(targetMs) && targetMs > nowMs;
}

/** Only real image paths/URLs — rejects title text pasted into the URL field by mistake. */
export function isUsableHeroImageSrc(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  return (
    v.startsWith("/") ||
    /^https?:\/\//i.test(v) ||
    v.startsWith("data:image/")
  );
}

/** Admin hint: why a button will / will not appear on /bgmi-apk. */
export function bgmiApkHeroButtonPublicStatus(
  btn: BgmiApkHeroButton,
  countdown?: Pick<BgmiApkCountdown, "visible" | "targetIso">,
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
  if (countdown && isBgmiApkCountdownTicking(countdown)) {
    return {
      visible: false,
      message: "Public: HIDDEN while timer is counting — shows automatically when timer ends/off",
    };
  }
  return { visible: true, message: "Public: VISIBLE on /bgmi-apk" };
}

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
    "BGMI vs BGMI Air",
    "BGMI sensitivity",
  ],
  heroTitle: "BGMI APK",
  subtitleEn:
    "Fan-made info page for full Battlegrounds Mobile India. Use Play Store for the official Krafton listing. The APK button can be shown or hidden by admin — this site does not host APK files.",
  pills: [
    { label: "Android · Google Play" },
    { label: "Publisher: Krafton" },
    { label: "Full BGMI (not BGMI Air)" },
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
      // Off until admin pastes a URL — avoids “Show on” but button missing on public page.
      visible: false,
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
      id: "latest-update-features",
      badge: "Update",
      icon: "fa-rocket",
      title: "BGMI Latest Update Features & Patch Highlights",
      summary:
        "Quick look at what the newest BGMI patch usually brings — modes, balance tweaks, fixes — and what you should do right after updating.",
      points: [
        "Confirm the live version and full changelog on Google Play / Krafton",
        "New weapons, maps, or modes can change recoil — test in Training Ground",
        "After a big patch, retune Camera, ADS, and Gyroscope sensitivity",
        "If the game crashes post-update, clear cache or reinstall from Play Store",
      ],
      ctaLabel: "Open BGMI sensitivity calculator",
      ctaHref: "/bgmi",
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
        "Game crashes on open — update Android System WebView/Chrome, clear BGMI cache, reinstall if needed",
        "Login / ban / device limit — use official Krafton help; never share OTP or account password",
        "Black screen or low FPS — lower graphics to Smooth, close background apps, cool the device",
      ],
      ctaLabel: "Read BGMI APK guide",
      ctaHref: "#bgmi-apk-guide",
    },
    {
      id: "obb-file-setup",
      badge: "OBB",
      icon: "fa-file-zipper",
      title: "OBB File Setup (Direct Search Intent)",
      summary:
        "Looking for BGMI OBB / data pack setup? Here’s where files go, how version matching works, and how to avoid fake OBB download traps.",
      points: [
        "Play Store installs usually fetch data packs for you — prefer that over random OBB links",
        "Sideload APK only with the matching OBB/version pair; mismatched packs cause black screen or stuck loading",
        "Typical path: Android/obb/com.pubg.imobile/ — do not rename folders or mix BGMI Air/full packs",
        "Need free storage for main + data; clear junk before a big update",
        "Never pay for “OBB unlock” files or OTP links — we do not host OBB/APK on this site",
      ],
      ctaLabel: "Read BGMI APK guide",
      ctaHref: "#bgmi-apk-guide",
    },
    {
      id: "fps-graphics-unlock",
      badge: "FPS",
      icon: "fa-gauge-high",
      title: "90 FPS / Graphics Unlock Guide",
      summary:
        "Want 90 FPS or higher graphics on BGMI? Use device-supported in-game options first — skip fake “unlock config” APKs and paid GFX tools.",
      points: [
        "Open Settings → Graphics: pick Smooth/Balanced and the highest FPS your phone lists (60 / 90 / Extreme if available)",
        "90 FPS only appears on supported devices and game versions — Force / magisk “unlock” packs risk ban and crashes",
        "Heat or FPS drops? Lower style to Smooth, turn off shadows/anti-aliasing, close background apps, cool the phone",
        "After a big update, re-check graphics + retune sensi — higher FPS changes aim feel",
        "Never download “90 FPS unlocker”, GameGuardian scripts, or paid config files from random links",
      ],
      ctaLabel: "Open BGMI calculator",
      ctaHref: "/bgmi",
    },
    {
      id: "ban-prevention-safety",
      badge: "Ban",
      icon: "fa-user-shield",
      title: "Ban Prevention & Account Safety Rules",
      summary:
        "Keep your BGMI account safe — follow these ban-prevention rules and skip shady APKs, mods, and account-sharing traps.",
      points: [
        "Play only official BGMI (Play Store or the single admin APK link on this page) — mod / hack / aimbot clients = high ban risk",
        "Never share OTP, password, or Krafton ID with “recovery” or “unban” sellers on WhatsApp/Telegram",
        "Don’t use VPN spoof regions, emulator farms, or multi-login tools that break Krafton device rules",
        "Avoid paid “UC / RP generator”, guest-to-main converters, and config unlock packs — they steal accounts",
        "If you get a device limit or ban notice, use official Krafton support only; we do not sell unban services",
      ],
      ctaLabel: "Read BGMI APK guide",
      ctaHref: "#bgmi-apk-guide",
    },
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
      id: "vs-lite",
      badge: "Compare",
      icon: "fa-table",
      title: "Full BGMI vs BGMI Air",
      summary:
        "This page is for full BGMI. BGMI Air is a separate lighter client for budget phones, with its own Play listing and calculator.",
      points: [
        "Full BGMI: stronger phones, higher FPS modes",
        "BGMI Air: smaller install, entry-level hardware",
        "Don’t mix BGMI Air and full BGMI sensitivity codes",
      ],
      ctaLabel: "Open BGMI Air APK page",
      ctaHref: "/bgmi-lite-apk",
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
