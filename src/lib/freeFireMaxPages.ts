/** Free Fire Max family routes + header menu. */

import { FREE_FIRE_MAX_PATH } from "@/src/lib/freeFirePages";

export const FREE_FIRE_MAX_REDEEM_CODE_PATH = "/free-fire-max-redeem-code";
export const FREE_FIRE_MAX_STYLISH_NAME_PATH = "/free-fire-max-stylish-name";
export const FREE_FIRE_MAX_NEWS_PATH = "/news/ff-max";

/** Header menu on Free Fire Max family routes. */
export const FREE_FIRE_MAX_FAMILY_NAV = [
  { label: "Home", href: FREE_FIRE_MAX_PATH },
  { label: "Redeem Code", href: FREE_FIRE_MAX_REDEEM_CODE_PATH },
  { label: "FF Max Names", href: FREE_FIRE_MAX_STYLISH_NAME_PATH },
  { label: "News", href: FREE_FIRE_MAX_NEWS_PATH },
] as const;

export const FREE_FIRE_MAX_FAMILY_PATHS = [
  FREE_FIRE_MAX_PATH,
  FREE_FIRE_MAX_REDEEM_CODE_PATH,
  FREE_FIRE_MAX_STYLISH_NAME_PATH,
] as const;

export function isFreeFireMaxFamilyPath(pathname: string): boolean {
  const raw = typeof pathname === "string" ? pathname.trim() : "";
  const p = raw.replace(/\/+$/, "") || "/";
  if (p === FREE_FIRE_MAX_NEWS_PATH || p.startsWith(`${FREE_FIRE_MAX_NEWS_PATH}/`)) {
    return true;
  }
  if (p === "/ff-max" || p.startsWith("/ff-max/")) return true;
  return FREE_FIRE_MAX_FAMILY_PATHS.some(
    (base) => p === base || p.startsWith(`${base}/`),
  );
}
