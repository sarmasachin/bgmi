"use client";

import Link from "next/link";
import { useEffect, useRef, type MouseEvent } from "react";
import { FreeFireIndiaMenuLabel } from "@/src/components/FreeFireIndiaMenuLabel";
import {
  FREE_FIRE_INDIA_APK_PATH,
  FREE_FIRE_INDIA_PATH,
  FREE_FIRE_INDIA_STYLISH_NAME_PATH,
} from "@/src/lib/gamePagePath";
import { FREE_FIRE_MAX_APK_MENU_PATH } from "@/src/lib/freeFireMaxPages";
import { FREE_FIRE_APK_MENU_PATH } from "@/src/lib/freeFirePages";
import {
  detectNavGameContext,
  navForCloneGame,
  resolveNavForPath,
} from "@/src/lib/resolveNavForPath";
import {
  FREE_FIRE_INDIA_MENU,
  isFreeFireIndiaDesktopPath,
} from "@/src/lib/siteGameNav";

type NavLink = { label: string; href: string };

type HomeHeaderChipNavProps = {
  activePath: string;
  pathname: string;
  normalizedNav: NavLink[];
  menuGame?: string;
  onNavigate: (event: MouseEvent<HTMLAnchorElement>, href: string) => void;
};

const FREE_FIRE_INDIA_CHIP: NavLink = {
  label: "Free Fire India",
  href: FREE_FIRE_INDIA_PATH,
};

const FREE_FIRE_INDIA_APK_CHIP: NavLink = {
  label: "FF India Apk",
  href: FREE_FIRE_INDIA_APK_PATH,
};

const INDIA_PAGE_CHIP_LABEL: Record<string, string> = {
  [FREE_FIRE_INDIA_APK_PATH]: "FF India Apk",
  [FREE_FIRE_INDIA_STYLISH_NAME_PATH]: "FF India Name",
};

const FREE_FIRE_INDIA_CHIPS: NavLink[] = FREE_FIRE_INDIA_MENU.map((item) => ({
  label: INDIA_PAGE_CHIP_LABEL[item.href] ?? item.label,
  href: item.href,
}));

function isChipActive(href: string, activePath: string) {
  if (href === "/") return activePath === "/" || activePath === "";
  const path = activePath.replace(/\/+$/, "") || "/";
  if (href === FREE_FIRE_INDIA_PATH) return path === FREE_FIRE_INDIA_PATH;
  return path === href || path.startsWith(`${href}/`);
}

/** Mobile chip row only. Desktop and the Free Fire / Max hamburger stay unchanged. */
function withFreeFireIndiaChip(links: NavLink[]): NavLink[] {
  const onFreeFireChips = links.some((item) => item.href === FREE_FIRE_APK_MENU_PATH);
  const onMaxChips = links.some((item) => item.href === FREE_FIRE_MAX_APK_MENU_PATH);
  if (!onFreeFireChips && !onMaxChips) return links;
  const extras = [FREE_FIRE_INDIA_CHIP, FREE_FIRE_INDIA_APK_CHIP].filter(
    (chip) => !links.some((item) => item.href === chip.href),
  );
  if (extras.length === 0) return links;
  const homeIndex = links.findIndex((item) => item.label.trim().toLowerCase() === "home");
  const at = homeIndex >= 0 ? homeIndex + 1 : 0;
  return [...links.slice(0, at), ...extras, ...links.slice(at)];
}

/** Mobile games chip row. */
export function HomeHeaderChipNav({
  activePath,
  pathname,
  normalizedNav,
  menuGame,
  onNavigate,
}: HomeHeaderChipNavProps) {
  const chipNavRef = useRef<HTMLElement>(null);
  const pathMenu = resolveNavForPath(activePath, normalizedNav);
  const cloneMenu =
    detectNavGameContext(activePath) === "default" ? navForCloneGame(menuGame) : null;
  const familyLinks = isFreeFireIndiaDesktopPath(activePath)
    ? FREE_FIRE_INDIA_CHIPS
    : withFreeFireIndiaChip(cloneMenu ?? pathMenu);

  // Mouse wheel is vertical by default — map it to horizontal chip scroll.
  useEffect(() => {
    const el = chipNavRef.current;
    if (!el) return;
    const onWheel = (event: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth + 1) return;
      const dominant =
        Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (dominant === 0) return;
      const max = el.scrollWidth - el.clientWidth;
      const next = Math.min(max, Math.max(0, el.scrollLeft + dominant));
      if (next === el.scrollLeft) return;
      event.preventDefault();
      el.scrollLeft = next;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [pathname]);

  return (
    <nav ref={chipNavRef} className="home-header-nav" aria-label="Games">
      {familyLinks.map((item) => {
        const indiaHomeChip =
          item.label === "Free Fire India" && item.href === FREE_FIRE_INDIA_PATH;
        const indiaApkChip = item.href === FREE_FIRE_INDIA_APK_PATH;
        const active = isChipActive(item.href, activePath);
        return (
          <Link
            key={`chip-${item.href}-${item.label}`}
            href={item.href}
            prefetch
            className={active ? "is-active" : undefined}
            onClick={(event) => onNavigate(event, item.href)}
          >
            {indiaApkChip ? (
              <FreeFireIndiaMenuLabel apk />
            ) : indiaHomeChip ? (
              <FreeFireIndiaMenuLabel />
            ) : (
              item.label
            )}
          </Link>
        );
      })}
    </nav>
  );
}
