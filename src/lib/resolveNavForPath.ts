import { FREE_FIRE_ADVANCE_SERVER_PATH } from "@/src/lib/ffAdvanceServerPage";
import {
  FREE_FIRE_MAX_FAMILY_NAV,
  FREE_FIRE_MAX_NEWS_PATH,
  FREE_FIRE_MAX_REDEEM_CODE_PATH,
  FREE_FIRE_MAX_STYLISH_NAME_PATH,
  isFreeFireMaxFamilyPath,
} from "@/src/lib/freeFireMaxPages";
import {
  FREE_FIRE_FAMILY_NAV,
  FREE_FIRE_MAX_PATH,
  FREE_FIRE_PATH,
  FREE_FIRE_REDEEM_CODE_PATH,
  FREE_FIRE_STYLISH_NAME_PATH,
  isFreeFireFamilyPath,
} from "@/src/lib/freeFirePages";
import { PUBG_MOBILE_CODES_PATH } from "@/src/lib/pubgMobileCodes";
import {
  isPubgMobileLiteFamilyPath,
  PUBG_MOBILE_LITE_APK_PATH,
  PUBG_MOBILE_LITE_NAME_PATH,
  PUBG_MOBILE_LITE_NAV,
  PUBG_MOBILE_LITE_PATH,
  PUBG_MOBILE_LITE_REDEEM_CODE_PATH,
} from "@/src/lib/pubgMobileLite";

export type NavLink = { label: string; href: string };

export type NavGameContext = "freefire" | "pubg" | "default";

/** Planned Lite-family routes (menu + pages). */
export const BGMI_LITE_APK_PATH = "/bgmi-lite-apk";
export const BGMI_LITE_REDEEM_CODE_PATH = "/bgmi-lite-redeem-code";
export const BGMI_LITE_STYLISH_NAME_PATH = "/bgmi-lite-stylish-name";

const BGMI_LITE_FAMILY_PATHS = [
  "/bgmi-lite",
  BGMI_LITE_APK_PATH,
  BGMI_LITE_REDEEM_CODE_PATH,
  BGMI_LITE_STYLISH_NAME_PATH,
] as const;

function isBgmiLiteFamilyPath(p: string): boolean {
  return BGMI_LITE_FAMILY_PATHS.some(
    (base) => p === base || p.startsWith(`${base}/`),
  );
}

/** Header menu when the user is on /bgmi-lite (and related Lite pages). */
export const BGMI_LITE_NAV: NavLink[] = [
  { label: "Home", href: "/bgmi-lite" },
  { label: "BGMI Lite APK", href: BGMI_LITE_APK_PATH },
  { label: "Redeem Code", href: BGMI_LITE_REDEEM_CODE_PATH },
  { label: "BGMI Lite Stylish Name", href: BGMI_LITE_STYLISH_NAME_PATH },
  { label: "News", href: "/news" },
];

/**
 * Which game “world” the user is in — drives context-aware header links.
 * Does not change hrefs; only which items from the full nav list are shown.
 */
export function detectNavGameContext(pathname: string): NavGameContext {
  const raw = typeof pathname === "string" ? pathname.trim() : "";
  const p = raw.replace(/\/+$/, "") || "/";

  if (
    p === "/bgmi" ||
    p.startsWith("/bgmi/") ||
    isBgmiLiteFamilyPath(p) ||
    p === "/pubg" ||
    p.startsWith("/pubg/") ||
    isPubgMobileLiteFamilyPath(p) ||
    p === PUBG_MOBILE_CODES_PATH ||
    p.startsWith(`${PUBG_MOBILE_CODES_PATH}/`)
  ) {
    return "pubg";
  }

  if (
    p === "/" ||
    p === FREE_FIRE_PATH ||
    p.startsWith(`${FREE_FIRE_PATH}/`) ||
    p === FREE_FIRE_MAX_PATH ||
    p.startsWith(`${FREE_FIRE_MAX_PATH}/`) ||
    p === FREE_FIRE_ADVANCE_SERVER_PATH ||
    p.startsWith(`${FREE_FIRE_ADVANCE_SERVER_PATH}/`) ||
    p === FREE_FIRE_REDEEM_CODE_PATH ||
    p.startsWith(`${FREE_FIRE_REDEEM_CODE_PATH}/`) ||
    p === FREE_FIRE_STYLISH_NAME_PATH ||
    p.startsWith(`${FREE_FIRE_STYLISH_NAME_PATH}/`) ||
    p === FREE_FIRE_MAX_REDEEM_CODE_PATH ||
    p.startsWith(`${FREE_FIRE_MAX_REDEEM_CODE_PATH}/`) ||
    p === FREE_FIRE_MAX_STYLISH_NAME_PATH ||
    p.startsWith(`${FREE_FIRE_MAX_STYLISH_NAME_PATH}/`) ||
    p === "/free-fire" ||
    p.startsWith("/free-fire/") ||
    p === "/ff-max" ||
    p.startsWith("/ff-max/") ||
    p === "/news/free-fire" ||
    p.startsWith("/news/free-fire/") ||
    p === FREE_FIRE_MAX_NEWS_PATH ||
    p.startsWith(`${FREE_FIRE_MAX_NEWS_PATH}/`)
  ) {
    return "freefire";
  }

  return "default";
}

