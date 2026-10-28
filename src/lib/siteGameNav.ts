/** Site-wide header game menu (desktop dropdown + mobile accordion). */

import {
  FREE_FIRE_MAX_FAMILY_NAV,
  isFreeFireMaxFamilyPath,
} from "@/src/lib/freeFireMaxPages";
import {
  FREE_FIRE_INDIA_APK_PATH,
  FREE_FIRE_INDIA_PATH,
  FREE_FIRE_INDIA_REDEEM_CODE_PATH,
  FREE_FIRE_INDIA_STYLISH_NAME_PATH,
} from "@/src/lib/gamePagePath";
import {
  FREE_FIRE_INDIA_NEWS_CATEGORY,
  newsCategoryListingPath,
} from "@/src/lib/newsCategories";
import {
  FREE_FIRE_FAMILY_NAV,
  FREE_FIRE_MAX_PATH,
  isFreeFireFamilyPath,
} from "@/src/lib/freeFirePages";
import {
  isPubgMobileLiteFamilyPath,
  PUBG_MOBILE_LITE_NAV,
  PUBG_MOBILE_LITE_PATH,
} from "@/src/lib/pubgMobileLite";
import {
  BGMI_APK_PATH,
  BGMI_FAMILY_NAV,
  BGMI_LITE_NAV,
  BGMI_REDEEM_CODE_PATH,
  PUBG_APK_PATH,
  PUBG_FAMILY_NAV,
  PUBG_REDEEM_CODE_PATH,
} from "@/src/lib/resolveNavForPath";

export type SiteNavChild = { label: string; href: string };

export type SiteNavItem = {
  id: string;
  label: string;
  href: string;
  /** Optional submenu. */
  children?: readonly SiteNavChild[];
};

const BGMI_LITE_APK_PATH = "/bgmi-air-apk";
const BGMI_LITE_REDEEM_CODE_PATH = "/bgmi-air-redeem-code";
const BGMI_LITE_STYLISH_NAME_PATH = "/bgmi-air-stylish-name";

/** Fixed top nav for every page (not filtered by current game). */
export const SITE_GAME_NAV: readonly SiteNavItem[] = [
  { id: "home", label: "Home", href: "/" },
  {
    id: "free-fire",
    label: "Free Fire",
    href: "/",
    children: FREE_FIRE_FAMILY_NAV.map((row) => ({ label: row.label, href: row.href })),
  },
  {
    id: "free-fire-max",
    label: "Free Fire Max",
    href: FREE_FIRE_MAX_PATH,
    children: FREE_FIRE_MAX_FAMILY_NAV.map((row) => ({ label: row.label, href: row.href })),
  },
  {
    id: "pubg",
    label: "PUBG Mobile",
    href: "/pubg",
    children: PUBG_FAMILY_NAV.map((row) => ({ label: row.label, href: row.href })),
  },
  {
    id: "pubg-lite",
    label: "PUBG Mobile Flash",
    href: PUBG_MOBILE_LITE_PATH,
    children: PUBG_MOBILE_LITE_NAV.map((row) => ({ label: row.label, href: row.href })),
  },
  {
    id: "bgmi",
    label: "BGMI",
    href: "/bgmi",
    children: BGMI_FAMILY_NAV.map((row) => ({ label: row.label, href: row.href })),
  },
  {
    id: "bgmi-lite",
    label: "BGMI Air",
    href: "/bgmi-air",
    children: [...BGMI_LITE_NAV],
  },
];

function normalizePathname(pathname: string): string {
  const raw = typeof pathname === "string" ? pathname.trim() : "";
  return raw.replace(/\/+$/, "") || "/";
}

const FREE_FIRE_INDIA_NEWS_PATH = newsCategoryListingPath(FREE_FIRE_INDIA_NEWS_CATEGORY);

/** Desktop and mobile "Free Fire India" submenu. Not part of the Free Fire menu. */
export const FREE_FIRE_INDIA_MENU = [
  { label: "Home", href: FREE_FIRE_INDIA_PATH },
  { label: "APK", href: FREE_FIRE_INDIA_APK_PATH },
  { label: "Redeem Code", href: FREE_FIRE_INDIA_REDEEM_CODE_PATH },
  { label: "Name", href: FREE_FIRE_INDIA_STYLISH_NAME_PATH },
  { label: "News", href: FREE_FIRE_INDIA_NEWS_PATH },
] as const;

