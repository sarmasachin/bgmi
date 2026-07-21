/** Free Fire / FF Max sensitivity calculator — pure logic (no DOM). */

export type DeviceHardware = {
  tier: string;
  touchHz: number;
  multiplier: number;
};

// TOP 30 DEVICE HARDWARE DATABASE
export const deviceDatabase: Record<string, DeviceHardware> = {
  "iPhone 15 Pro / Max": { tier: "flagship", touchHz: 300, multiplier: 0.92 },
  "iPhone 14 / 13": { tier: "flagship", touchHz: 240, multiplier: 0.94 },
  "iPhone 11 / 12": { tier: "flagship", touchHz: 120, multiplier: 0.96 },
  "ASUS ROG Phone 8 / 7": { tier: "flagship", touchHz: 720, multiplier: 0.9 },
  "iQOO Neo 9 Pro": { tier: "gaming", touchHz: 300, multiplier: 0.93 },
  "iQOO 12 / 11": { tier: "flagship", touchHz: 300, multiplier: 0.92 },
  "iQOO Z7 / Z9": { tier: "midrange", touchHz: 240, multiplier: 0.97 },
  "Poco X6 Pro": { tier: "gaming", touchHz: 480, multiplier: 0.93 },
  "Poco F5 / F6": { tier: "gaming", touchHz: 480, multiplier: 0.93 },
  "Poco M6 / M5": { tier: "budget", touchHz: 240, multiplier: 1.04 },
  "OnePlus 12 / 11": { tier: "flagship", touchHz: 240, multiplier: 0.93 },
  "OnePlus Nord CE 4 / 3": { tier: "midrange", touchHz: 210, multiplier: 0.97 },
  "Realme GT 6 / 5": { tier: "gaming", touchHz: 360, multiplier: 0.94 },
  "Realme Narzo 60 / 70": { tier: "midrange", touchHz: 180, multiplier: 0.98 },
  "Realme C53 / C55": { tier: "budget", touchHz: 180, multiplier: 1.06 },
  "Redmi Note 13 Pro": { tier: "midrange", touchHz: 210, multiplier: 0.96 },
  "Redmi Note 12 / 11": { tier: "midrange", touchHz: 240, multiplier: 0.98 },
  "Redmi 12C / 13C": { tier: "budget", touchHz: 120, multiplier: 1.07 },
  "Samsung Galaxy S24 / S23": { tier: "flagship", touchHz: 240, multiplier: 0.93 },
  "Samsung Galaxy A55 / A35": { tier: "midrange", touchHz: 240, multiplier: 0.97 },
  "Samsung Galaxy M14 / F14": { tier: "budget", touchHz: 180, multiplier: 1.05 },
  "Vivo T3 / T2 Pro": { tier: "midrange", touchHz: 300, multiplier: 0.96 },
  "Vivo Y20 / Y16": { tier: "budget", touchHz: 120, multiplier: 1.08 },
  "Infinix GT 20 Pro": { tier: "gaming", touchHz: 360, multiplier: 0.94 },
  "Infinix Smart 8 / Hot 40": { tier: "budget", touchHz: 180, multiplier: 1.07 },
  "Tecno Pova 6 Pro": { tier: "midrange", touchHz: 360, multiplier: 0.96 },
  "Tecno Spark 20": { tier: "budget", touchHz: 180, multiplier: 1.06 },
  "Motorola Edge 50 / 40": { tier: "midrange", touchHz: 360, multiplier: 0.95 },
  "Moto G54 / G34": { tier: "midrange", touchHz: 240, multiplier: 0.98 },
  "Nothing Phone (2) / (2a)": { tier: "midrange", touchHz: 240, multiplier: 0.95 },
};

export const deviceNames = Object.keys(deviceDatabase);

// SMART KEYWORD ENGINE
export function getHardwareFromKeyword(name: string): {
  tier: string;
  multiplier: number;
} {
  const str = name.toLowerCase();
  if (
    str.includes("iphone") ||
    str.includes("ipad") ||
    str.includes("rog") ||
    str.includes("s24") ||
    str.includes("s23") ||
    str.includes("ultra") ||
    str.includes("black shark")
  ) {
    return { tier: "Detected: Flagship Tier", multiplier: 0.93 };
  } else if (
    str.includes("poco x") ||
    str.includes("poco f") ||
    str.includes("iqoo") ||
    str.includes("nord") ||
    str.includes("gt") ||
    str.includes("edge") ||
    str.includes("pova") ||
    str.includes("pro")
  ) {
    return { tier: "Detected: Mid-Gaming Tier", multiplier: 0.96 };
  } else if (
    str.includes("redmi a") ||
    str.includes("realme c") ||
    str.includes("galaxy m") ||
    str.includes("smart") ||
    str.includes("spark") ||
    str.includes("narzo") ||
    str.includes("play")
  ) {
    return { tier: "Detected: Budget Hardware", multiplier: 1.06 };
  }
  return { tier: "Detected: Standard Android", multiplier: 1.0 };
}

/** Badge label for the device input (auto hardware detection). */
export function detectHardwareTier(name: string): string | null {
  const inputVal = name.trim();
  if (!inputVal) return null;
  const known = deviceDatabase[inputVal];
  if (known) return `Verified Hardware (${known.touchHz}Hz Touch)`;
  return getHardwareFromKeyword(inputVal).tier;
}

