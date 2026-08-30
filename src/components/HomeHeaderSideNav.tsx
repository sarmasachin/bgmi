"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import {
  isSiteNavChildActive,
  isSiteNavItemActive,
  SITE_GAME_NAV,
  type SiteNavItem,
} from "@/src/lib/siteGameNav";

type Props = {
  pathname: string;
  menuOpen: boolean;
  openId: string | null;
  onOpenIdChange: (id: string | null) => void;
  onNavigate: (event: MouseEvent<HTMLAnchorElement>, href: string) => void;
};

function hasChildren(
  item: SiteNavItem,
): item is SiteNavItem & { children: NonNullable<SiteNavItem["children"]> } {
  return Boolean(item.children && item.children.length > 0);
}

/** Mobile drawer: accordion for games that have submenus. */
export function HomeHeaderSideNav({
  pathname,
  menuOpen,
  openId,
  onOpenIdChange,
  onNavigate,
}: Props) {
  const tabIndex = menuOpen ? undefined : -1;

  return (
    <nav className="home-side-menu-nav" aria-label="Main navigation">
      {SITE_GAME_NAV.map((item) => {
        const parentActive = isSiteNavItemActive(item, pathname);
        if (!hasChildren(item)) {
          return (
            <Link
              key={item.id}
              href={item.href}
              prefetch
              className={`home-side-menu-link${parentActive ? " is-active" : ""}`}
              onClick={(event) => onNavigate(event, item.href)}
              tabIndex={tabIndex}
            >
              {item.label}
            </Link>
          );
        }

        const open = openId === item.id || (openId === null && parentActive);
        return (
          <div
            key={item.id}
            className={`home-side-acc${open ? " is-open" : ""}${parentActive ? " is-active" : ""}`}
          >
            <button
              type="button"
              className={`home-side-acc-trigger${parentActive ? " is-active" : ""}`}
              aria-expanded={open}
              tabIndex={tabIndex}
              onClick={() => onOpenIdChange(open && openId === item.id ? null : item.id)}
            >
              <span>{item.label}</span>
              <span className="home-side-acc-caret" aria-hidden>
                {open ? "▾" : "▸"}
              </span>
            </button>
            {open ? (
              <div className="home-side-acc-panel">
                {item.children.map((child) => (
                  <Link
                    key={`${item.id}-${child.href}-${child.label}`}
                    href={child.href}
                    prefetch
                    className={`home-side-menu-link home-side-acc-link${
                      isSiteNavChildActive(child.href, pathname) ? " is-active" : ""
                    }`}
                    onClick={(event) => onNavigate(event, child.href)}
                    tabIndex={tabIndex}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