function linkFamily(link: NavLink): "freefire" | "pubg" | "other" {
  const href = (link.href ?? "").trim();
  const label = (link.label ?? "").trim();

  if (
    href === "/bgmi" ||
    href.startsWith("/bgmi/") ||
    href === "/bgmi-lite" ||
    href.startsWith("/bgmi-lite/") ||
    href === BGMI_LITE_APK_PATH ||
    href.startsWith(`${BGMI_LITE_APK_PATH}/`) ||
    href === BGMI_LITE_REDEEM_CODE_PATH ||
    href === BGMI_LITE_STYLISH_NAME_PATH ||
    href === "/news" ||
    href.startsWith("/news/") ||
    href === "/pubg" ||
    href.startsWith("/pubg/") ||
    href === PUBG_MOBILE_LITE_PATH ||
    href.startsWith(`${PUBG_MOBILE_LITE_PATH}/`) ||
    href === PUBG_MOBILE_LITE_APK_PATH ||
    href === PUBG_MOBILE_LITE_REDEEM_CODE_PATH ||
    href === PUBG_MOBILE_LITE_NAME_PATH ||
    href === PUBG_MOBILE_CODES_PATH ||
    href.startsWith(`${PUBG_MOBILE_CODES_PATH}/`) ||
    /^bgmi(\s*lite)?$/i.test(label) ||
    /pubg/i.test(label)
  ) {
    return "pubg";
  }

  if (
    href === "/" ||
    href === FREE_FIRE_PATH ||
    href === FREE_FIRE_MAX_PATH ||
    href === FREE_FIRE_ADVANCE_SERVER_PATH ||
    href === FREE_FIRE_REDEEM_CODE_PATH ||
    href === FREE_FIRE_STYLISH_NAME_PATH ||
    href === FREE_FIRE_MAX_REDEEM_CODE_PATH ||
    href === FREE_FIRE_MAX_STYLISH_NAME_PATH ||
    href === "/news/free-fire" ||
    href.startsWith("/news/free-fire/") ||
    href === FREE_FIRE_MAX_NEWS_PATH ||
    href.startsWith(`${FREE_FIRE_MAX_NEWS_PATH}/`) ||
    href.startsWith("/free-fire") ||
    href.startsWith("/ff-max") ||
    /^home$/i.test(label) ||
    /free\s*fire/i.test(label) ||
    /^ff\s*max$/i.test(label) ||
    /ff\s*max\s*names/i.test(label) ||
    /advance\s*server/i.test(label) ||
    /^ff\s*names$/i.test(label) ||
    /redeem\s*code/i.test(label)
  ) {
    return "freefire";
  }

  return "other";
}

/** Filter header nav for the current path. Empty filter → full list (safe fallback). */
export function resolveNavForPath(pathname: string, navigation: NavLink[]): NavLink[] {
  const raw = typeof pathname === "string" ? pathname.trim() : "";
  const p = raw.replace(/\/+$/, "") || "/";
  if (isBgmiLiteFamilyPath(p)) {
    return BGMI_LITE_NAV;
  }
  if (isPubgMobileLiteFamilyPath(p)) {
    return PUBG_MOBILE_LITE_NAV;
  }
  if (isFreeFireMaxFamilyPath(p)) {
    return [...FREE_FIRE_MAX_FAMILY_NAV];
  }
  if (isFreeFireFamilyPath(p)) {
    return [...FREE_FIRE_FAMILY_NAV];
  }

  if (!navigation.length) return navigation;
  const ctx = detectNavGameContext(pathname);
  if (ctx === "default") return navigation;

  const filtered = navigation.filter((item) => {
    const family = linkFamily(item);
    if (family === "other") return true;
    return family === ctx;
  });

  return filtered.length ? filtered : navigation;
}
