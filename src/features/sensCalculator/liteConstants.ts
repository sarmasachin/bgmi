/** Budget-first phone suggestions for BGMI Lite (2GB–4GB class). */
export const LITE_DEFAULT_PHONE_MODELS = [
  "Redmi 9A",
  "Redmi 9C",
  "Redmi Note 8",
  "Realme C11",
  "Realme Narzo 50A",
  "Infinix Hot 10",
  "Infinix Smart 6",
  "Tecno Spark 7",
  "Samsung Galaxy A03",
  "Samsung Galaxy M12",
  "Vivo Y12",
  "OPPO A15",
  "Poco C31",
  "Poco M2",
] as const;

export const liteRamOptions = [
  { label: "2 GB", value: 1.15 },
  { label: "3 GB", value: 1.12 },
  { label: "4 GB", value: 1.08 },
  { label: "6 GB", value: 1.04 },
  { label: "8 GB+", value: 1.0 },
];

/** Lite targets stable 30–60 FPS; 90/120 rare on entry phones. */
export const liteFpsOptions = [
  { label: "30 FPS", value: 1.08 },
  { label: "40 FPS", value: 1.04 },
  { label: "60 FPS", value: 1.0 },
];

export const liteGyroModeOptions = [
  { label: "Off (thumb only)", value: "off" as const },
  { label: "Scope On (recommended)", value: "scope-on" as const },
  { label: "Always On", value: "always-on" as const },
];

export const litePlayerRoleOptions = [
  { label: "Balanced", value: "balanced" as const },
  { label: "Rusher / Close fight", value: "assaulter" as const },
  { label: "Mid-long / Support", value: "sniper" as const },
];

export const liteAgeOptions = [
  { label: "1 year (new)", value: 1.0 },
  { label: "2–3 years", value: 1.06 },
  { label: "4–5 years", value: 1.12 },
  { label: "6+ years", value: 1.2 },
];

export const liteFingerOptions = [
  { label: "2-Finger (thumbs)", value: 1.1 },
  { label: "3-Finger", value: 1.04 },
  { label: "4-Finger claw", value: 1.0 },
];