export const AGE_ERROR_MESSAGE = "⚠️ Enter a value from 0.1 to 12!";

/** Returns parsed age, or null if invalid (empty / NaN / out of 0.1–12). */
export function validateAge(rawAge: string): number | null {
  const trimmed = rawAge.trim();
  const ageVal = parseFloat(trimmed);
  if (trimmed === "" || isNaN(ageVal) || ageVal < 0.1 || ageVal > 12) {
    return null;
  }
  return ageVal;
}

export type CalcInputs = {
  deviceName: string;
  profile: "custom" | "high" | "standard" | "low";
  deviceAge: number;
  ram: number;
  dpi: "nodpi" | "mid" | "high";
  fps: "30" | "60" | "90" | "120";
  fingers: number;
  role: "rusher" | "sniper" | "flanker" | "headshot";
  grip: "no-grip" | "foregrip3" | "bipod";
};

export type CalcResults = {
  general: number;
  redDot: number;
  scope2x: number;
  scope4x: number;
  sniper: number;
  freeLook: number;
  fireButton: string;
};

// PERFECTED MATHEMATICAL CALCULATION ENGINE
export function calculateSensitivity(inputs: CalcInputs): CalcResults {
  const { deviceName, profile, deviceAge, ram, dpi, fps, fingers, role, grip } =
    inputs;

  // Device Base Hardware Multiplier
  const devName = deviceName.trim();
  const devHardware = deviceDatabase[devName] || getHardwareFromKeyword(devName);
  const devMult = devHardware.multiplier;

  // REAL PRO SENSITIVITY BASE
  let baseGen = 180,
    baseRd = 165,
    baseS2 = 145,
    baseS4 = 135,
    baseSnp = 85,
    baseFl = 130;

  if (profile === "low") {
    baseGen = 165;
    baseRd = 145;
    baseS2 = 125;
    baseS4 = 115;
    baseSnp = 70;
    baseFl = 110;
  } else if (profile === "high") {
    baseGen = 192;
    baseRd = 180;
    baseS2 = 160;
    baseS4 = 150;
    baseSnp = 95;
    baseFl = 150;
  }

  // 1. INVERSE HARDWARE BOOST
  let hardwareBoost = 0;

  if (ram <= 3) hardwareBoost += 0.08;
  else if (ram === 4) hardwareBoost += 0.05;
  else if (ram === 6) hardwareBoost += 0.02;
  else if (ram === 8) hardwareBoost += 0.0;
  else if (ram >= 12) hardwareBoost -= 0.03;

  if (fps === "30") hardwareBoost += 0.06;
  else if (fps === "60") hardwareBoost += 0.01;
  else if (fps === "90") hardwareBoost -= 0.02;
  else if (fps === "120") hardwareBoost -= 0.04;

  // iOS Smart Age Compensation
  const isIOS =
    devName.toLowerCase().includes("iphone") ||
    devName.toLowerCase().includes("ipad");
  const ageMultiplier = isIOS ? 0.004 : 0.01;
  hardwareBoost += deviceAge * ageMultiplier;

  // DPI Adjustment
  if (dpi === "high") hardwareBoost -= 0.08;
  else if (dpi === "mid") hardwareBoost -= 0.04;

  // Total Combined Multiplier
  const totalMult = devMult + hardwareBoost;

  // Apply Hardware Multipliers
  let gen = baseGen * totalMult;
  let rd = baseRd * totalMult;
  let s2 = baseS2 * totalMult;
  let s4 = baseS4 * totalMult;
  let snp = baseSnp * totalMult;
  let fl = baseFl * totalMult;

  // 2. PLAYER ROLE ADJUSTMENTS
  if (role === "headshot") {
    gen *= 1.05;
    rd *= 1.08;
  } else if (role === "sniper") {
    snp *= 1.2;
    gen *= 0.95;
    rd *= 0.92;
    s2 *= 0.92;
    s4 *= 0.92;
  } else if (role === "rusher") {
    gen *= 1.03;
    fl *= 1.1;
  } else if (role === "flanker") {
    gen *= 1.01;
    fl *= 1.12;
  }

  // 3. ATTACHMENT ADJUSTMENTS
  if (grip === "no-grip") {
    rd *= 1.04;
    s2 *= 1.04;
  } else if (grip === "foregrip3") {
    rd *= 0.96;
    s2 *= 0.96;
  } else if (grip === "bipod") {
    rd *= 0.98;
    s2 *= 0.98;
    s4 *= 0.98;
  }

  // High DPI Safety Dampener
  if (dpi === "high") {
    gen = Math.min(gen, 160);
    rd = Math.min(rd, 145);
  } else if (dpi === "mid") {
    gen = Math.min(gen, 178);
  }

  // 4. FIRE BUTTON SIZE LOGIC
  let btn = 48;
  if (fingers === 2) btn = 42;
  else if (fingers === 3) btn = 46;
  else if (fingers === 4) btn = 52;

  if (role === "headshot") btn -= 4;
  if (ram <= 4) btn += 3;

  // Strict 0-200 Free Fire Scale Limiter
  const limit = (v: number) => Math.min(200, Math.max(20, Math.round(v)));

  return {
    general: limit(gen),
    redDot: limit(rd),
    scope2x: limit(s2),
    scope4x: limit(s4),
    sniper: limit(snp),
    freeLook: limit(fl),
    fireButton: Math.min(65, Math.max(35, btn)) + "%",
  };
}
