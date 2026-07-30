/** Free Fire Advance Server landing page config. */

import type { FfAdvanceServerPageContent } from "@/src/lib/advanceServerPageTypes";

export const FREE_FIRE_ADVANCE_SERVER_PATH = "/free-fire-advance-server";
/** Stable key for page comments API / DB. */
export const FREE_FIRE_ADVANCE_SERVER_PAGE_KEY = "free-fire-advance-server";

/** Built-in Advance Server page copy — used until admin saves overrides. */
export const FF_ADVANCE_SERVER_PAGE: FfAdvanceServerPageContent = {
  path: FREE_FIRE_ADVANCE_SERVER_PATH,
  title: "Free Fire Advance Server",
  heroTitle: "FF & FF Max ADVANCE SERVER",
  seoTitle: "FF & FF Max ADVANCE SERVER",
  seoDescription:
    "Free Fire Advance Server OB55 Download APK: FF Advance server Register, Download OB55 APK Update, and Get Activation Code. OB55 APK Download available — free fire advance server download apk new version & FF advance server update apk.",
  seoKeywords: [
    "FF Advance server Register",
    "Get advance server activation code",
    "OB55 APK Download available",
    "Free Fire Advance Server download",
    "FF advance server download",
    "free fire advance server download apk new version",
    "free fire advance server update apk",
    "Free Fire Advance Server OB55",
    "FF OB55 Update APK",
  ],
  heroImageAlt:
    "Free Fire Advance Server OB55 APK download — FF advance server update banner",
  subtitleEn:
    "Advance Server lets selected players try upcoming OB features early, find bugs, and give feedback before the global update. Register, download OB55 APK, and get your activation code from the publisher site.",
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
    label: "Next OB55 Update Free Fire Advance Server Open",
    targetIso: "2026-08-21T00:00:00+05:30",
    dateText: "Estimated: Free Fire Next OB55 Update Release · 21 August 2026",
  },
  cards: [
    {
      id: "what-is",
      badge: "About",
      icon: "fa-circle-info",
      title: "What is Free Fire Advance Server?",
      summary:
        "Advance Server is the publisher's early test build. Selected players try new weapons, characters, and map changes before everyone else gets the OB update.",
      points: [
        "Same idea every OB cycle — test first, release later",
        "You help spot bugs and send feedback to the publisher",
        "Separate beta app — your main Free Fire / Max progress stays safe",
        "Android only; there is no iOS Advance Server APK",
      ],
    },
    {
      id: "register-download",
      badge: "Register",
      icon: "fa-user-check",
      title: "How to Register for Free Fire Advance Server",
      summary:
        "Registration happens on the publisher portal only. Log in, submit your form, then wait — selection is not guaranteed.",
      points: [
        "Open the Free Fire Advance portal on your phone browser",
        "Log in with the Google or Facebook account linked to your Free Fire ID",
        "Fill the registration form and submit it",
        "Wait for selection — check the Advance Server dashboard for your status",
        "If selected, copy your activation code before downloading the APK",
      ],
    },
    {
      id: "apk-steps",
      badge: "Install",
      icon: "fa-mobile-screen",
      title: "How to Download and Install Free Fire Advance Server APK",
      summary:
        "Advance Server APK is Android-only and comes from the publisher. Follow these steps so the install does not fail on first open.",
      points: [
        "Use Chrome/Firefox on your Android phone — open the Free Fire Advance portal",
        "After selection, tap Download APK on the publisher portal (never a third-party mirror)",
        "Allow “Install unknown apps” for your browser if Android asks",
        "Install the APK, open it, then enter your activation code when prompted",
        "If install is blocked, check storage space and that you are not on iOS",
      ],
    },
    {
      id: "safety",
      badge: "Safety",
      icon: "fa-shield-halved",
      title: "Stay safe while using Advance Server",
      summary:
        "Advance Server is free from the publisher. If someone asks you to pay for a code or APK, walk away — that is a scam.",
      points: [
        "Download only from the Free Fire Advance portal — never third-party sites",
        "Do not buy activation codes from Telegram, Instagram, or random sellers",
        "The beta app is separate; uninstalling it does not wipe your main account",
        "Ignore “mod APK” or “unlimited diamonds” links — they are unsafe",
      ],
    },
    {
      id: "ob55-facts",
      badge: "OB55",
      icon: "fa-bolt",
      title: "OB55 Advance Server — quick facts",
      summary:
        "OB55 follows the usual cycle: register early, wait for selection, test the beta, then the global update lands for everyone later.",
      points: [
        "Expected around the next OB window after OB54 (exact dates come from the publisher)",
        "Registration usually opens a few days before the Advance Server goes live",
        "Server stays open for a limited window — often about 2 weeks",
        "After it closes, use what you learned and retune sensi when the live OB55 drops",
      ],
    },
    {
      id: "activation-code",
      badge: "Code",
      icon: "fa-key",
      title: "How to Access Advance Server Activation Code?",
      summary:
        "Registering does not mean you get in. The publisher picks a limited number of players and shows the activation code on your Advance Server dashboard.",
      points: [
        "Log in again at the Free Fire Advance portal with the same Google / Facebook account",
        "Open your Advance Server dashboard — the code appears there after selection",
        "Codes usually do not come by SMS or random email from other sites",
        "Copy the code, open the Advance Server app, and enter it to log in",
        "If no code shows yet, you are still waiting — selection is not guaranteed",
      ],
    },
    {
      id: "use-activation-code",
      badge: "Use code",
      icon: "fa-right-to-bracket",
      title: "How to Use the Activation Code",
      summary:
        "Once the publisher shows your code, you enter it inside the Advance Server app — not on the website download page alone.",
      points: [
        "Install the Advance Server app from the publisher's site first",
        "Open the Advance Server app and choose Google or Facebook login",
        "When asked for an activation code, paste the code from your Advance Server dashboard",
        "Confirm and wait for the login to finish — do not share the code with anyone",
        "If the code fails, check typos, account match, and that the Advance Server is still open",
      ],
    },
    {
      id: "check-open",
      badge: "Status",
      icon: "fa-clock",
      title: "How to Check if Free Fire Advance Server Is Open",
      summary:
        "Advance Server is not always live. It opens for a short window each OB cycle — check the publisher portal for the real status.",
      points: [
        "Visit the Free Fire Advance portal — this is the status page to check",
        "Look for registration open, server open dates, or download buttons on the dashboard",
        "If registration is closed and no APK download shows, the Advance Server is not open right now",
        "Ignore random “server open today” posts on social media unless the publisher confirms it",
        "When the window ends, wait for the next OB cycle — dates change every update",
      ],
    },
    {
      id: "problems-fixes",
      badge: "Fixes",
      icon: "fa-wrench",
      title: "Common Free Fire Advance Server Problems and Fixes",
      summary:
        "Most Advance Server issues are install, login, or selection problems. Try these fixes before downloading random APKs.",
      points: [
        "APK won’t install — allow unknown apps for your browser, free up storage, retry from the Free Fire Advance portal only",
        "No activation code — you may not be selected yet; recheck the Advance Server dashboard later",
        "Code invalid / login failed — use the same Google/Facebook account and retype the code carefully",
        "App crashes on open — update Android WebView/Chrome, clear cache, reinstall the Advance Server app",
        "Can’t download — Advance Server may be closed; confirm status on the Free Fire Advance portal",
        "iPhone users — there is no iOS Advance Server APK; Android only",
      ],
    },
    {
      id: "pros-cons",
      badge: "Pros & Cons",
      icon: "fa-scale-balanced",
      title: "Pros and Cons of Free Fire Advance Server",
      summary:
        "Worth trying if you like early OB features — but it is still a limited beta, not the full live game.",
      points: [],
      pros: [
        "Play upcoming weapons and features before the global update",
        "Help the publisher find bugs and shape the next OB",
        "Main Free Fire / Max account progress stays safe",
        "Publisher APK — free when you are selected",
        "Good practice for new guns before they hit ranked",
      ],
      cons: [
        "Selection is limited — many players never get a code",
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
      title: "Features of Free Fire Advance Server",
      summary:
        "Advance Server is not a different game — it is an early look at the next OB, built for testing before the worldwide release.",
      points: [
        "Try upcoming weapons, characters, and balance changes before the live update",
        "Play limited-time beta events and modes the publisher is still fine-tuning",
        "Report bugs and send feedback straight from the test build",
        "Earn bug-hunter style rewards when the publisher runs reward programs",
        "Keep your main Free Fire / Max account safe — beta progress stays separate",
        "Android-only APK from the publisher's Advance Server portal",
      ],
    },
  ],
  tables: [
    {
      id: "compare",
      badge: "Compare",
      icon: "fa-table",
      title: "Advance Server vs Free Fire (live)",
      summary: "Quick side-by-side so you know what changes in the beta app.",
      columns: ["Point", "Advance Server", "Free Fire / Max (live)"],
      rows: [
        ["Purpose", "Test upcoming OB features early", "Play the live global version"],
        ["Platform", "Android only", "Android & iOS"],
        ["APK source", "Free Fire Advance portal", "Play Store / App Store / store"],
        ["Activation code", "Required after selection", "Not needed"],
        ["Account progress", "Separate beta — main ID stays safe", "Your real rank & inventory"],
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
        ["1. Register", "Signup opens on the Free Fire Advance portal", "Log in with Google / Facebook"],
        ["2. Selection", "The publisher picks testers", "Check dashboard for your code"],
        ["3. Download APK", "Beta APK unlocked", "Install from the Free Fire Advance portal only"],
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
      summary: "One-screen checklist before you register or download anything.",
      columns: ["Detail", "Info"],
      rows: [
        ["Version focus", "OB55 Advance Server cycle"],
        ["Platform", "Android only (no iOS APK)"],
        ["Publisher source", "Free Fire Advance portal (publisher only)"],
        ["Activation code", "Required after publisher selection"],
        ["Main Free Fire ID", "Safe — beta is a separate app"],
        ["Cost", "Free — never pay for codes or APKs"],
        ["We host APK?", "No — download only from the Free Fire Advance portal"],
      ],
    },
  ],
  faqs: [
    {
      id: "as-faq-1",
      question: "What is Free Fire Advance Server?",
      answer:
        "It is the publisher beta for testing upcoming OB features before the global Free Fire / Free Fire Max update. Selected players get early access on Android.",
    },
    {
      id: "as-faq-2",
      question: "Is Advance Server free?",
      answer:
        "Yes. Registration and the APK are free from the publisher. Never pay anyone for an activation code or APK file.",
    },
    {
      id: "as-faq-3",
      question: "Where do I download the Advance Server APK?",
      answer:
        "Only from the Free Fire Advance portal after you are selected. Do not use Telegram, random websites, or “mod APK” links.",
    },
    {
      id: "as-faq-4",
      question: "How do I get an activation code?",
      answer:
        "Register on the Free Fire Advance portal with your Free Fire Google or Facebook account. If the publisher selects you, the code appears on your dashboard there.",
    },
    {
      id: "as-faq-5",
      question: "Does Advance Server work on iPhone?",
      answer:
        "No. The Advance Server app is Android only. There is no iOS Advance Server download.",
    },
    {
      id: "as-faq-6",
      question: "Will my main Free Fire account get banned or wiped?",
      answer:
        "Advance Server is a separate beta app. Your main Free Fire / Max rank and inventory stay on the live game. Still download only from the publisher.",
    },
    {
      id: "as-faq-7",
      question: "Why didn’t I get selected?",
      answer:
        "The publisher only picks a limited number of testers each cycle. Registering does not guarantee a code. Try again when the next Advance Server registration opens.",
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
