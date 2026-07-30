/**
 * Free Fire Advance Server info defaults (home/Max cards if enabled).
 * No publisher / Garena outbound URLs.
 */
export const FF_ADVANCE_SERVER = {
  badge: "Advance Server",
  code: "OB55",
  title: "Free Fire Advance Server — info guide",
  meta: "Fan-made guide · Android beta info",
  summary:
    "Learn what Free Fire Advance Server is and how the usual OB beta cycle works. We do not host APKs or link to publisher download pages.",
  features: [
    "Info-only guide — not a Free Fire / Garena publisher page",
    "Registration and downloads happen only on the publisher’s own portal",
    "Activation code is required after selection — not guaranteed",
    "Android only (no iOS) · separate beta app, main account progress stays safe",
    "OB55 Advance Server is expected before the global OB55 update (dates may change)",
    "Never buy codes or install APKs from third-party / random sites",
  ],
  note: "We do not host APK files and we do not link to publisher download pages.",
  officialUrl: "",
  primaryCta: "Read Advance Server guide",
  secondaryPath: "/news",
  secondaryCta: "Read guides",
} as const;

/** Max page — same info-only approach. */
export const FF_MAX_ADVANCE_SERVER = {
  badge: "Advance Server",
  code: "OB55",
  title: "Advance Server info — then retune Free Fire Max sensi",
  meta: "Fan-made guide · Android beta info",
  summary:
    "Advance Server is the early OB test build. After you learn what changed, come back here and recalculate — Max aim often feels heavier than classic Free Fire.",
  features: [
    "Info only — use the publisher’s own portal for register / download",
    "Use the Google or Facebook account tied to your Free Fire / Max ID",
    "Selection is not guaranteed — wait for your activation code",
    "Beta is Android-only and separate from your main Max install",
    "After you feel new OB weapons, recalculate on this Max page",
    "Skip random APK sites — they are not safe",
  ],
  note: "We do not host APKs or link to publisher download pages.",
  officialUrl: "",
  primaryCta: "Read Advance Server guide",
  secondaryPath: "/news",
  secondaryCta: "Read Max guides",
} as const;
