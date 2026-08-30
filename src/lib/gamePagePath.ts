/** Shared path checks for game calculator pages. */

export type LiteCalcBrand = "bgmi-lite" | "pubg-mobile-lite";

export function isBgmiLitePath(pathname: string | null | undefined): boolean {
  const raw = typeof pathname === "string" ? pathname.trim() : "";
  const p = raw.replace(/\/+$/, "") || "/";
  return p === "/bgmi-lite" || p.startsWith("/bgmi-lite/");
}

export function isPubgMobileLitePath(pathname: string | null | undefined): boolean {
  const raw = typeof pathname === "string" ? pathname.trim() : "";
  const p = raw.replace(/\/+$/, "") || "/";
  return p === "/pubg-mobile-lite" || p.startsWith("/pubg-mobile-lite/");
}

/** Either Lite calculator page (BGMI Lite or PUBG Mobile Lite). */
export function isLiteCalculatorPath(pathname: string | null | undefined): boolean {
  return isBgmiLitePath(pathname) || isPubgMobileLitePath(pathname);
}

export function getLiteCalcBrand(
  pathname: string | null | undefined,
): LiteCalcBrand | null {
  if (isPubgMobileLitePath(pathname)) return "pubg-mobile-lite";
  if (isBgmiLitePath(pathname)) return "bgmi-lite";
  return null;
}

/** Pick section content for home / BGMI Lite / PUBG Mobile Lite routes. */
export function pickLitePageContent<T>(
  pathname: string | null | undefined,
  home: T | undefined,
  bgmiLite: T | undefined,
  pubgMobileLite: T | undefined,
): T | undefined {
  const brand = getLiteCalcBrand(pathname);
  if (brand === "pubg-mobile-lite") return pubgMobileLite ?? bgmiLite ?? home;
  if (brand === "bgmi-lite") return bgmiLite ?? home;
  return home;
}

export function isHomeFfPath(pathname: string | null | undefined): boolean {
  const raw = typeof pathname === "string" ? pathname.trim() : "";
  const p = raw.replace(/\/+$/, "") || "/";
  return p === "/" || p === "";
}
