/** Free Fire calculator trust bar under the tool (admin-editable). */

export type FfTrustBarItem = { label: string; sublabel: string };

export const DEFAULT_FF_TRUST_BAR: FfTrustBarItem[] = [
  { label: "10,000+ Devices", sublabel: "All RAM Phones" },
  { label: "Auto Headshot Ready", sublabel: "One-Tap Tuned" },
  { label: "100% Free", sublabel: "No Login Needed" },
  { label: "OB54 Update Ready", sublabel: "DPI + Sensitivity" },
];

export const FF_TRUST_BAR_ICONS = [
  "fa-gamepad",
  "fa-bullseye",
  "fa-trophy",
  "fa-bolt",
] as const;
