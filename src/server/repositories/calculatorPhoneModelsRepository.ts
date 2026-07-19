import { DEFAULT_CALCULATOR_PHONE_MODELS } from "@/src/features/sensCalculator/constants";
import {
  dedupePhoneNamesPreserveOrder,
  expandCalculatorPhoneModelStrings,
} from "@/src/lib/calculatorPhoneModelsInput";
import { prisma, tryPrisma } from "@/src/server/dbSafe";

const KEY = "settings:calculatorPhoneModels";

/** Models shown in calculator search suggestions. Falls back to code defaults if DB empty / missing. */
export async function getCalculatorPhoneModels(): Promise<string[]> {
  const row = await tryPrisma(async () =>
    prisma.siteSetting.findUnique({ where: { key: KEY } }),
  );
  if (row === null || !row?.value) {
    return [...DEFAULT_CALCULATOR_PHONE_MODELS];
  }
  const record = row.value as { models?: unknown };
  if (!Array.isArray(record.models)) {
    return [...DEFAULT_CALCULATOR_PHONE_MODELS];
  }
  const parsed = record.models
    .filter((x): x is string => typeof x === "string")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!parsed.length) {
    return [...DEFAULT_CALCULATOR_PHONE_MODELS];
  }
  return dedupePhoneNamesPreserveOrder(parsed);
}

/** Raw list stored in DB (may be empty if admin cleared custom list). */
export async function getStoredCalculatorPhoneModelsRaw(): Promise<string[] | null> {
  const row = await tryPrisma(async () =>
    prisma.siteSetting.findUnique({ where: { key: KEY } }),
  );
  if (row === null) return null;
  if (!row?.value) return null;
  const record = row.value as { models?: unknown };
  if (!Array.isArray(record.models)) return null;
  return dedupePhoneNamesPreserveOrder(
    record.models.filter((x): x is string => typeof x === "string").map((s) => s.trim()),
  );
}

/**
 * Replace custom list. Pass [] to clear DB entry (live site uses code defaults again).
 * Caps at 2000 entries. Duplicates are removed automatically (first spelling kept).
 */
export async function saveCalculatorPhoneModels(models: string[]): Promise<string[]> {
  const normalized = dedupePhoneNamesPreserveOrder(
    expandCalculatorPhoneModelStrings(models),
  ).slice(0, 2000);
  const ok = await tryPrisma(async () => {
    if (!normalized.length) {
      await prisma.siteSetting.deleteMany({ where: { key: KEY } });
      return true;
    }
    await prisma.siteSetting.upsert({
      where: { key: KEY },
      create: { key: KEY, value: { models: normalized } },
      update: { value: { models: normalized } },
    });
    return true;
  });
  if (!ok) {
    throw new Error("Database unavailable");
  }
  return normalized;
}
