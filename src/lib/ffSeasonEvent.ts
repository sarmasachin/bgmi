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

/** Max page season banner — Max-focused wording. */
export const FF_MAX_SEASON_EVENT = {
  badge: "Max Season",
  title: "Anniversary modes on Free Fire Max",
  summary:
    "Season events hit harder on Max if your FPS dips. Lock a stable Max sensi first, then grind the anniversary modes.",
  dateLabel: "Jun 2026",
  dateIso: "2026-06-01",
  ctaPath: "/news",
  ctaLabel: "Read Max guides",
  secondaryPath: "/free-fire-max-sensitivity-settings-calculator#ff-calculator",
  secondaryLabel: "Open Max calculator",
} as const;
