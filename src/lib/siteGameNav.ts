/** Site-wide header game menu (desktop dropdown + mobile accordion). */

import {
  FREE_FIRE_MAX_FAMILY_NAV,
  isFreeFireMaxFamilyPath,
} from "@/src/lib/freeFireMaxPages";
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

export type SiteNavChild = { label: string; href: string };

export type SiteNavItem = {
  id: string;
  label: string;
  href: string;
  /** Optional submenu — BGMI / PUBG Mobile stay empty for now. */
  children?: readonly SiteNavChild[];
};

const BGMI_LITE_APK_PATH = "/bgmi-lite-apk";
const BGMI_LITE_REDEEM_CODE_PATH = "/bgmi-lite-redeem-code";
const BGMI_LITE_STYLISH_NAME_PATH = "/bgmi-lite-stylish-name";

const BGMI_LITE_CHILDREN: readonly SiteNavChild[] = [
  { label: "Home", href: "/bgmi-lite" },
  { label: "BGMI Lite APK", href: BGMI_LITE_APK_PATH },
  { label: "Redeem Code", href: BGMI_LITE_REDEEM_CODE_PATH },
  { label: "BGMI Lite Stylish Name", href: BGMI_LITE_STYLISH_NAME_PATH },
  { label: "News", href: "/news" },
];

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
  { id: "pubg", label: "PUBG Mobile", href: "/pubg" },
  {
    id: "pubg-lite",
    label: "PUBG Mobile Lite",
    href: PUBG_MOBILE_LITE_PATH,
    children: PUBG_MOBILE_LITE_NAV.map((row) => ({ label: row.label, href: row.href })),
  },
  { id: "bgmi", label: "BGMI", href: "/bgmi" },
  {
    id: "bgmi-lite",
    label: "BGMI Lite",
    href: "/bgmi-lite",
    children: [...BGMI_LITE_CHILDREN],
  },
];

function normalizePathname(pathname: string): string {
  const raw = typeof pathname === "string" ? pathname.trim() : "";
  return raw.replace(/\/+$/, "") || "/";
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
    p === "/bgmi-lite" ||
    p.startsWith("/bgmi-lite/") ||
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
      p === "/pubg-mobile-codes" ||
      p.startsWith("/pubg-mobile-codes/")
    );
  }
  if (item.id === "bgmi") {
    return (p === "/bgmi" || p.startsWith("/bgmi/")) && !isBgmiLiteFamilyPath(p);
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
