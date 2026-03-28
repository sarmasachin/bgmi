"use client";

export type CalculatorInput = {
  baseValue: number;
  ramMultiplier: number;
  gyroMultiplier: number;
  ageMultiplier: number;
  fingerMultiplier: number;
  ipadView: boolean;
  fps90: boolean;
  modelName: string;
};

export type ScopeResult = {
  name: string;
  camera: number;
  ads: number;
};

const scopes = [
  { name: "Red Dot", multiplier: 0.7 },
  { name: "2x Scope", multiplier: 0.5 },
  { name: "3x Scope", multiplier: 0.32 },
  { name: "4x Scope", multiplier: 0.25 },
  { name: "6x Scope", multiplier: 0.18 },
  { name: "8x Scope", multiplier: 0.08 },
];

function getModelMultiplier(modelName: string) {
  const name = modelName.toLowerCase();
  if (name.includes("iphone") || name.includes("rog")) return 0.95;
  if (name.includes("poco")) return 1.07;
  return 1.0;
}

// Same math as provided by user (no formula changes).
export function calculateSensitivity(input: CalculatorInput): ScopeResult[] {
  const ipadMultiplier = input.ipadView ? 1.15 : 1.0;
  const fpsMultiplier = input.fps90 ? 0.96 : 1.0;
  const modelMultiplier = getModelMultiplier(input.modelName);

  const finalValue =
    input.baseValue *
    input.gyroMultiplier *
    input.ageMultiplier *
    input.fingerMultiplier *
    input.ramMultiplier *
    modelMultiplier *
    ipadMultiplier *
    fpsMultiplier;

  return scopes.map((scope) => {
    const camera = Math.min(Math.round(finalValue * scope.multiplier), 400);
    const ads =
      input.gyroMultiplier > 1
        ? camera
        : Math.min(Math.round(camera * 1.25), 400);
    return { name: scope.name, camera, ads };
  });
}
