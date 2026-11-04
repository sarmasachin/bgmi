/** Official editions / packs from Rockstar Support + Take-Two (no invented items). */

export const GTA6_STORY = {
  title: "Story setting",
  body: "Vice City, USA. Jason and Lucia have always known the deck is stacked against them. But when an easy score goes wrong, they find themselves on the darkest side of the sunniest place in America, in the middle of a criminal conspiracy stretching across the state of Leonida — forced to rely on each other more than ever if they want to make it out alive. (Rockstar / Xbox / PlayStation store copy.)",
} as const;

export const GTA6_EDITIONS = {
  title: "Editions and versions",
  intro:
    "Rockstar Support lists two editions plus digital/physical versions. Ultimate Edition Upgrade can be bought later by Standard Edition owners after the download code is redeemed.",
  cards: [
    {
      title: "Standard Edition — $79.99 (US list)",
      points: [
        "Grand Theft Auto VI base game (single-player).",
        "Digital or physical (physical box = download code; no disc of the full game).",
        "Can buy Ultimate Edition Upgrade separately later.",
      ],
    },
    {
      title: "Ultimate Edition — $99.99 (US list)",
      points: [
        "Grand Theft Auto VI + Ultimate Edition Upgrade.",
        "Exclusive vehicles, weapons, apparel, shops, and story-threaded bonuses unlocked across chapters.",
        "Highlights named by Rockstar Support include: ’95 Grotti Cheetah; Hawk & Little Morgan Revolvers; personalized weapon variants; Vice City styles; Jason’s safehouse vehicles; Ganado Retro Build; Rideout Customs Mod Shop; Sara’s Unisex Salon; Shitzu Squalo; Stock 305 Clothing Store; ’67 Vapid Dominator Buggy and Garage; Electric Fang Tattoo Parlor; One-Eyed Willie’s Mod Shop; Goodtime Gear; PTT Youngin$ Compound; Classic Car Collection.",
      ],
    },
    {
      title: "Vintage Vice City Pack (pre-order / early purchase)",
      points: [
        "Included with pre-orders and purchases before November 20, 2026.",
        "’55 Vapid Stanier Sedan and Garage.",
        "Outfits and hairstyles.",
        "Exclusive weapon pattern (Tommy Vercetti–inspired styling in Rockstar marketing).",
        "Digital pre-orders also list one month of GTA+ (claim rules / deadlines follow the store offer terms).",
      ],
    },
    {
      title: "Digital vs physical",
      points: [
        "Digital: Standard or Ultimate on PlayStation Store, Microsoft Store, Rockstar Warehouse, etc.",
        "Digital pre-load from November 12, 2026 (local midnight) — not early access.",
        "Physical: available from November 12 for shipping/pickup; box contains a download code; Rockstar Support states a disc is not included.",
        "Physical codes can be redeemed to start pre-load when received.",
      ],
    },
  ],
} as const;

export const GTA6_TIMELINE = {
  title: "Key dates",
  rows: [
    { label: "Pre-orders open", value: "June 25, 2026 (midnight local)" },
    { label: "Physical / code pre-load window", value: "From November 12, 2026" },
    { label: "Digital pre-load", value: "November 12, 2026" },
    { label: "Launch", value: "November 19, 2026" },
    { label: "Vintage Vice City Pack cutoff", value: "Purchases before November 20, 2026" },
  ],
} as const;
