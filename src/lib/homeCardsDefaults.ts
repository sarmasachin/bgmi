import { FF_ADVANCE_SERVER, FF_MAX_ADVANCE_SERVER } from "@/src/lib/ffAdvanceServer";
import { FF_MAX_NEXT_UPDATE, FF_NEXT_UPDATE } from "@/src/lib/ffNextUpdate";
import { FF_MAX_SITE_PATCH, FF_SITE_PATCH } from "@/src/lib/ffOfficialPatch";
import { FF_MAX_SEASON_EVENT, FF_SEASON_EVENT } from "@/src/lib/ffSeasonEvent";
import { FREE_FIRE_MAX_PATH } from "@/src/lib/freeFirePages";
import type { FfHomeCards, PageCardsVariant } from "@/src/lib/homeCardsTypes";

/** Built-in Free Fire home copy — used until admin saves overrides. */
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
          title: "Sniper tips",
          icon: "fa-crosshairs",
          tips: [
            "Keep scope values slightly lower for stable tracking",
            "Fine-tune 2x / 4x before sniper scope",
            "Hold angles and adjust Free Look for better peek aim",
          ],
          buttonLabel: "Use Sniper in calculator",
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

/** Built-in Free Fire Max page copy — used until admin saves overrides. */
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
          title: "Max sniper tips",
          icon: "fa-crosshairs",
          tips: [
            "Lower 2x / 4x a touch if scopes shake when Max effects kick in",
            "Lock Red Dot first, then sniper scope — one change at a time",
            "If the phone heats mid-match, drop effects before blaming sensi",
          ],
          buttonLabel: "Use Sniper in Max calculator",
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
export function getDefaultBgmiCards(): FfHomeCards {
  const home = getDefaultFfHomeCards();
  return {
    ...home,
    seo: {
      description:
        "Free BGMI sensitivity calculator for camera, ADS, and gyroscope. Generate custom no-recoil settings for your phone, FPS mode, and play style.",
      keywords: [
        "BGMI sensitivity calculator",
        "BGMI sensitivity settings",
        "BGMI no recoil settings",
        "BGMI gyroscope sensitivity",
        "BGMI ADS sensitivity",
        "BGMI camera sensitivity",
        "BGMI free sensitivity",
        "BGMI 2026 sensitivity",
      ],
    },
    hero: {
      title: "BGMI Sensitivity Calculator | Free No Recoil Settings 2026",
    },
  };
}

/** Built-in PUBG page SEO + hero — used until admin saves overrides. */
export function getDefaultPubgCards(): FfHomeCards {
  const home = getDefaultFfHomeCards();
  return {
    ...home,
    seo: {
      description:
        "Free PUBG Mobile sensitivity calculator for camera, ADS, and gyroscope. Get custom no-recoil presets matched to your device and play style.",
      keywords: [
        "PUBG Mobile sensitivity calculator",
        "PUBG sensitivity settings",
        "PUBG no recoil settings",
        "PUBG gyroscope sensitivity",
        "PUBG ADS sensitivity",
        "PUBG camera sensitivity",
        "PUBG Mobile free sensitivity",
        "PUBG Mobile 2026 sensitivity",
      ],
    },
    hero: {
      title: "PUBG Mobile Sensitivity Calculator | Free No Recoil Settings 2026",
    },
  };
}

/** Built-in PUBG Mobile Code page SEO + hero — used until admin saves overrides. */
export function getDefaultPubgMobileCodesCards(): FfHomeCards {
  const home = getDefaultFfHomeCards();
  return {
    ...home,
    seo: {
      description:
        "PUBG Mobile Sensitivity Settings Code — calculate sensitivity, copy codes for Android, and view camera / ADS settings for your device.",
      keywords: [
        "PUBG Mobile sensitivity code",
        "PUBG Mobile sensitivity settings code",
        "PUBG Mobile code",
        "PUBG sensitivity code Android",
        "PUBG Mobile camera sensitivity code",
        "PUBG Mobile ADS sensitivity code",
        "PUBG Mobile copy sensitivity code",
        "PUBG Mobile no recoil code",
      ],
    },
    hero: {
      title: "PUBG Mobile Sensitivity Settings Code",
    },
  };
}

export function getDefaultPageCards(variant: PageCardsVariant): FfHomeCards {
  if (variant === "freefire-max") return getDefaultFfMaxCards();
  if (variant === "bgmi") return getDefaultBgmiCards();
  if (variant === "pubg") return getDefaultPubgCards();
  if (variant === "pubg-mobile-codes") return getDefaultPubgMobileCodesCards();
  return getDefaultFfHomeCards();
}
