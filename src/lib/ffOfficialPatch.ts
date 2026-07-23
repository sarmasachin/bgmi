/**
 * Home Free Fire update strip — links ONLY to this website (e.g. /news).
 * When you publish a new OB news post, set `articlePath` to that slug.
 */
export const FF_SITE_PATCH = {
  code: "OB54",
  label: "OB54 Update Ready",
  dateLabel: "23 Jun 2026",
  dateIso: "2026-06-23",
  typeLabel: "Patch Notes",
  summary: "9th Anniversary update with Skill Boost, Weapon Awakening & match updates.",
  /** Primary button → your news article (update slug after you publish). */
  articlePath: "/news",
  /** Secondary button → news list on this site. */
  newsListPath: "/news",
  primaryCta: "Read Patch notes",
  secondaryCta: "All patch notes",
} as const;

/** @deprecated use FF_SITE_PATCH */
export const FF_OFFICIAL_PATCH = FF_SITE_PATCH;
