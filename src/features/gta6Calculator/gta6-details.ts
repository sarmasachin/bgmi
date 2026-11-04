/** Verified GTA 6 facts for on-page details / specs (Rockstar, Take-Two, PlayStation, Xbox). */

export type SpecRow = { label: string; value: string };

export const GTA6_OVERVIEW = {
  title: "About Grand Theft Auto VI",
  lead:
    "Grand Theft Auto VI is the next mainline open-world game from Rockstar Games. At launch it is a single-player story set across the state of Leonida — including modern-day Vice City — following Jason and Lucia.",
  paragraphs: [
    "Rockstar and Take-Two list the release for November 19, 2026 on PlayStation 5 and Xbox Series X|S. Digital pre-load begins November 12, 2026. Pre-orders started June 25, 2026.",
    "PlayStation states the game is not playable on PlayStation 4. There is no official PC release date on the Rockstar, PlayStation, or Xbox store pages used for this guide.",
    "Buy / pre-order storefronts named by Take-Two include PlayStation Store, Microsoft Store, Rockstar Warehouse, and global retailers. Physical boxes use a download code to support pre-load — not a playable disc of the full game.",
    "This page hosts a fan-made controller sensitivity calculator so players can prep look, aim, deadzone, acceleration, and DualSense options before launch. Slider names follow the usual GTA 5 / RDR2 controller pattern until Rockstar shows the real GTA 6 settings menu.",
  ],
} as const;

export const GTA6_SPECS: SpecRow[] = [
  { label: "Title", value: "Grand Theft Auto VI" },
  { label: "Developer / Publisher", value: "Rockstar Games (Take-Two Interactive)" },
  { label: "Release date", value: "November 19, 2026" },
  { label: "Pre-load", value: "November 12, 2026 (digital) — download only, not early access" },
  { label: "Platforms at launch", value: "PlayStation 5, PS5 Pro Enhanced, Xbox Series X|S" },
  { label: "Not supported", value: "PlayStation 4, Xbox One (launch platforms only)" },
  { label: "PC version", value: "Not listed on official store pages — no confirmed date" },
  { label: "PC system requirements", value: "None published (no official PC SKU yet)" },
  { label: "Mode at launch", value: "Single-player" },
  { label: "Online / multiplayer at launch", value: "Not presented as a day-one Online requirement on store pages" },
  { label: "Genre", value: "Action / adventure, open world" },
  {
    label: "Setting / map",
    value:
      "State of Leonida — Vice City, Leonida Keys, Port Gellhorn, Grassrivers, Ambrosia, Mount Kalaga National Park",
  },
  { label: "Main city", value: "Vice City, USA" },
  { label: "Protagonists", value: "Jason and Lucia" },
  { label: "Players", value: "1 player (PlayStation store listing)" },
  { label: "Offline play", value: "Enabled (PlayStation store listing)" },
  { label: "Remote Play", value: "Supported (PlayStation store listing)" },
  { label: "In-game purchases", value: "Optional (PlayStation store listing)" },
  { label: "Standard edition (US list)", value: "$79.99" },
  { label: "Ultimate Edition (US list)", value: "$99.99 — premium vehicles, weapons, apparel, story extras" },
  { label: "Pre-order bonus", value: "Vintage Vice City Pack (purchases before November 20, 2026)" },
  { label: "Digital pre-order extra", value: "One month of GTA+ (as listed by Take-Two for digital pre-orders)" },
  {
    label: "Physical edition",
    value: "Box with download code — Rockstar Support: disc not included; pre-load from Nov 12",
  },
  {
    label: "Ultimate Upgrade path",
    value: "Standard owners can buy Ultimate Edition Upgrade after redeeming download code",
  },
  { label: "Pre-orders open", value: "June 25, 2026 (midnight local)" },
  { label: "Install / file size", value: "Not published by Rockstar — ignore unofficial GB claims" },
  {
    label: "Frame rate",
    value: "Reported ~30 FPS on consoles (Rockstar North co-director via press) — no official 60 FPS mode page yet",
  },
  {
    label: "Resolution / graphics modes",
    value: "Not officially confirmed by Rockstar (PS5 Pro Enhanced badge only; no mode table)",
  },
  { label: "Map size / world metrics", value: "Not published as official numbers" },
  { label: "Official sensitivity menu", value: "Not shown publicly — calculator uses GTA 5-style labels" },
  { label: "Rating", value: "Not yet rated / Rating Pending (check ESRB / local board)" },
  {
    label: "PS5 features called out",
    value: "Tempest 3D Audio, fast SSD loading, DualSense haptics, adaptive triggers, controller speaker",
  },
  { label: "Where to buy", value: "PlayStation Store, Microsoft Store, Rockstar Warehouse, retailers" },
];

