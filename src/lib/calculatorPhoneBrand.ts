import { deviceNames } from "@/src/features/ffCalculator/calculator";

const SUGGESTION_LIMIT = 80;

/** First word of a phone name, e.g. "Samsung Galaxy A55 / A35" → "Samsung". */
export function phoneBrandToken(name: string): string {
  return name.trim().split(/\s+/)[0] ?? "";
}

export function phoneMatchesBrand(name: string, brand: string): boolean {
  const wanted = brand.trim().toLowerCase();
  if (!wanted) return true;
  return phoneBrandToken(name).toLowerCase() === wanted;
}

export function uniquePhoneBrands(names: readonly string[]): string[] {
  const seen = new Map<string, string>();
  for (const name of names) {
    const token = phoneBrandToken(name);
    const key = token.toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.set(key, token);
  }
  return [...seen.values()].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}

/** Stored page meta. Empty or unsafe values become undefined. */
export function coercePhoneBrand(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (!trimmed || trimmed.length > 40) return undefined;
  if (!/^[A-Za-z0-9.+-]+$/.test(trimmed)) return undefined;
  return trimmed;
}

/**
 * Device dropdown.
 * No brand + empty query: FF shows every phone; other calculators stay closed until the user types.
 * Brand set: only that brand, including the full list when the box is empty.
 */
export function searchPhones(
  names: readonly string[],
  brand: string | undefined,
  query: string,
  showAllWhenEmpty: boolean,
): string[] {
  const locked = (brand ?? "").trim();
  const pool = locked ? names.filter((name) => phoneMatchesBrand(name, locked)) : names;
  const value = query.trim().toLowerCase();
  if (!value && !locked && !showAllWhenEmpty) return [];
  const matched = value ? pool.filter((phone) => phone.toLowerCase().includes(value)) : pool;
  if (!value && locked) return [...matched];
  return matched.slice(0, SUGGESTION_LIMIT);
}

/**
 * No brand: typed name is used as-is (same as the original calculators).
 * Brand set: any model of that brand is allowed, even when it is not in the list.
 * A list hit returns the list spelling, so Free Fire uses that device record.
 * Any other brand is rejected.
 */
export function resolveLockedPhone(
  names: readonly string[],
  brand: string | undefined,
  deviceName: string,
): { ok: true; name: string } | { ok: false; message: string } {
  const typed = deviceName.trim().replace(/\s+/g, " ");
  const locked = (brand ?? "").trim();
  if (!locked) return { ok: true, name: typed };
  if (!typed || !phoneMatchesBrand(typed, locked)) {
    return {
      ok: false,
      message: `This calculator only calculates sensitivity for ${locked} phones.`,
    };
  }
  const found = names.find(
    (name) => phoneMatchesBrand(name, locked) && name.toLowerCase() === typed.toLowerCase(),
  );
  if (found) return { ok: true, name: found };
  return { ok: true, name: typed };
}

export function brandsForCloneGame(game: string, phoneModels: readonly string[]): string[] {
  if (game === "freefire" || game === "freefire-max") return uniquePhoneBrands(deviceNames);
  return uniquePhoneBrands(phoneModels);
}