/** Desktop "Free Fire India" menu: calculator pages, APK, redeem, names, and news. */
export function isFreeFireIndiaDesktopPath(pathname: string): boolean {
  const p = normalizePathname(pathname);
  return (
    p === FREE_FIRE_INDIA_PATH ||
    p.startsWith(`${FREE_FIRE_INDIA_PATH}/`) ||
    p === FREE_FIRE_INDIA_APK_PATH ||
    p.startsWith(`${FREE_FIRE_INDIA_APK_PATH}/`) ||
    p === FREE_FIRE_INDIA_REDEEM_CODE_PATH ||
    p.startsWith(`${FREE_FIRE_INDIA_REDEEM_CODE_PATH}/`) ||
    p === FREE_FIRE_INDIA_STYLISH_NAME_PATH ||
    p.startsWith(`${FREE_FIRE_INDIA_STYLISH_NAME_PATH}/`) ||
    p === FREE_FIRE_INDIA_NEWS_PATH ||
    p.startsWith(`${FREE_FIRE_INDIA_NEWS_PATH}/`)
  );
}

function pathMatches(pathname: string, href: string): boolean {
  const p = normalizePathname(pathname);
  const h = normalizePathname(href);
  if (h === "/") return p === "/";
  return p === h || p.startsWith(`${h}/`);
}

function isBgmiLiteFamilyPath(pathname: string): boolean {
  const p = normalizePathname(pathname);
  return (
    p === "/bgmi-air" ||
    p.startsWith("/bgmi-air/") ||
    p === "/news/bgmi-air" ||
    p.startsWith("/news/bgmi-air/") ||
    p === BGMI_LITE_APK_PATH ||
    p.startsWith(`${BGMI_LITE_APK_PATH}/`) ||
    p === BGMI_LITE_REDEEM_CODE_PATH ||
    p.startsWith(`${BGMI_LITE_REDEEM_CODE_PATH}/`) ||
    p === BGMI_LITE_STYLISH_NAME_PATH ||
    p.startsWith(`${BGMI_LITE_STYLISH_NAME_PATH}/`)
  );
}

/** Parent game row is active when its home or any submenu page is open. */
export function isSiteNavItemActive(item: SiteNavItem, pathname: string): boolean {
  const p = normalizePathname(pathname);
  if (item.id === "home") return p === "/";
  if (item.id === "free-fire") {
    // Site home (`/`) is also FF calculator — highlight top "Home", not Free Fire.
    if (p === "/") return false;
    if (isFreeFireIndiaDesktopPath(p)) return false;
    return isFreeFireFamilyPath(p) && !isFreeFireMaxFamilyPath(p);
  }
  if (item.id === "free-fire-max") return isFreeFireMaxFamilyPath(p);
  if (item.id === "pubg-lite") return isPubgMobileLiteFamilyPath(p);
  if (item.id === "bgmi-lite") return isBgmiLiteFamilyPath(p);
  if (item.id === "pubg") {
    if (isPubgMobileLiteFamilyPath(p)) return false;
    return (
      p === "/pubg" ||
      p.startsWith("/pubg/") ||
      p === PUBG_APK_PATH ||
      p.startsWith(`${PUBG_APK_PATH}/`) ||
      p === PUBG_REDEEM_CODE_PATH ||
      p.startsWith(`${PUBG_REDEEM_CODE_PATH}/`) ||
      p === "/pubg-mobile-codes" ||
      p.startsWith("/pubg-mobile-codes/") ||
      p === "/news/pubg" ||
      p.startsWith("/news/pubg/")
    );
  }
  if (item.id === "bgmi") {
    return (
      (p === "/bgmi" ||
        p.startsWith("/bgmi/") ||
        p === BGMI_APK_PATH ||
        p.startsWith(`${BGMI_APK_PATH}/`) ||
        p === BGMI_REDEEM_CODE_PATH ||
        p.startsWith(`${BGMI_REDEEM_CODE_PATH}/`) ||
        p === "/news/bgmi" ||
        p.startsWith("/news/bgmi/")) &&
      !isBgmiLiteFamilyPath(p)
    );
  }
  return pathMatches(p, item.href);
}

export function isSiteNavChildActive(href: string, pathname: string): boolean {
  const p = normalizePathname(pathname);
  const h = normalizePathname(href);
  // `/` is owned by top-level Home — don't also highlight game submenu "Home".
  if (h === "/" && p === "/") return false;
  return pathMatches(pathname, href);
}

/** Prefetch targets for instant game switching. */
export const SITE_GAME_NAV_PREFETCH_HREFS: readonly string[] = Array.from(
  new Set(SITE_GAME_NAV.flatMap((item) => [item.href, ...(item.children?.map((c) => c.href) ?? [])])),
);
