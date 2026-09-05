import { FF_MAX_ADVANCE_SERVER } from "@/src/lib/ffAdvanceServer";
import { FF_MAX_NEXT_UPDATE } from "@/src/lib/ffNextUpdate";
import { FF_MAX_SITE_PATCH } from "@/src/lib/ffOfficialPatch";
import { FF_MAX_SEASON_EVENT } from "@/src/lib/ffSeasonEvent";
import { FREE_FIRE_MAX_PATH } from "@/src/lib/freeFirePages";
import type { FfHomeCards } from "@/src/lib/homeCardsTypes";
import { getDefaultFfHomeCards } from "@/src/lib/homeCardsDefaultsFreefire";

export function getDefaultFfMaxCards(): FfHomeCards {
  const home = getDefaultFfHomeCards();
  return {
    seo: {
      description:
        "Free Fire Max sensitivity calculator for General, Red Dot, 2x, 4x, sniper scope, and free look. Get RAM-based settings for your phone.",
      keywords: [
        "Free Fire Max sensitivity calculator",
        "Free Fire Max sensitivity settings",
        "FF Max sensitivity settings",
        "Free Fire Max Red Dot sensitivity",
        "Free Fire Max DPI settings",
        "Free Fire Max RAM sensitivity",
        "FF Max General sensitivity",
        "Free Fire Max scope sensitivity",
      ],
    },
    hero: {
      title: "Free Fire Max Sensitivity Settings Calculator",
    },
    calcBanner: home.calcBanner,
    patchStrip: {
      code: FF_MAX_SITE_PATCH.code,
      label: FF_MAX_SITE_PATCH.label,
      dateLabel: FF_MAX_SITE_PATCH.dateLabel,
      dateIso: FF_MAX_SITE_PATCH.dateIso,
      typeLabel: FF_MAX_SITE_PATCH.typeLabel,
      summary: FF_MAX_SITE_PATCH.summary,
      articlePath: FF_MAX_SITE_PATCH.articlePath,
      newsListPath: FF_MAX_SITE_PATCH.newsListPath,
      primaryCta: FF_MAX_SITE_PATCH.primaryCta,
      secondaryCta: FF_MAX_SITE_PATCH.secondaryCta,
    },
    /** Not shown on Max page — kept for shared payload shape. */
    playModes: home.playModes,
    nextUpdate: {
      badge: FF_MAX_NEXT_UPDATE.badge,
      code: FF_MAX_NEXT_UPDATE.code,
      title: FF_MAX_NEXT_UPDATE.title,
      meta: FF_MAX_NEXT_UPDATE.meta,
      metaIso: FF_MAX_NEXT_UPDATE.metaIso,
      summary: FF_MAX_NEXT_UPDATE.summary,
      features: [...FF_MAX_NEXT_UPDATE.features],
      note: FF_MAX_NEXT_UPDATE.note,
      primaryPath: FF_MAX_NEXT_UPDATE.primaryPath,
      primaryCta: FF_MAX_NEXT_UPDATE.primaryCta,
      secondaryPath: FF_MAX_NEXT_UPDATE.secondaryPath,
      secondaryCta: FF_MAX_NEXT_UPDATE.secondaryCta,
    },
    advanceServer: {
      badge: FF_MAX_ADVANCE_SERVER.badge,
      code: FF_MAX_ADVANCE_SERVER.code,
      title: FF_MAX_ADVANCE_SERVER.title,
      meta: FF_MAX_ADVANCE_SERVER.meta,
      summary: FF_MAX_ADVANCE_SERVER.summary,
      features: [...FF_MAX_ADVANCE_SERVER.features],
      note: FF_MAX_ADVANCE_SERVER.note,
      officialUrl: "",
      primaryCta: FF_MAX_ADVANCE_SERVER.primaryCta,
      secondaryPath: FF_MAX_ADVANCE_SERVER.secondaryPath,
      secondaryCta: FF_MAX_ADVANCE_SERVER.secondaryCta,
    },
    roleTips: {
      title: "Best Free Fire Max sensi tips by role",
      items: [
        {
          role: "rusher",
          title: "Max rusher tips",
          icon: "fa-person-running",
          tips: [
            "On Max, keep General slightly higher if FPS dips in close fights",
            "Don’t copy classic Free Fire rusher codes — Max drag feels heavier",
            "Warm up with SMG / shotgun in Training Ground on your Max graphics setting",
          ],
          buttonLabel: "Use Rusher in Max calculator",
        },
        {
          role: "sniper",
          title: "DPI/SPI + Sensitivity Guide",
          icon: "fa-bolt",
          lead: "Higher DPI/SPI makes aim feel faster on Max too. If you raised DPI/SPI, keep sensi a bit lower so the crosshair does not jump past the head.",
          tips: [
            "No DPI/SPI = higher sensi OK",
            "Mid/High DPI/SPI = control first",
            "Match calculator DPI/SPI to your phone",
          ],
          buttonLabel: "Get DPI/SPI Tuned Sensi",
          applyRole: false,
          focusControlId: "ffc-dpi",
        },
        {
          role: "flanker",
          title: "Free Fire Max Sensi for Beginners",
          icon: "fa-graduation-cap",
          lead: "New Max players often reuse classic Free Fire codes and miss. Start balanced for your RAM and FPS, then warm up on Max graphics.",
          tips: [
            "Safe starting values for 2–4 finger play",
            "Works on mid-range and 6GB+ phones",
            "Learn Max drag before chasing high sensi",
          ],
          buttonLabel: "Calculate Beginner Max Sensi Now",
        },
      ],
    },
    season: {
      badge: FF_MAX_SEASON_EVENT.badge,
      title: FF_MAX_SEASON_EVENT.title,
      summary: FF_MAX_SEASON_EVENT.summary,
      dateLabel: FF_MAX_SEASON_EVENT.dateLabel,
      dateIso: FF_MAX_SEASON_EVENT.dateIso,
      ctaPath: FF_MAX_SEASON_EVENT.ctaPath,
      ctaLabel: FF_MAX_SEASON_EVENT.ctaLabel,
      secondaryPath: FF_MAX_SEASON_EVENT.secondaryPath,
      secondaryLabel: FF_MAX_SEASON_EVENT.secondaryLabel,
    },
    proTips: {
      title: "Pro tips for Free Fire Max aim",
      lead: "Practical Max habits — graphics, heat, and sensi that actually stick in ranked.",
      ctaLabel: "Apply Max sensi in calculator",
      items: [
        {
          id: "stable-fps",
          title: "Stable FPS beats HD",
          tip: "On Max, a steady frame rate matters more than Ultra looks. If aim feels late, drop effects before changing every slider.",
          icon: "fa-gauge-high",
        },
        {
          id: "dont-copy-ff",
          title: "Don’t paste classic FF codes",
          tip: "Same account, different feel. Max textures and effects make drag heavier — calculate for Max on this page.",
          icon: "fa-ban",
        },
        {
          id: "heat",
          title: "Watch phone heat",
          tip: "Long Max sessions heat mid-range phones. Heat → FPS drop → fake “bad sensi”. Cool down, then retune.",
          icon: "fa-temperature-high",
        },
        {
          id: "one-change-max",
          title: "Change one Max value",
          tip: "Start with General or Red Dot only. After 2 ranked matches, tweak scopes — not everything at once.",
          icon: "fa-sliders",
        },
      ],
    },
    howItWorks: home.howItWorks,
    comparison: {
      title: "Free Fire Max vs Free Fire",
      ctaBeforeLink: "Still on classic Free Fire?",
      ctaLinkLabel: "Open Free Fire calculator",
      ctaHref: "/#ff-calculator",
      ramTitle: "RAM-wise Free Fire Max sensitivity",
      note: "Tip: On Max, if FPS dips in fights, keep General a bit higher — then fine-tune in Training Ground.",
      vsRows: [
        {
          icon: "fa-image",
          point: "What you see",
          freefire: "Lighter textures, easier FPS",
          freefireMax: "HD textures, lighting & effects",
        },
        {
          icon: "fa-hard-drive",
          point: "Phone load",
          freefire: "Smaller install, cooler phone",
          freefireMax: "Heavier app — heat & FPS matter",
        },
        {
          icon: "fa-crosshairs",
          point: "Sensi you should use",
          freefire: "Classic Free Fire calculator",
          freefireMax: "This Max calculator (not FF codes)",
        },
        {
          icon: "fa-bullseye",
          point: "Aim feel",
          freefire: "Usually snappier drag",
          freefireMax: "Heavier — retune General / Red Dot",
        },
        {
          icon: "fa-link",
          point: "Account / rank",
          freefire: "Shared via Firelink",
          freefireMax: "Same progress — different feel",
        },
        {
          icon: "fa-mobile-screen",
          point: "Pick this if",
          freefire: "Budget phone / max FPS focus",
          freefireMax: "Mid–flagship phone + better visuals",
        },
      ],
      ramRows: [
        {
          icon: "fa-mobile-screen",
          ram: "3–4GB",
          general: "95–100",
          redDot: "90–98",
          scope2x: "90–100",
          scope4x: "85–95",
          sniper: "45–60",
          freeLook: "75–90",
        },
        {
          icon: "fa-tablet-screen-button",
          ram: "6–8GB",
          general: "85–95",
          redDot: "80–90",
          scope2x: "80–90",
          scope4x: "75–85",
          sniper: "40–55",
          freeLook: "70–85",
        },
        {
          icon: "fa-laptop",
          ram: "12GB+",
          general: "75–88",
          redDot: "70–82",
          scope2x: "70–85",
          scope4x: "65–80",
          sniper: "35–50",
          freeLook: "60–75",
        },
      ],
    },
    explore: {
      title: "Switch between Max & Free Fire",
      freefire: {
        title: "Free Fire",
        text: "Lighter classic Free Fire — better when you want max FPS on a budget phone.",
        points: [
          "Cooler phone, smoother FPS",
          "Separate classic sensi tool",
          "Same account via Firelink",
        ],
        buttonLabel: "Open Free Fire calculator",
        href: "/#ff-calculator",
      },
      freefireMax: {
        title: "Free Fire Max",
        text: "You’re on the Max tool — built for heavier graphics so aim doesn’t feel sticky or too floaty.",
        points: [
          "Tuned for Max feel, not FF codes",
          "Works best on 6GB+ phones",
          "Scroll up to recalculate anytime",
        ],
        buttonLabel: "Back to Max calculator",
        href: `${FREE_FIRE_MAX_PATH}#ff-calculator`,
      },
    },
  };
}

/** Built-in BGMI page SEO + hero — used until admin saves overrides. */
