/**
 * Display-only rename: BGMI Lite → BGMI Air, PUBG Mobile Lite / PUBG Lite → PUBG Mobile Flash.
 * URL paths (/bgmi-lite, /pubg-mobile-lite, …) are left unchanged.
 */

const PATH_PROTECT: Array<[RegExp, string]> = [
  [/\/bgmi-lite-stylish-name/gi, "\u0001PATH_BLSN\u0001"],
  [/\/bgmi-lite-redeem-code/gi, "\u0001PATH_BLRC\u0001"],
  [/\/bgmi-lite-apk/gi, "\u0001PATH_BLAPK\u0001"],
  [/\/news\/bgmi-lite/gi, "\u0001PATH_BLNEWS\u0001"],
  [/\/bgmi-lite/gi, "\u0001PATH_BL\u0001"],
  [/\/pubg-mobile-lite-redeem-code/gi, "\u0001PATH_PLRC\u0001"],
  [/\/pubg-mobile-lite-apk/gi, "\u0001PATH_PLAPK\u0001"],
  [/\/pubg-mobile-lite-name/gi, "\u0001PATH_PLNM\u0001"],
  [/\/news\/pubg-mobile-lite/gi, "\u0001PATH_PLNEWS\u0001"],
  [/\/pubg-mobile-lite/gi, "\u0001PATH_PL\u0001"],
];

const PATH_RESTORE: Array<[RegExp, string]> = [
  [/\u0001PATH_BLSN\u0001/g, "/bgmi-lite-stylish-name"],
  [/\u0001PATH_BLRC\u0001/g, "/bgmi-lite-redeem-code"],
  [/\u0001PATH_BLAPK\u0001/g, "/bgmi-lite-apk"],
  [/\u0001PATH_BLNEWS\u0001/g, "/news/bgmi-lite"],
  [/\u0001PATH_BL\u0001/g, "/bgmi-lite"],
  [/\u0001PATH_PLRC\u0001/g, "/pubg-mobile-lite-redeem-code"],
  [/\u0001PATH_PLAPK\u0001/g, "/pubg-mobile-lite-apk"],
  [/\u0001PATH_PLNM\u0001/g, "/pubg-mobile-lite-name"],
  [/\u0001PATH_PLNEWS\u0001/g, "/news/pubg-mobile-lite"],
  [/\u0001PATH_PL\u0001/g, "/pubg-mobile-lite"],
];

/** Rewrite visible Lite game names; keeps route paths intact. */
export function renameLiteDisplayText(input: string): string {
  if (!input || !/lite/i.test(input)) return input;
  let s = input;
  for (const [re, token] of PATH_PROTECT) s = s.replace(re, token);
  s = s.replace(/\bBGMI\s+Lite\b/gi, "BGMI Air");
  s = s.replace(/\bPUBG\s+Mobile\s+Lite\b/gi, "PUBG Mobile Flash");
  s = s.replace(/\bPUBG\s+Lite\b/gi, "PUBG Mobile Flash");
  for (const [re, path] of PATH_RESTORE) s = s.replace(re, path);
  return s;
}

/** Nav/footer label helper. */
export function renameLiteDisplayLabel(label: string): string {
  return renameLiteDisplayText(label);
}

/** Deep-walk strings in JSON-like CMS payloads. */
export function renameLiteDisplayDeep<T>(value: T): T {
  if (typeof value === "string") return renameLiteDisplayText(value) as T;
  if (Array.isArray(value)) {
    return value.map((item) => renameLiteDisplayDeep(item)) as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      out[key] = renameLiteDisplayDeep(child);
    }
    return out as T;
  }
  return value;
}

export function renameLiteDisplayLinks<T extends { label: string; href: string }>(
  links: T[],
): T[] {
  return links.map((item) => ({
    ...item,
    label: renameLiteDisplayLabel(item.label),
  }));
}

/** News post fields shown on public pages. */
export function renameLiteNewsPost<T extends Record<string, unknown>>(post: T): T {
  const out = { ...post } as Record<string, unknown>;
  for (const key of [
    "title",
    "excerpt",
    "content",
    "seoTitle",
    "seoDescription",
    "socialTitle",
    "socialDescription",
  ] as const) {
    const value = out[key];
    if (typeof value === "string") out[key] = renameLiteDisplayText(value);
  }
  if (out.meta && typeof out.meta === "object") {
    out.meta = renameLiteDisplayDeep(out.meta);
  }
  return out as T;
}
