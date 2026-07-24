/**
 * Next Free Fire update teaser (OB55).
 * Not official Garena copy — update when Garena announces OB55.
 * CTAs stay on this website only.
 */
export const FF_NEXT_UPDATE = {
  badge: "Next Update",
  code: "OB55",
  title: "Free Fire OB55 — Coming Soon",
  meta: "Expected Aug–Sep 2026",
  metaIso: "2026-08-01",
  summary:
    "The next major patch after OB54. Exact date and features will be confirmed when Garena announces OB55.",
  features: [
    "Advance Server testing expected before the global release",
    "Possible new close-range weapon (community leaks — not confirmed)",
    "Weapon & character balance changes",
    "New events, bundles, and bug-fix improvements",
    "Recalculate sensitivity here after the patch goes live",
  ],
  note: "Unofficial preview — final details come from Garena only.",
  primaryPath: "/news",
  primaryCta: "Follow on news",
  secondaryPath: "/#ff-calculator",
  secondaryCta: "Open calculator",
} as const;

/** Max page copy — same OB cycle, written for Free Fire Max players. */
export const FF_MAX_NEXT_UPDATE = {
  badge: "Max Update",
  code: "OB55",
  title: "Free Fire Max OB55 — What to expect",
  meta: "Expected Aug–Sep 2026",
  metaIso: "2026-08-01",
  summary:
    "When OB55 lands, Max still runs heavier graphics than classic Free Fire. Aim can feel different after the patch — don’t reuse old classic FF numbers blindly.",
  features: [
    "Same OB55 drop for Max — but FPS dips hit harder on mid-range phones",
    "If fights feel sticky after update, drop effects first, then retune General",
    "Weapon / character balance will need a fresh Max sensi check",
    "Advance Server builds usually show up before the global Max update",
    "Use this Max calculator again once the patch is live on your region",
  ],
  note: "",
  primaryPath: "/news",
  primaryCta: "Follow Max news",
  secondaryPath: "/free-fire-max-sensitivity-settings-calculator#ff-calculator",
  secondaryCta: "Open Max calculator",
} as const;
