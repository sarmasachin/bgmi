/**
 * Home season / event banner config.
 * Non-official copy only — CTAs stay on this website (/news).
 * Update when a new season or event guide is published.
 */
export const FF_SEASON_EVENT = {
  badge: "Season Event",
  title: "9th Anniversary Season",
  summary:
    "Tune sensitivity for anniversary modes and seasonal fights — then read our guides for the current update.",
  dateLabel: "Jun 2026",
  dateIso: "2026-06-01",
  /** Primary CTA → news / guides on this site only. */
  ctaPath: "/news",
  ctaLabel: "Read season guides",
  secondaryPath: "/#ff-calculator",
  secondaryLabel: "Open calculator",
} as const;