export const GTA6_PLATFORM_FEATURES = [
  {
    title: "PlayStation 5",
    body: "Sony lists PS5 and PS5 Pro Enhanced. DualSense haptic feedback, adaptive triggers, and the integrated speaker are called out for GTA VI. Tempest 3D Audio and the ultra-high-speed SSD are part of the “plays best on PS5” messaging. Offline play, Remote Play, optional in-game purchases, and 1 player are listed on the PlayStation store page.",
  },
  {
    title: "Xbox Series X|S",
    body: "Xbox lists Grand Theft Auto VI for Series X|S with the same November 19, 2026 launch window. Use this calculator’s Xbox Series path for controller look / aim / deadzone prep; console feature rows still mirror DualSense-style options so PS5 and Xbox players can compare feel.",
  },
  {
    title: "Sensitivity reality check",
    body: "Rockstar has not published the final in-game settings screen. Numbers here are a GTA 5-feel starting range for Explore, Shoot, and Drive presets — not official GTA 6 “best” values. Re-check after November 19, 2026.",
  },
] as const;

/** Explicit TBA block so “missing” topics are on-page without invented numbers. */
export const GTA6_NOT_CONFIRMED = {
  title: "Not confirmed yet",
  intro:
    "These are common questions. Until Rockstar or the console stores publish them, this page will not invent numbers.",
  items: [
    {
      title: "Install size (GB)",
      body: "No official download size on Rockstar / PlayStation / Xbox pages. Any exact GB figure online before store listing is unverified — do not trust “ISO” downloads.",
    },
    {
      title: "PC date & PC specs",
      body: "No PC SKU on the official VI page. Therefore there are no official minimum / recommended PC system requirements, DLSS/FSR options, or PC storage figures yet.",
    },
    {
      title: "60 FPS / performance modes",
      body: "Press coverage cites Rockstar North leadership describing ~30 FPS “for now” on consoles. Rockstar has not published a public performance-modes chart or a confirmed 60 FPS toggle.",
    },
    {
      title: "Resolution & ray tracing",
      body: "PS5 Pro Enhanced is listed, but Rockstar has not published an official resolution target or ray-tracing feature sheet. Trailer analysis from third parties is not an official spec.",
    },
    {
      title: "Map size & story length",
      body: "Leonida / Vice City are confirmed thematically. Exact square-mileage, mission count, or “hours of story” figures are not official public specs.",
    },
    {
      title: "GTA Online day-one",
      body: "Launch messaging focuses on the single-player story. Treat Online timing as separate until Rockstar announces it.",
    },
  ],
} as const;

export const GTA6_CALC_GUIDE = {
  title: "How to use this GTA 6 sensitivity calculator",
  steps: [
    "Pick PS5 or Xbox Series X|S.",
    "Choose Explore, Shoot, or Drive — the sliders fill with a starting range.",
    "Tune third-person and first-person look / aim, then deadzone and acceleration.",
    "Set haptic feedback, adaptive triggers, and controller speaker (PS5 DualSense-led options).",
    "Review sprint and targeting rows marked as preview until launch confirms them.",
    "Copy your values. Paste them into a note for day-one setup — do not treat them as official Rockstar presets.",
  ],
} as const;

export const GTA6_SEO_KEYWORDS = [
  "GTA 6 sensitivity calculator",
  "GTA VI controller settings",
  "GTA 6 PS5 sensitivity",
  "GTA 6 Xbox Series sensitivity",
  "GTA 6 deadzone",
  "GTA 6 aim sensitivity",
  "GTA 6 DualSense settings",
  "Grand Theft Auto VI sensitivity",
  "GTA 6 look sensitivity",
  "GTA 5 to GTA 6 sensitivity",
  "GTA 6 release date",
  "GTA 6 file size",
  "GTA 6 system requirements",
  "GTA 6 platforms",
  "GTA 6 map",
  "GTA 6 Vice City",
  "Leonida map",
] as const;
