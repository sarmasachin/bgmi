"use client";

import type { GyroType, PlayerRole } from "./calculator";

export type LiteCalculatorInput = {
  baseValue: number;
  ramMultiplier: number;
  gyroType: GyroType;
  ageMultiplier: number;
  fingerMultiplier: number;
  fpsMultiplier: number;
  playerRole: PlayerRole;
  modelName: string;
  /** Prefer Scope On on budget phones (UI tip only; math uses gyroType). */
  gyroMode: "off" | "scope-on" | "always-on";
};

export type LiteScopeResult = {
  name: string;
  camera: number;
  ads: number;
  gyro: number;
};

type LiteScopeDef = {
  name: string;
  camMul: number;
  adsMul: number;
  gyroMul: number;
  type: "low" | "mid" | "high";
};

/**
 * Multipliers calibrated so default Lite inputs (2GB, 60 FPS, 2-finger, base 120)
 * land near researched PUBG Mobile Lite / low-end BGMI ranges for Camera, ADS, Gyro.
 * Sources: Sportskeeda Lite 2GB guide; low-end 30–60 FPS gyro guides (Scope On, lower gyro).
 */
const liteScopes: LiteScopeDef[] = [
  { name: "TPP No Scope", camMul: 0.9, adsMul: 0.9, gyroMul: 1.25, type: "low" },
  { name: "FPP No Scope", camMul: 0.82, adsMul: 0.82, gyroMul: 1.2, type: "low" },
  { name: "Red Dot / Holo", camMul: 0.43, adsMul: 0.44, gyroMul: 1.25, type: "low" },
  { name: "2x Scope", camMul: 0.26, adsMul: 0.26, gyroMul: 0.92, type: "low" },
  { name: "3x Scope", camMul: 0.2, adsMul: 0.2, gyroMul: 0.92, type: "mid" },
  { name: "4x Scope / VSS", camMul: 0.165, adsMul: 0.18, gyroMul: 0.86, type: "high" },
  { name: "6x Scope", camMul: 0.112, adsMul: 0.112, gyroMul: 0.69, type: "high" },
  { name: "8x Scope", camMul: 0.079, adsMul: 0.079, gyroMul: 0.59, type: "high" },
];

function getModelMultiplier(modelName: string) {
  const name = modelName.toLowerCase();
  if (name.includes("iphone") || name.includes("ipad")) return 0.94;
  if (name.includes("infinix") || name.includes("tecno") || name.includes("itel")) return 1.06;
  if (name.includes("redmi") || name.includes("realme") || name.includes("vivo")) return 1.03;
  if (name.includes("poco")) return 1.02;
  return 1.0;
}

function getRoleMultiplier(role: PlayerRole, scopeType: LiteScopeDef["type"]) {
  if (role === "assaulter") {
    if (scopeType === "low") return 1.04;
    if (scopeType === "mid") return 1.02;
  } else if (role === "sniper") {
    if (scopeType === "high") return 0.92;
    if (scopeType === "mid") return 0.96;
  }
  return 1.0;
}

function clampSens(value: number) {
  return Math.min(Math.max(Math.round(value), 10), 400);
}

/** Non-gyro: gyro column stays low/usable if player enables Scope On later. */
function gyroScale(gyroType: GyroType, gyroMode: LiteCalculatorInput["gyroMode"]) {
  if (gyroType === "non-gyro" || gyroMode === "off") return 0.35;
  if (gyroMode === "always-on") return 1.08;
  return 1.0;
}

export function calculateLiteSensitivity(input: LiteCalculatorInput): LiteScopeResult[] {
  const modelMultiplier = getModelMultiplier(input.modelName);
  const finalBase =
    input.baseValue *
    input.ageMultiplier *
    input.fingerMultiplier *
    input.ramMultiplier *
    modelMultiplier *
    input.fpsMultiplier;

  const gScale = gyroScale(input.gyroType, input.gyroMode);

  return liteScopes.map((scope) => {
    const roleMul = getRoleMultiplier(input.playerRole, scope.type);
    return {
      name: scope.name,
      camera: clampSens(finalBase * scope.camMul * roleMul),
      ads: clampSens(finalBase * scope.adsMul * roleMul),
      gyro: clampSens(finalBase * scope.gyroMul * roleMul * gScale),
    };
  });
}
