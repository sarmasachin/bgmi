/**
 * Display-only rename: BGMI Lite → BGMI Air, PUBG Mobile Lite / PUBG Lite → PUBG Mobile Flash.
 * URL paths are rewritten to the current public URLs (BGMI Air / PUBG Mobile Flash).
 * Admin paths such as /admin/bgmi-lite-apk are left unchanged.
 */

const PATH_PROTECT: Array<[RegExp, string]> = [
  [/(?<!\/admin)\/bgmi-lite-stylish-name/gi, "\u0001PATH_BLSN\u0001"],
  [/(?<!\/admin)\/bgmi-lite-redeem-code/gi, "\u0001PATH_BLRC\u0001"],
  [/(?<!\/admin)\/bgmi-lite-apk/gi, "\u0001PATH_BLAPK\u0001"],
  [/(?<!\/admin)\/news\/bgmi-lite/gi, "\u0001PATH_BLNEWS\u0001"],
  [/(?<!\/admin)\/bgmi-lite/gi, "\u0001PATH_BL\u0001"],
  [/(?<!\/admin)\/pubg-mobile-lite-redeem-code/gi, "\u0001PATH_PLRC\u0001"],
  [/(?<!\/admin)\/pubg-mobile-lite-apk/gi, "\u0001PATH_PLAPK\u0001"],
  [/(?<!\/admin)\/pubg-mobile-lite-name/gi, "\u0001PATH_PLNM\u0001"],
  [/(?<!\/admin)\/news\/pubg-mobile-lite/gi, "\u0001PATH_PLNEWS\u0001"],
  [/(?<!\/admin)\/pubg-mobile-lite/gi, "\u0001PATH_PL\u0001"],
];

const PATH_RESTORE: Array<[RegExp, string]> = [
  [/\u0001PATH_BLSN\u0001/g, "/bgmi-air-stylish-name"],
  [/\u0001PATH_BLRC\u0001/g, "/bgmi-air-redeem-code"],
  [/\u0001PATH_BLAPK\u0001/g, "/bgmi-air-apk"],
  [/\u0001PATH_BLNEWS\u0001/g, "/news/bgmi-air"],
  [/\u0001PATH_BL\u0001/g, "/bgmi-air"],
  [/\u0001PATH_PLRC\u0001/g, "/pubg-mobile-flash-redeem-code"],
  [/\u0001PATH_PLAPK\u0001/g, "/pubg-mobile-flash-apk"],
  [/\u0001PATH_PLNM\u0001/g, "/pubg-mobile-flash-name"],
  [/\u0001PATH_PLNEWS\u0001/g, "/news/pubg-mobile-flash"],
  [/\u0001PATH_PL\u0001/g, "/pubg-mobile-flash"],
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
