import { FF_ADVANCE_SERVER } from "@/src/lib/ffAdvanceServer";
import { FF_NEXT_UPDATE } from "@/src/lib/ffNextUpdate";
import { FF_SITE_PATCH } from "@/src/lib/ffOfficialPatch";
import { FF_SEASON_EVENT } from "@/src/lib/ffSeasonEvent";
import { FREE_FIRE_MAX_PATH } from "@/src/lib/freeFirePages";
import type { FfHomeCards } from "@/src/lib/homeCardsTypes";

export function getDefaultFfHomeCards(): FfHomeCards {
  return {
    seo: {
      description:
        "Free Fire & FF Max sensitivity settings calculator. Get updated sensitivity, DPI settings, and control layout for all RAM devices (2GB–8GB).",
      keywords: [
        "Free Fire sensitivity calculator",
        "Free Fire sensitivity settings",
        "Free Fire RAM sensitivity",
        "Free Fire DPI settings",
        "Free Fire Red Dot sensitivity",
        "Free Fire Max sensitivity",
      ],
    },
    hero: {
      title: "Free Fire & FF Max Sensitivity Settings Calculator",
    },
    calcBanner: {
      strong: "",
      rest: "",
    },
    patchStrip: {
      code: FF_SITE_PATCH.code,
      label: FF_SITE_PATCH.label,
      dateLabel: FF_SITE_PATCH.dateLabel,
      dateIso: FF_SITE_PATCH.dateIso,
      typeLabel: FF_SITE_PATCH.typeLabel,
      summary: FF_SITE_PATCH.summary,
      articlePath: FF_SITE_PATCH.articlePath,
      newsListPath: FF_SITE_PATCH.newsListPath,
      primaryCta: FF_SITE_PATCH.primaryCta,
      secondaryCta: FF_SITE_PATCH.secondaryCta,
    },
    playModes: {
      title: "Choose your play mode",
      lead: "Tap a mode — calculator Player Role updates automatically.",
      modes: [
        {
          id: "rusher",
          label: "Rusher",
          blurb: "Close-range aggressive aim",
          icon: "fa-person-running",
          role: "rusher",
        },
        {
          id: "sniper",
          label: "Sniper",
          blurb: "Long-range scope control",
          icon: "fa-crosshairs",
          role: "sniper",
        },
        {
          id: "clash-squad",
          label: "Clash Squad",
          blurb: "Fast 4v4 fights",
          icon: "fa-users",
          role: "rusher",
        },
        {
          id: "battle-royale",
          label: "Battle Royale",
          blurb: "Full map survival",
          icon: "fa-map",
          role: "sniper",
        },
      ],
    },
    nextUpdate: {
      badge: FF_NEXT_UPDATE.badge,
      code: FF_NEXT_UPDATE.code,
      title: FF_NEXT_UPDATE.title,
      meta: FF_NEXT_UPDATE.meta,
      metaIso: FF_NEXT_UPDATE.metaIso,
      summary: FF_NEXT_UPDATE.summary,
      features: [...FF_NEXT_UPDATE.features],
      note: FF_NEXT_UPDATE.note,
      primaryPath: FF_NEXT_UPDATE.primaryPath,
      primaryCta: FF_NEXT_UPDATE.primaryCta,
      secondaryPath: FF_NEXT_UPDATE.secondaryPath,
      secondaryCta: FF_NEXT_UPDATE.secondaryCta,
    },
    advanceServer: {
      badge: FF_ADVANCE_SERVER.badge,
      code: FF_ADVANCE_SERVER.code,
      title: FF_ADVANCE_SERVER.title,
      meta: FF_ADVANCE_SERVER.meta,
      summary: FF_ADVANCE_SERVER.summary,
      features: [...FF_ADVANCE_SERVER.features],
      note: FF_ADVANCE_SERVER.note,
      officialUrl: "",
      primaryCta: FF_ADVANCE_SERVER.primaryCta,
      secondaryPath: FF_ADVANCE_SERVER.secondaryPath,
      secondaryCta: FF_ADVANCE_SERVER.secondaryCta,
    },
    roleTips: {
      title: "Best sensi tips by role",
      items: [
        {
          role: "rusher",
          title: "Rusher tips",
          icon: "fa-person-running",
          tips: [
            "Keep General & Red Dot a bit higher for fast close fights",
            "Use 2–3 finger claw for quicker close-range drag",
            "Practice SMG / shotgun sprays in Training Ground first",
          ],
          buttonLabel: "Use Rusher in calculator",
        },
        {
          role: "sniper",
          title: "DPI/SPI + Sensitivity Guide",
          icon: "fa-bolt",
          lead: "Higher DPI/SPI makes the screen feel faster. If you raised DPI/SPI, keep sensi a bit lower so your crosshair does not jump past the enemy’s head.",
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
          title: "Free Fire Sensi for Beginners",
          icon: "fa-graduation-cap",
          lead: "New players often copy pro settings and miss shots. Start with a balanced sensi matched to your phone RAM and FPS, then fine-tune in Training Ground.",
          tips: [
            "Safe starting values for 2–4 finger play",
            "Works on low & mid RAM phones",
            "Learn drag before chasing high sensi",
          ],
          buttonLabel: "Calculate Beginner Sensi Now",
        },
      ],
    },
    season: {
      badge: FF_SEASON_EVENT.badge,
      title: FF_SEASON_EVENT.title,
      summary: FF_SEASON_EVENT.summary,
      dateLabel: FF_SEASON_EVENT.dateLabel,
      dateIso: FF_SEASON_EVENT.dateIso,
      ctaPath: FF_SEASON_EVENT.ctaPath,
      ctaLabel: FF_SEASON_EVENT.ctaLabel,
      secondaryPath: FF_SEASON_EVENT.secondaryPath,
      secondaryLabel: FF_SEASON_EVENT.secondaryLabel,
    },
    proTips: {
      title: "Pro tips for better aim",
      lead: "Practice-first habits that help any sensi stick — no team logos, just usable advice.",
      ctaLabel: "Apply sensi in calculator",
      items: [
        {
          id: "training",
          title: "Warm up first",
          tip: "Spend 10–15 minutes in Training Ground after applying new sensi — lock muscle memory before ranked.",
          icon: "fa-dumbbell",
        },
        {
          id: "one-change",
          title: "Change one value",
          tip: "Adjust only General or Red Dot first. Big multi-scope edits make it harder to feel what helped.",
          icon: "fa-sliders",
        },
        {
          id: "match-fps",
          title: "Match your FPS",
          tip: "Use the same FPS in the calculator that you play ranked with — mixed FPS feels like bad sensi.",
          icon: "fa-gauge-high",
        },
        {
          id: "record",
          title: "Review your aim",
          tip: "After 2–3 matches, note if drag is too fast or scopes shake — then recalculate with a small tweak.",
          icon: "fa-video",
        },
      ],
    },
    howItWorks: {
      title: "How It Works",
      subtitle: "Get your Free Fire pro settings in just 4 simple steps.",
      steps: [
        {
          title: "Select Device",
          icon: "fa-mobile-screen",
          bullets: [
            "Open the Free Fire calculator on home",
            "Type your phone name or pick from suggestions",
            "Confirm the device matches what you play on",
          ],
        },
        {
          title: "Enter Model",
          icon: "fa-keyboard",
          bullets: [
            "Select your phone RAM (2GB–12GB+)",
            "Choose DPI mode (default or custom)",
            "Set the FPS you usually play at",
          ],
        },
        {
          title: "Device Age",
          icon: "fa-clock-rotate-left",
          bullets: [
            "Enter how old your device is",
            "Pick your finger setup (2 / 3 / 4 finger)",
            "Choose role and grip style",
          ],
        },
        {
          title: "Generate",
          icon: "fa-wand-magic-sparkles",
          bullets: [
            "Tap Calculate Sensitivity",
            "Copy General, Red Dot, scopes & free look",
            "Paste in Free Fire and test in Training Ground",
          ],
        },
      ],
    },
    comparison: {
      title: "Free Fire vs FF Max",
      ctaBeforeLink: "Playing Max?",
      ctaLinkLabel: "Open Free Fire Max calculator",
      ctaHref: FREE_FIRE_MAX_PATH,
      ramTitle: "RAM-wise Free Fire sensitivity",
      note: "Tip: Lower RAM → keep sensitivity a bit higher. High-end phones usually need slightly lower values.",
      vsRows: [
        {
          icon: "fa-image",
          point: "Graphics load",
          freefire: "Lighter & smoother",
          freefireMax: "Heavier HD visuals",
        },
        {
          icon: "fa-memory",
          point: "Best RAM",
          freefire: "Works well on 2–6GB",
          freefireMax: "Better on 6GB+",
        },
        {
          icon: "fa-crosshairs",
          point: "Sensitivity feel",
          freefire: "Faster drag response",
          freefireMax: "Needs own tuned values",
        },
        {
          icon: "fa-bullseye",
          point: "Aim control",
          freefire: "Drag-friendly presets",
          freefireMax: "Slightly heavier aim feel",
        },
        {
          icon: "fa-gamepad",
          point: "Best for",
          freefire: "Low & mid-range phones",
          freefireMax: "Strong / gaming phones",
        },
        {
          icon: "fa-calculator",
          point: "Use calculator",
          freefire: "Home Free Fire tool",
          freefireMax: "Free Fire Max page",
        },
      ],
      ramRows: [
        {
          icon: "fa-mobile-screen",
          ram: "2–3GB",
          general: "100",
          redDot: "95–100",
          scope2x: "100",
          scope4x: "95",
          sniper: "50–60",
          freeLook: "80",
        },
        {
          icon: "fa-tablet-screen-button",
          ram: "4–6GB",
          general: "90–98",
          redDot: "85–90",
          scope2x: "85–95",
          scope4x: "80–85",
          sniper: "45–50",
          freeLook: "75",
        },
        {
          icon: "fa-laptop",
          ram: "8–12GB+",
          general: "80–88",
          redDot: "75–80",
          scope2x: "75–80",
          scope4x: "70–75",
          sniper: "35–40",
          freeLook: "65",
        },
      ],
    },
    explore: {
      title: "Explore calculators",
      freefire: {
        title: "Free Fire",
        text: "Classic Free Fire sensitivity for all RAM phones — DPI and drag settings.",
        points: [
          "Low & mid-range friendly",
          "Drag-tuned presets",
          "Instant calculator on home",
        ],
        buttonLabel: "Explore Free Fire",
        href: "/#ff-calculator",
      },
      freefireMax: {
        title: "Free Fire Max",
        text: "Max-mode sensitivity for heavier graphics — separate tune for smoother aim on stronger phones.",
        points: [
          "Built for FF Max feel",
          "Better on 6GB+ devices",
          "Own Max calculator page",
        ],
        buttonLabel: "Explore Free Fire Max",
        href: FREE_FIRE_MAX_PATH,
      },
    },
  };
}

