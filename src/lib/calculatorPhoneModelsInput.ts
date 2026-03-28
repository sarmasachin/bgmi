/**
 * Parse admin/API input: commas and newlines separate phone names.
 * Safe for client and server (no DB).
 */
export function expandCalculatorPhoneModelStrings(models: string[]): string[] {
  const out: string[] = [];
  for (const raw of models) {
    if (typeof raw !== "string") continue;
    const pieces = raw.split(/,|\r?\n/);
    for (const p of pieces) {
      const t = p.trim();
      if (t) out.push(t);
    }
  }
  return out;
}

/** First-seen spelling for each case-insensitive duplicate (for error messages). */
export function getDuplicatePhoneNamesInInput(models: string[]): string[] {
  const expanded = expandCalculatorPhoneModelStrings(models);
  const firstByLower = new Map<string, string>();
  const dups = new Set<string>();
  for (const t of expanded) {
    const k = t.toLowerCase();
    if (firstByLower.has(k)) {
      dups.add(firstByLower.get(k)!);
    } else {
      firstByLower.set(k, t);
    }
  }
  return Array.from(dups);
}
