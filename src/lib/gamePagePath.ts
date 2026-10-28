/** Shared path checks for game calculator pages. */

export type LiteCalcBrand = "bgmi-lite" | "pubg-mobile-lite";

export function isBgmiLitePath(pathname: string | null | undefined): boolean {
  const raw = typeof pathname === "string" ? pathname.trim() : "";
  const p = raw.replace(/\/+$/, "") || "/";
  return p === "/bgmi-air" || p.startsWith("/bgmi-air/");
}

export function isPubgMobileLitePath(pathname: string | null | undefined): boolean {
  const raw = typeof pathname === "string" ? pathname.trim() : "";
  const p = raw.replace(/\/+$/, "") || "/";
  return p === "/pubg-mobile-flash" || p.startsWith("/pubg-mobile-flash/");
}

/** Either Lite calculator page (BGMI Air or PUBG Mobile Flash). */
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

/** Pick section content for home / BGMI Air / PUBG Mobile Flash routes. */
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

/** Free Fire India calculator — same tool as home, own URL. */
export const FREE_FIRE_INDIA_PATH = "/free-fire-india";

/** Free Fire India APK guide — same layout as /free-fire-apk. */
export const FREE_FIRE_INDIA_APK_PATH = "/free-fire-india-apk";

/** Free Fire India redeem codes — same board as /free-fire-redeem-code. */
export const FREE_FIRE_INDIA_REDEEM_CODE_PATH = "/free-fire-india-redeem-code";

/** Free Fire India stylish names — same tool as /free-fire-stylish-name. */
export const FREE_FIRE_INDIA_STYLISH_NAME_PATH = "/free-fire-india-stylish-name";

export function isFreeFireIndiaPath(pathname: string | null | undefined): boolean {
  const raw = typeof pathname === "string" ? pathname.trim() : "";
  const p = raw.replace(/\/+$/, "") || "/";
  return p === FREE_FIRE_INDIA_PATH || p.startsWith(`${FREE_FIRE_INDIA_PATH}/`);
}

/** Home (`/`) and Free Fire India share the Free Fire calculator page. */
export function isHomeFfPath(pathname: string | null | undefined): boolean {
  const raw = typeof pathname === "string" ? pathname.trim() : "";
  const p = raw.replace(/\/+$/, "") || "/";
  return p === "/" || isFreeFireIndiaPath(pathname);
}
