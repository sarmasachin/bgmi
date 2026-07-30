/**
 * Home Free Fire update strip — links ONLY to this website (e.g. /news).
 * When you publish a new OB news post, set `articlePath` to that slug.
 */
export const FF_SITE_PATCH = {
  code: "OB54",
  label: "OB54 Update Ready",
  dateLabel: "23 Jun 2026",
  dateIso: "2026-06-23",
  typeLabel: "FF Update",
  summary:
    "Season update is live — if aim feels different, recalculate your sensi and test in Training Ground.",
  /** Primary button → your news article (update slug after you publish). */
  articlePath: "/news",
  /** Secondary button → news list on this site. */
  newsListPath: "/news",
  primaryCta: "See what's new",
  secondaryCta: "More news",
} as const;

/** Max page strip — same patch, Max player angle. */
export const FF_MAX_SITE_PATCH = {
  code: "OB54",
  label: "OB54 on Free Fire Max",
  dateLabel: "23 Jun 2026",
  dateIso: "2026-06-23",
  typeLabel: "FF Update",
  summary:
    "Max players: if drag feels off after the season update, recalculate for Max (not classic Free Fire).",
  articlePath: "/news",
  newsListPath: "/news",
  primaryCta: "See what's new",
  secondaryCta: "More news",
} as const;

/** @deprecated use FF_SITE_PATCH */
export const FF_OFFICIAL_PATCH = FF_SITE_PATCH;
