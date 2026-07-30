/** Free Fire Advance Server landing page config. */

import type { FfAdvanceServerPageContent } from "@/src/lib/advanceServerPageTypes";

export const FREE_FIRE_ADVANCE_SERVER_PATH = "/free-fire-advance-server";
/** Stable key for page comments API / DB. */
export const FREE_FIRE_ADVANCE_SERVER_PAGE_KEY = "free-fire-advance-server";

/** Built-in Advance Server page copy — used until admin saves overrides. */
export const FF_ADVANCE_SERVER_PAGE: FfAdvanceServerPageContent = {
  path: FREE_FIRE_ADVANCE_SERVER_PATH,
  title: "Advance Server guide",
  heroTitle: "FF & FF Max ADVANCE SERVER",
  seoTitle: "FF & FF Max ADVANCE SERVER",
  seoDescription:
    "Fan-made Advance Server info guide for FF and FF Max players. Learn what the beta window is, how selection works, and what to do after it closes. We do not host APKs or issue access codes.",
  seoKeywords: [
    "Advance Server guide",
    "FF Advance Server info",
    "FF Max Advance Server",
    "OB55 Advance Server",
    "Advance Server FAQ",
    "beta test window",
  ],
  heroImageAlt: "Advance Server info banner for FF and FF Max players",
  subtitleEn:
    "Fan-made overview of the publisher beta window. Selection, installs, and access codes happen only on the publisher portal — this site is an info guide, not a download hub.",
  apkCta: "",
  officialUrl: "",
  heroImage: "/ff/advance-server-hero.jpg",
  /**
   * Hero layout switch:
   * - "split" = left text+CTA+timer, right image (current)
   * - "center" = pehle wala centered stack (revert yahan se)
   */
  heroLayout: "split" as "split" | "center",
  pills: [
    { label: "Version: OB55" },
    { label: "Platform: Android only" },
    { label: "Source: Publisher portal" },
  ],
  /** Hero countdown — estimated OB55 Advance Server open (IST). Update when the publisher announces. */
  countdown: {
    label: "Estimated next Advance Server window",
    targetIso: "2026-08-21T00:00:00+05:30",
    dateText: "Estimated window · 21 August 2026 — confirm on the publisher portal",
  },
  cards: [
    {
      id: "what-is",
      badge: "About",
      icon: "fa-circle-info",
      title: "What is Advance Server?",
      summary:
        "Advance Server is the publisher's early test build. Selected players try new weapons, characters, and map changes before the wider OB update.",
      points: [
        "Same idea every OB cycle — test first, release later",
        "Testers help spot bugs and send feedback to the publisher",
        "Separate beta app — live Free Fire / Max progress stays on the live game",
        "Android only; there is no iOS Advance Server build",
      ],
    },
    {
      id: "register-download",
      badge: "Register",
      icon: "fa-user-check",
      title: "Registration overview (publisher portal)",
      summary:
        "Signup happens on the publisher portal only. This page explains the usual flow — we do not run registration or pick testers.",
      points: [
        "Open the publisher’s Advance portal on your phone browser",
        "Use the Google or Facebook account linked to your live game ID",
        "Submit the registration form if signup is open",
        "Wait for selection — status shows on the publisher dashboard",
        "If selected, the publisher shows any access details there (not on this site)",
      ],
    },
    {
      id: "apk-steps",
      badge: "Install",
      icon: "fa-mobile-screen",
      title: "Install notes (Android beta)",
      summary:
        "The beta app is Android-only and comes from the publisher. This site does not host install files or mirrors.",
      points: [
        "Use a normal Android browser and open the publisher portal only",
        "After selection, follow the publisher’s own install steps",
        "Allow install prompts only for the browser you used on the publisher portal",
        "Enter any publisher-issued access details inside the beta app when asked",
        "If install is blocked, check storage space and that you are not on iOS",
      ],
    },
    {
      id: "safety",
      badge: "Safety",
      icon: "fa-shield-halved",
      title: "Stay safe while using Advance Server",
      summary:
        "Publisher beta access is free when offered. If someone asks you to pay for a code or install file, walk away — that is a scam.",
      points: [
        "Use only the publisher portal — never third-party sites",
        "Do not buy codes from Telegram, Instagram, or random sellers",
        "The beta app is separate; uninstalling it does not wipe your main account",
        "Ignore “mod” or “unlimited diamonds” links — they are unsafe",
      ],
    },
    {
      id: "ob55-facts",
      badge: "OB55",
      icon: "fa-bolt",
      title: "OB55 Advance Server — quick facts",
      summary:
        "OB55 follows the usual cycle: register early, wait for selection, test the beta, then the global update lands later.",
      points: [
        "Expected around the next OB window after OB54 (exact dates come from the publisher)",
        "Registration usually opens a few days before the beta window",
        "Server stays open for a limited window — often about 2 weeks",
        "After it closes, retune sensi when the live OB55 drops if aim feels different",
      ],
    },
    {
      id: "activation-code",
      badge: "Access",
      icon: "fa-key",
      title: "Publisher access / selection",
      summary:
        "Registering does not mean you get in. The publisher picks a limited number of players and shows access details on their dashboard — not here.",
      points: [
        "Log in again at the publisher portal with the same Google / Facebook account",
        "Open your Advance Server dashboard — access details appear there after selection",
        "Codes usually do not come by SMS or random email from other sites",
        "Use publisher details only inside the beta app",
        "If nothing shows yet, you are still waiting — selection is not guaranteed",
      ],
    },
    {
      id: "use-activation-code",
      badge: "Login",
      icon: "fa-right-to-bracket",
      title: "Using publisher access in the beta app",
      summary:
        "Once the publisher shows your access details, you enter them inside the beta app — this website cannot unlock Advance Server for you.",
      points: [
        "Install the beta app from the publisher portal first",
        "Open the app and choose Google or Facebook login",
        "When asked, paste only the details from your publisher dashboard",
        "Confirm and wait for login — do not share access details with anyone",
        "If login fails, check typos, account match, and that the beta window is still open",
      ],
    },
    {
      id: "check-open",
      badge: "Status",
      icon: "fa-clock",
      title: "Checking if the beta window is open",
      summary:
        "Advance Server is not always live. It opens for a short window each OB cycle — confirm status on the publisher portal.",
      points: [
        "Visit the publisher Advance portal for the real status",
        "Look for registration open / closed messaging on the dashboard",
        "If registration is closed and no install option shows, the window is not open",
        "Ignore random “server open today” posts unless the publisher confirms it",
        "When the window ends, wait for the next OB cycle — dates change every update",
      ],
    },
    {
      id: "problems-fixes",
      badge: "Fixes",
      icon: "fa-wrench",
      title: "Common Advance Server problems",
      summary:
        "Most issues are install, login, or selection problems. Avoid random third-party files while troubleshooting.",
      points: [
        "Install blocked — allow installs for your browser, free up storage, retry from the publisher portal only",
        "No access yet — you may not be selected; recheck the publisher dashboard later",
        "Login failed — use the same Google/Facebook account and retype carefully",
        "App crashes on open — update Android WebView/Chrome, clear cache, reinstall from the publisher",
        "Can’t install — the beta window may be closed; confirm status on the publisher portal",
        "iPhone users — there is no iOS Advance Server build; Android only",
      ],
    },
    {
      id: "pros-cons",
      badge: "Pros & Cons",
      icon: "fa-scale-balanced",
      title: "Pros and cons of Advance Server",
      summary:
        "Worth trying if you like early OB features — but it is still a limited beta, not the full live game.",
      points: [],
      pros: [
        "Try upcoming weapons and features before the global update",
        "Help the publisher find bugs and shape the next OB",
        "Live Free Fire / Max account progress stays on the live game",
        "Publisher beta — free when you are selected",
        "Good practice for new guns before they hit ranked",
      ],
      cons: [
        "Selection is limited — many players never get access",
        "Android only — no iOS Advance Server",
        "Beta can be buggy, laggy, or crash more than live FF",
        "Open only for a short window each OB cycle",
        "Separate install — uses extra storage on your phone",
      ],
    },
    {
      id: "after-testing",
      badge: "Next",
      icon: "fa-arrows-rotate",
      title: "After Advance Server closes",
      summary:
        "When the beta ends, the real OB update hits Free Fire and Free Fire Max. New weapons or balance changes can make old sensi feel wrong.",
      points: [
        "Uninstall the Advance Server app if you do not need it anymore",
        "Update live Free Fire / Max when the global OB drops",
        "Recalculate sensitivity if drag or scopes feel off after the patch",
        "Use our Free Fire or Free Fire Max calculator — don’t paste random pro codes",
      ],
      links: [
        { label: "Free Fire calculator", href: "/#ff-calculator" },
        {
          label: "Free Fire Max calculator",
          href: "/free-fire-max-sensitivity-settings-calculator#ff-calculator",
        },
      ],
    },
    {
      id: "features",
      badge: "Features",
      icon: "fa-star",
      title: "What players usually test",
      summary:
        "Advance Server is not a different game — it is an early look at the next OB, built for testing before the wider release.",
      points: [
        "Upcoming weapons, characters, and balance changes",
        "Limited-time beta events and modes still being fine-tuned",
        "Bug reports and feedback from the test build",
        "Optional publisher reward programs when they run them",
        "Live Free Fire / Max account stays separate from beta progress",
        "Android-only build from the publisher portal",
      ],
    },
  ],
  tables: [
    {
      id: "compare",
      badge: "Compare",
      icon: "fa-table",
      title: "Advance Server vs live game",
      summary: "Quick side-by-side so you know what changes in the beta app.",
      columns: ["Point", "Advance Server", "Free Fire / Max (live)"],
      rows: [
        ["Purpose", "Test upcoming OB features early", "Play the live global version"],
        ["Platform", "Android only", "Android & iOS"],
        ["Install source", "Publisher portal only", "Play Store / App Store / store"],
        ["Access", "Required after publisher selection", "Not needed"],
        ["Account progress", "Separate beta — live ID stays safe", "Your real rank & inventory"],
        ["Availability", "Limited window each OB cycle", "Always online"],
      ],
    },
    {
      id: "timeline",
      badge: "Timeline",
      icon: "fa-timeline",
      title: "Typical Advance Server timeline",
      summary: "Exact dates change every OB — this is the usual flow the publisher follows.",
      columns: ["Step", "What happens", "What you do"],
      rows: [
        ["1. Register", "Signup opens on the publisher portal", "Log in with Google / Facebook"],
        ["2. Selection", "The publisher picks testers", "Check publisher dashboard"],
        ["3. Install", "Beta build unlocked for selected players", "Install from the publisher portal only"],
        ["4. Play beta", "Server open ~1–2 weeks", "Test features & report bugs"],
        ["5. Server closes", "Advance season ends", "Uninstall beta if you want"],
        ["6. Global OB", "Update hits live Free Fire / Max", "Retune sensi if aim feels off"],
      ],
    },
    {
      id: "quick-facts",
      badge: "Facts",
      icon: "fa-list-check",
      title: "Advance Server quick facts",
      summary: "One-screen checklist before you register or install anything.",
      columns: ["Detail", "Info"],
      rows: [
        ["Version focus", "OB55 Advance Server cycle"],
        ["Platform", "Android only (no iOS build)"],
        ["Publisher source", "Publisher Advance portal only"],
        ["Access", "Required after publisher selection"],
        ["Live game ID", "Safe — beta is a separate app"],
        ["Cost", "Free — never pay for codes or install files"],
        ["We host files?", "No — this site is an info guide only"],
      ],
    },
  ],
  faqs: [
    {
      id: "as-faq-1",
      question: "What is Advance Server?",
      answer:
        "It is the publisher beta for testing upcoming OB features before the wider Free Fire / Free Fire Max update. Selected players get early access on Android.",
    },
    {
      id: "as-faq-2",
      question: "Is Advance Server free?",
      answer:
        "Yes. Publisher registration and the beta app are free when offered. Never pay anyone for an access code or install file.",
    },
    {
      id: "as-faq-3",
      question: "Does this site host the Advance Server app?",
      answer:
        "No. We only publish an info guide. Install files come from the publisher portal after selection — not from Telegram, random websites, or “mod” links.",
    },
    {
      id: "as-faq-4",
      question: "Who issues Advance Server access codes?",
      answer:
        "Only the publisher, after selection, on their Advance Server dashboard. This website does not generate, sell, or email codes.",
    },
    {
      id: "as-faq-5",
      question: "Does Advance Server work on iPhone?",
      answer:
        "No. The Advance Server app is Android only. There is no iOS Advance Server build.",
    },
    {
      id: "as-faq-6",
      question: "Will my main Free Fire account get banned or wiped?",
      answer:
        "Advance Server is a separate beta app. Your live Free Fire / Max rank and inventory stay on the live game. Still use only the publisher portal.",
    },
    {
      id: "as-faq-7",
      question: "Why wasn’t I selected?",
      answer:
        "The publisher only picks a limited number of testers each cycle. Registering does not guarantee access. Try again when the next registration window opens.",
    },
    {
      id: "as-faq-8",
      question: "What should I do after Advance Server closes?",
      answer:
        "Uninstall the beta if you want, update live Free Fire or Free Fire Max when the OB drops, and recalculate sensitivity if aim feels different.",
    },
  ],
};

export function getDefaultAdvanceServerPage(): FfAdvanceServerPageContent {
  return structuredClone(FF_ADVANCE_SERVER_PAGE);
}
