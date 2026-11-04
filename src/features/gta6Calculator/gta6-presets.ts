/** GTA 6 controller starting ranges. Not official Rockstar values. */

export type PresetId = "explore" | "shoot" | "drive";
export type PlatformId = "ps5" | "xbox";

export type Gta6Preset = {
  id: PresetId;
  label: string;
  blurb: string;
  look: number;
  aimRatio: number;
  accel: number;
  deadzone: number;
};

export type Gta6Console = {
  haptic: "off" | "low" | "high";
  triggers: "off" | "low" | "high";
  speaker: "on" | "off";
  sprint: "l3";
  targeting: "free";
  zoomMove: "on" | "off";
  driveBy: "aim-fire" | "aim";
  invert: "on" | "off";
  controlType: "standard" | "fps" | "southpaw";
};

export type Gta6Numbers = {
  look3: number;
  aim3: number;
  look1: number;
  deadzone3: number;
  deadzone1: number;
  accel3: number;
  accel1: number;
  aim1: number;
};

export const GTA6_PRESETS: readonly Gta6Preset[] = [
  {
    id: "explore",
    label: "Explore",
    blurb: "High look, slower aim, for Leonida on foot.",
    look: 70,
    aimRatio: 0.5,
    accel: 50,
    deadzone: 8,
  },
  {
    id: "shoot",
    label: "Shoot",
    blurb: "Aim stays closer to look for gunfights.",
    look: 85,
    aimRatio: 0.8,
    accel: 100,
    deadzone: 8,
  },
  {
    id: "drive",
    label: "Drive",
    blurb: "Lower look and acceleration for long drives.",
    look: 55,
    aimRatio: 0.65,
    accel: 35,
    deadzone: 10,
  },
];

export function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function optionalPercent(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const value = Number(trimmed);
  if (!Number.isFinite(value)) return null;
  return clampPercent(value);
}

/** Optional third-person look overrides look3 only. aim3 = round(look3 × ratio). First-person stays on the preset. deadzone = drift + 2. */
export function applyGta6Preset(presetId: PresetId, thirdLook: string, drift: string): Gta6Numbers {
  const preset = GTA6_PRESETS.find((item) => item.id === presetId) ?? GTA6_PRESETS[0];
  const typedLook = optionalPercent(thirdLook);
  const look3 = typedLook ?? preset.look;
  const look1 = preset.look;
  const measured = optionalPercent(drift);
  const deadzone = measured === null ? preset.deadzone : clampPercent(measured + 2);
  return {
    look3,
    aim3: clampPercent(look3 * preset.aimRatio),
    look1,
    aim1: clampPercent(look1 * preset.aimRatio),
    deadzone3: deadzone,
    deadzone1: deadzone,
    accel3: preset.accel,
    accel1: preset.accel,
  };
}
