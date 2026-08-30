/**
 * Controlled comma-separated keyword inputs.
 * Keeps a trailing comma editable (split+filter(Boolean) would eat it every keystroke).
 */

export function parseCommaKeywordsInput(raw: string): string[] {
  if (raw === "") return [];
  const endsWithSep = /,\s*$/.test(raw);
  const items = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return endsWithSep ? [...items, ""] : items;
}

export function formatCommaKeywordsInput(keywords: string[]): string {
  if (keywords.length === 0) return "";
  const endsWithSep = keywords[keywords.length - 1] === "";
  const items = endsWithSep ? keywords.slice(0, -1) : keywords;
  if (endsWithSep) return `${items.join(", ")}${items.length ? ", " : ","}`;
  return items.join(", ");
}
