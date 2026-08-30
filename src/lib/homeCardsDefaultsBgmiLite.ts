import type { FfHomeCards } from "@/src/lib/homeCardsTypes";
import { BGMI_LITE_APK_PATH } from "@/src/lib/resolveNavForPath";

/**
 * Built-in /bgmi-lite page cards — BGMI Lite only (not Free Fire / not full BGMI copy).
 * Facts: Krafton India Lite, end-2026 window, Play pre-reg ~1GB, budget phones;
 * sensi ranges from low-end / Lite-family guides (provisional until live client).
 */
export function getDefaultBgmiLiteCards(): FfHomeCards {
  return {
    seo: {
      description:
        "Free BGMI Lite sensitivity calculator for 2GB–4GB phones. Get Camera, ADS, and Gyroscope settings tuned for 30–60 FPS entry devices.",
      keywords: [
        "BGMI Lite sensitivity calculator",
        "BGMI Lite sensitivity settings",
        "BGMI Lite 2GB RAM",
        "BGMI Lite gyroscope sensitivity",
        "BGMI Lite ADS sensitivity",
        "BGMI Lite camera sensitivity",
        "BGMI Lite low end phone",
      ],
    },
    hero: {
      title: "BGMI Lite Sensitivity Calculator",
    },
    patchStrip: {
      code: "bgmi-lite-prereg",
      label: "BGMI Lite",
      dateLabel: "Aug 2026",
      dateIso: "2026-08-25",
      typeLabel: "Pre-registration",
      summary:
        "Krafton India opened Android pre-registration for BGMI Lite (~1GB initial download). Full launch targeted by end of 2026 — official RAM/specs still pending.",
      articlePath: "/news",
      newsListPath: "/news",
      primaryCta: "Latest news",
      secondaryCta: "All news",
    },
    playModes: {
      title: "Choose your Lite play style",
      lead: "Tap a style — the BGMI Lite calculator Play style updates automatically.",
      modes: [
        {
          id: "close-fight",
          label: "Close fight",
          blurb: "Rusher / room clears",
          icon: "fa-person-running",
          role: "rusher",
        },
        {
          id: "balanced",
          label: "Balanced",
          blurb: "All-round Lite aim",
          icon: "fa-scale-balanced",
          role: "flanker",
        },
        {
          id: "mid-long",
          label: "Mid–long",
          blurb: "Support / scope control",
          icon: "fa-crosshairs",
          role: "sniper",
        },
        {
          id: "stable-fps",
          label: "Stable FPS",
          blurb: "30–60 FPS first",
          icon: "fa-gauge-high",
          role: "headshot",
        },
      ],
    },
    nextUpdate: {
      badge: "Lite",
      code: "bgmi-lite-2026",
      title: "BGMI Lite launch window",
      meta: "End of 2026 · Krafton India",
      metaIso: "2026-12-31",
      summary:
        "Lite is confirmed for India. Features, maps, and official minimum specs will land closer to launch — retune sensi after the live client ships.",
      features: [
        "Designed for budget / older Android phones",
        "Play Store pre-reg · ~1GB first download (reported)",
        "Existing BGMI account + cross-play (reported)",
      ],
      note: "Fan-made calculator — not affiliated with Krafton. We do not host APKs.",
      primaryPath: "/bgmi-lite#bgmi-lite-calculator",
      primaryCta: "Open Lite calculator",
      secondaryPath: "/news",
      secondaryCta: "Lite news",
    },
    advanceServer: {
      badge: "Tip",
      code: "lite-safe-download",
      title: "Download only from official stores",
      meta: "Security note",
      summary:
        "Krafton has not published a public APK mirror for Lite. Use Google Play pre-registration only — skip random APK sites.",
      features: [
        "Verify publisher is Krafton on Play Store",
        "No paid “Lite APK” links — those are scams",
        "Retune Camera / ADS / Gyro after install",
      ],
      note: "This site is a sensitivity tool, not a download hub.",
      primaryCta: "Back to calculator",
      secondaryPath: "/bgmi-lite#bgmi-lite-calculator",
      secondaryCta: "Calculate Lite sensi",
    },
    roleTips: {
      title: "Best BGMI Lite sensi tips by play style",
      items: [
        {
          role: "rusher",
          title: "Close-fight / rusher",
          icon: "fa-person-running",
          tips: [
            "Keep Camera & ADS no-scope a bit higher for room clears",
            "Prefer 2–3 finger on entry phones — claw only if FPS stays stable",
            "Warm up SMG / AR sprays in Training Ground before ranked",
          ],
          buttonLabel: "Use Close fight in calculator",
        },
        {
          role: "sniper",
          title: "Mid–long / support",
          icon: "fa-crosshairs",
          lead: "On Lite-class phones, high scopes need control more than flagship speed. Match calculator FPS to the FPS you actually hold.",
          tips: [
            "Lower 4x / 6x if spray climbs the sky",
            "Scope On gyro helps micro-adjust without always-on drift",
            "Don’t paste 120 FPS full-BGMI codes onto Lite",
          ],
          buttonLabel: "Use Mid–long in calculator",
        },
        {
          role: "flanker",
          title: "BGMI Lite sensi for beginners",
          icon: "fa-graduation-cap",
          lead: "Start balanced for 2GB–4GB RAM and 30–60 FPS. Copying Conqueror claw codes from full BGMI usually feels jumpy on Lite hardware.",
          tips: [
            "Safe Camera / ADS / Gyro starting points",
            "Scope On recommended before Always On",
            "Change one scope ±5 after each Training session",
          ],
          buttonLabel: "Calculate beginner Lite sensi",
        },
      ],
    },
    season: {
      badge: "Coming",
      title: "BGMI Lite — India, end of 2026",
      summary:
        "Krafton confirmed Lite for budget phones. Pre-register on Google Play when available, then use this calculator for Camera, ADS, and Gyroscope baselines.",
      dateLabel: "2026",
      dateIso: "2026-12-31",
      ctaPath: "/bgmi-lite#bgmi-lite-calculator",
      ctaLabel: "Open Lite calculator",
      secondaryPath: "/news",
      secondaryLabel: "News",
    },
    proTips: {
      title: "Pro tips for BGMI Lite aim",
      lead: "Low-end habits that matter more than copying flagship sensi codes.",
      ctaLabel: "Apply in Lite calculator",
      items: [
        {
          id: "stable-fps",
          title: "Stable FPS first",
          tip: "Set graphics to Smooth and lock the highest FPS you hold (often 30 or 60). Unstable FPS makes any sensi feel random.",
          icon: "fa-gauge-high",
        },
        {
          id: "scope-on",
          title: "Prefer Scope On gyro",
          tip: "On 2GB phones, Always On can drift while looting. Scope On gives tilt control when ADS matters.",
          icon: "fa-mobile-screen",
        },
        {
          id: "no-flagship",
          title: "Don’t paste full BGMI codes",
          tip: "120 FPS claw codes from full BGMI overshoot on Lite-class sensors. Use this Lite tool, then fine-tune ±5.",
          icon: "fa-ban",
        },
        {
          id: "one-change",
          title: "Change one value",
          tip: "Adjust Red Dot or 3x first. After 2 matches, tweak 4x / 6x — not every slider at once.",
          icon: "fa-sliders",
        },
      ],
    },
    howItWorks: {
      title: "How It Works",
      subtitle: "Four steps to Lite-ready Camera, ADS, and Gyroscope settings.",
      steps: [
        {
          title: "Select Device",
          icon: "fa-mobile-screen",
          bullets: [
            "Open the BGMI Lite calculator",
            "Pick a budget phone close to yours (Redmi, Realme, Infinix…)",
            "Confirm RAM matches your device (often 2–4GB)",
          ],
        },
        {
          title: "Enter Setup",
          icon: "fa-keyboard",
          bullets: [
            "Choose the FPS you hold stable (30 / 40 / 60)",
            "Set gyroscope to Scope On on entry phones",
            "Select play style and finger layout",
          ],
        },
        {
          title: "Generate",
          icon: "fa-wand-magic-sparkles",
          bullets: [
            "Tap Calculate for Camera, ADS, and Gyro",
            "Copy values into BGMI Lite Settings",
            "Tune Red Dot / 3x / 6x in Training Ground (±5)",
          ],
        },
        {
          title: "Stay Stable",
          icon: "fa-gauge-high",
          bullets: [
            "Prefer Smooth graphics for steady FPS",
            "Avoid copying flagship 90/120 FPS codes",
            "Retune after Krafton’s final Lite client ships",
          ],
        },
      ],
    },
    comparison: {
      title: "BGMI vs BGMI Lite",
      ctaBeforeLink: "Playing full BGMI?",
      ctaLinkLabel: "Open BGMI calculator",
      ctaHref: "/bgmi",
      ramTitle: "RAM-wise BGMI Lite starting ranges (provisional)",
      note: "Tip: These are researched low-end baselines — not official Krafton Lite specs. Retune ±5 in Training Ground after Lite launches.",
      leftColLabel: "BGMI",
      rightColLabel: "BGMI Lite",
      ramColLabels: {
        general: "Cam NS",
        redDot: "Cam RD",
        scope2x: "Cam 2x",
        scope4x: "Cam 4x",
        sniper: "Cam 6x",
        freeLook: "Gyro NS",
      },
      vsRows: [
        {
          icon: "fa-mobile-screen",
          point: "Target phones",
          freefire: "Mid to flagship Android",
          freefireMax: "Budget / older Android",
        },
        {
          icon: "fa-memory",
          point: "Typical RAM focus",
          freefire: "4GB+ recommended for smooth play",
          freefireMax: "Entry 2GB–4GB class (official min TBA)",
        },
        {
          icon: "fa-hard-drive",
          point: "Install size",
          freefire: "Larger full client",
          freefireMax: "~1GB first download (pre-reg reports)",
        },
        {
          icon: "fa-gauge-high",
          point: "Common FPS",
          freefire: "60 / 90 / 120 on stronger phones",
          freefireMax: "Often 30–60 stable FPS",
        },
        {
          icon: "fa-crosshairs",
          point: "Sensitivity tool",
          freefire: "Full BGMI calculator (/bgmi)",
          freefireMax: "This Lite calculator (Camera / ADS / Gyro)",
        },
        {
          icon: "fa-ban",
          point: "Code sharing",
          freefire: "Flagship claw codes common online",
          freefireMax: "Don’t paste those here — retune for Lite",
        },
      ],
      ramRows: [
        {
          icon: "fa-mobile-screen",
          ram: "2GB",
          general: "135–145",
          redDot: "60–70",
          scope2x: "45–55",
          scope4x: "22–30",
          sniper: "12–18",
          freeLook: "180–210",
        },
        {
          icon: "fa-tablet-screen-button",
          ram: "3–4GB",
          general: "125–140",
          redDot: "55–68",
          scope2x: "40–52",
          scope4x: "20–28",
          sniper: "11–16",
          freeLook: "170–200",
        },
        {
          icon: "fa-laptop",
          ram: "6GB+",
          general: "115–130",
          redDot: "50–62",
          scope2x: "35–48",
          scope4x: "18–26",
          sniper: "10–15",
          freeLook: "160–190",
        },
      ],
    },
    explore: {
      title: "More BGMI tools",
      freefire: {
        title: "BGMI calculator",
        text: "Full Battlegrounds Mobile India sensitivity — Camera & ADS/Gyro for mid and flagship phones.",
        points: [
          "60 / 90 / 120 FPS presets",
          "Separate from this Lite tool",
          "Open /bgmi anytime",
        ],
        buttonLabel: "Open BGMI calculator",
        href: "/bgmi",
      },
      freefireMax: {
        title: "BGMI Lite APK",
        text: "Lite launch countdown, pre-registration steps, and safe download notes — official Play Store only; we do not host APKs.",
        points: [
          "Countdown to 12 Nov 2026",
          "Pre-reg / safety guide",
          "Pair with Lite sensi above",
        ],
        buttonLabel: "Open Lite APK page",
        href: BGMI_LITE_APK_PATH,
      },
    },
  };
}

/** Kept for callers that only need the Lite APK path constant near defaults. */
export const BGMI_LITE_RELATED = {
  liteApk: BGMI_LITE_APK_PATH,
} as const;
