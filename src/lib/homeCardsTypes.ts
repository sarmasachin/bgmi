/** Editable page card sections — Free Fire, FF Max, BGMI, PUBG, PUBG Mobile Code. */

export const PAGE_CARDS_VARIANTS = [
  {
    id: "freefire",
    label: "Free Fire",
    previewPath: "/",
    hint: "Home page (/) sections",
  },
  {
    id: "freefire-max",
    label: "Free Fire Max",
    previewPath: "/free-fire-max-sensitivity-settings-calculator",
    hint: "Max calculator page sections",
  },
  {
    id: "bgmi",
    label: "BGMI",
    previewPath: "/bgmi",
    hint: "BGMI calculator page SEO + hero",
  },
  {
    id: "pubg",
    label: "PUBG",
    previewPath: "/pubg",
    hint: "PUBG calculator page SEO + hero",
  },
  {
    id: "pubg-mobile-codes",
    label: "PUBG Mobile Code",
    previewPath: "/pubg-mobile-codes",
    hint: "PUBG Mobile Code page SEO + hero",
  },
] as const;

export type PageCardsVariant = (typeof PAGE_CARDS_VARIANTS)[number]["id"];

export const HOME_CARD_SECTIONS = [
  { id: "seo", label: "SEO" },
  { id: "hero", label: "Hero title" },
  { id: "patchStrip", label: "Patch strip" },
  { id: "playModes", label: "Play modes" },
  { id: "nextUpdate", label: "Next update card" },
  { id: "advanceServer", label: "Advance Server card" },
  { id: "roleTips", label: "Role tips" },
  { id: "season", label: "Season banner" },
  { id: "proTips", label: "Pro tips" },
  { id: "howItWorks", label: "How it works" },
  { id: "comparison", label: "Comparison tables" },
  { id: "explore", label: "Explore calculators" },
] as const;

/** Max page has no play-modes / how-it-works blocks. */
export const MAX_CARD_SECTIONS = [
  { id: "seo", label: "SEO" },
  { id: "hero", label: "Hero title" },
  { id: "patchStrip", label: "Patch strip" },
  { id: "nextUpdate", label: "Next update card" },
  { id: "advanceServer", label: "Advance Server card" },
  { id: "roleTips", label: "Role tips" },
  { id: "season", label: "Season banner" },
  { id: "proTips", label: "Pro tips" },
  { id: "comparison", label: "Comparison tables" },
  { id: "explore", label: "Explore calculators" },
] as const;

/** BGMI / PUBG page cards currently drive SEO + H1 only. */
export const BGMI_CARD_SECTIONS = [
  { id: "seo", label: "SEO" },
  { id: "hero", label: "Hero title" },
] as const;

export const PUBG_CARD_SECTIONS = [
  { id: "seo", label: "SEO" },
  { id: "hero", label: "Hero title" },
] as const;

export type HomeCardSectionId = (typeof HOME_CARD_SECTIONS)[number]["id"];
export type MaxCardSectionId = (typeof MAX_CARD_SECTIONS)[number]["id"];
export type BgmiCardSectionId = (typeof BGMI_CARD_SECTIONS)[number]["id"];
export type PubgCardSectionId = (typeof PUBG_CARD_SECTIONS)[number]["id"];

export type FfHomeHero = {
  title: string;
};

export type FfHomeSeo = {
  description: string;
  keywords: string[];
};

export type FfHomePatchStrip = {
  code: string;
  label: string;
  dateLabel: string;
  dateIso: string;
  typeLabel: string;
  summary: string;
  articlePath: string;
  newsListPath: string;
  primaryCta: string;
  secondaryCta: string;
};

export type FfHomePlayMode = {
  id: string;
  label: string;
  blurb: string;
  icon: string;
  role: "rusher" | "sniper" | "flanker" | "headshot";
};

export type FfHomePlayModes = {
  title: string;
  lead: string;
  modes: FfHomePlayMode[];
};

export type FfHomeFeatureCard = {
  badge: string;
  code: string;
  title: string;
  meta: string;
  metaIso?: string;
  summary: string;
  features: string[];
  note: string;
  primaryPath?: string;
  primaryCta: string;
  secondaryPath: string;
  secondaryCta: string;
  officialUrl?: string;
};

export type FfHomeRoleTip = {
  role: "rusher" | "sniper" | "flanker" | "headshot";
  title: string;
  icon: string;
  /** Optional intro under the card title. */
  lead?: string;
  tips: string[];
  buttonLabel: string;
  /** When false, CTA only scrolls (and optional focus) — does not change Player Role. */
  applyRole?: boolean;
  /** Optional calculator control to focus after scroll (e.g. ffc-dpi). */
  focusControlId?: string;
};

export type FfHomeRoleTips = {
  title: string;
  items: FfHomeRoleTip[];
};

export type FfHomeSeason = {
  badge: string;
  title: string;
  summary: string;
  dateLabel: string;
  dateIso: string;
  ctaPath: string;
  ctaLabel: string;
  secondaryPath: string;
  secondaryLabel: string;
};

export type FfHomeProTip = {
  id: string;
  title: string;
  tip: string;
  icon: string;
};

export type FfHomeProTips = {
  title: string;
  lead: string;
  ctaLabel: string;
  items: FfHomeProTip[];
};

export type FfHomeHowStep = {
  title: string;
  icon: string;
  bullets: string[];
};

export type FfHomeHowItWorks = {
  title: string;
  subtitle: string;
  steps: FfHomeHowStep[];
};

export type FfHomeCompareRow = {
  icon: string;
  point: string;
  freefire: string;
  freefireMax: string;
};

export type FfHomeRamRow = {
  icon: string;
  ram: string;
  general: string;
  redDot: string;
  scope2x: string;
  scope4x: string;
  sniper: string;
  freeLook: string;
};

export type FfHomeComparison = {
  title: string;
  ctaBeforeLink: string;
  ctaLinkLabel: string;
  ctaHref: string;
  ramTitle: string;
  note: string;
  vsRows: FfHomeCompareRow[];
  ramRows: FfHomeRamRow[];
};

export type FfHomeExploreCard = {
  title: string;
  text: string;
  points: string[];
  buttonLabel: string;
  href: string;
};

export type FfHomeExplore = {
  title: string;
  freefire: FfHomeExploreCard;
  freefireMax: FfHomeExploreCard;
};

/** Shared card payload shape (Max keeps unused playModes/howItWorks/seo as stubs). */
export type FfHomeCards = {
  seo: FfHomeSeo;
  hero: FfHomeHero;
  patchStrip: FfHomePatchStrip;
  playModes: FfHomePlayModes;
  nextUpdate: FfHomeFeatureCard;
  advanceServer: FfHomeFeatureCard;
  roleTips: FfHomeRoleTips;
  season: FfHomeSeason;
  proTips: FfHomeProTips;
  howItWorks: FfHomeHowItWorks;
  comparison: FfHomeComparison;
  explore: FfHomeExplore;
};

export type FfPageCards = FfHomeCards;
