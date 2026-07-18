"use client";

export type GyroType = "gyro" | "non-gyro";
export type PlayerRole = "balanced" | "assaulter" | "sniper";

export type CalculatorInput = {
  baseValue: number;
  ramMultiplier: number;
  gyroType: GyroType;
  ageMultiplier: number;
  fingerMultiplier: number;
  ipadView: boolean;
  fpsMultiplier: number;
  attachmentMultiplier: number;
  playerRole: PlayerRole;
  modelName: string;
};

export type ScopeResult = {
  name: string;
  camera: number;
  ads: number;
};

type ScopeDef = {
  name: string;
  camMul: number;
  adsMul: number;
  type: "low" | "mid" | "high";
};

const gyroScopes: ScopeDef[] = [
  { name: "TPP No Scope", camMul: 1.1, adsMul: 3.0, type: "low" },
  { name: "FPP No Scope", camMul: 1.0, adsMul: 2.8, type: "low" },
  { name: "FPP Aim (Laser Combo)", camMul: 0.95, adsMul: 2.6, type: "low" },
  { name: "Red Dot / Laser Sight", camMul: 0.8, adsMul: 3.0, type: "low" },
  { name: "2x Scope", camMul: 0.6, adsMul: 2.2, type: "low" },
  { name: "3x Scope", camMul: 0.35, adsMul: 1.8, type: "mid" },
  { name: "4x Scope", camMul: 0.28, adsMul: 1.5, type: "high" },
  { name: "6x Scope", camMul: 0.18, adsMul: 1.0, type: "high" },
  { name: "8x Scope", camMul: 0.1, adsMul: 0.7, type: "high" },
];

const nonGyroScopes: ScopeDef[] = [
  { name: "TPP No Scope", camMul: 1.0, adsMul: 1.0, type: "low" },
  { name: "FPP No Scope", camMul: 0.9, adsMul: 0.9, type: "low" },
  { name: "FPP Aim (Laser Combo)", camMul: 0.85, adsMul: 0.85, type: "low" },
  { name: "Red Dot / Laser Sight", camMul: 0.5, adsMul: 0.6, type: "low" },
  { name: "2x Scope", camMul: 0.36, adsMul: 0.4, type: "low" },
  { name: "3x Scope", camMul: 0.27, adsMul: 0.3, type: "mid" },
  { name: "4x Scope", camMul: 0.22, adsMul: 0.25, type: "high" },
  { name: "6x Scope", camMul: 0.14, adsMul: 0.16, type: "high" },
  { name: "8x Scope", camMul: 0.1, adsMul: 0.12, type: "high" },
];

function getModelMultiplier(modelName: string) {
  const name = modelName.toLowerCase();
  if (name.includes("iphone") || name.includes("rog")) return 0.95;
  if (name.includes("poco")) return 1.05;
  return 1.0;
}

function getRoleMultiplier(role: PlayerRole, scopeType: ScopeDef["type"]) {
  if (role === "assaulter") {
    if (scopeType === "low") return 1.05;
    if (scopeType === "mid") return 1.03;
  } else if (role === "sniper") {
    if (scopeType === "high") return 0.9;
    if (scopeType === "mid") return 0.95;
  }
  return 1.0;
}

function clampSens(value: number) {
  return Math.min(Math.max(Math.round(value), 10), 400);
}

/** Same math as provided HTML calculator (no formula changes). */
export function calculateSensitivity(input: CalculatorInput): ScopeResult[] {
  const ipadMultiplier = input.ipadView ? 1.15 : 1.0;
  const modelMultiplier = getModelMultiplier(input.modelName);

  const finalBase =
    input.baseValue *
    input.ageMultiplier *
    input.fingerMultiplier *
    input.ramMultiplier *
    modelMultiplier *
    ipadMultiplier *
    input.fpsMultiplier *
    input.attachmentMultiplier;

  const scopes = input.gyroType === "gyro" ? gyroScopes : nonGyroScopes;

  return scopes.map((scope) => {
    const roleMul = getRoleMultiplier(input.playerRole, scope.type);
    return {
      name: scope.name,
      camera: clampSens(finalBase * scope.camMul * roleMul),
      ads: clampSens(finalBase * scope.adsMul * roleMul),
    };
  });
}
