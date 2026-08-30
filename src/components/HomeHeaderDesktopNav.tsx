"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { MouseEvent } from "react";
import {
  isSiteNavChildActive,
  isSiteNavItemActive,
  SITE_GAME_NAV,
  type SiteNavItem,
} from "@/src/lib/siteGameNav";

type Props = {
  pathname: string;
  openId: string | null;
  onOpenIdChange: (id: string | null) => void;
  onNavigate: (event: MouseEvent<HTMLAnchorElement>, href: string) => void;
};

function hasChildren(
  item: SiteNavItem,
): item is SiteNavItem & { children: NonNullable<SiteNavItem["children"]> } {
  return Boolean(item.children && item.children.length > 0);
}

const CLOSE_DELAY_MS = 180;

/** Desktop top bar: flat links + hover/click dropdowns for games with submenus. */
export function HomeHeaderDesktopNav({
  pathname,
  openId,
  onOpenIdChange,
  onNavigate,
}: Props) {
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  function openMenu(id: string) {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    onOpenIdChange(id);
  }

  function scheduleClose() {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null;
      onOpenIdChange(null);
    }, CLOSE_DELAY_MS);
  }

  return (
    <nav className="home-header-desktop-nav" aria-label="Main navigation">
      {SITE_GAME_NAV.map((item) => {
        const parentActive = isSiteNavItemActive(item, pathname);
        if (!hasChildren(item)) {
          return (
            <Link
              key={item.id}
              href={item.href}
              prefetch
              className={parentActive ? "is-active" : undefined}
              onClick={(event) => onNavigate(event, item.href)}
            >
              {item.label}
            </Link>
          );
        }

        const open = openId === item.id;
        return (
          <div
            key={item.id}
            className={`home-nav-dd${open ? " is-open" : ""}${parentActive ? " is-active" : ""}`}
            onMouseEnter={() => openMenu(item.id)}
            onMouseLeave={scheduleClose}
          >
            <button
              type="button"
              className={`home-nav-dd-trigger${parentActive ? " is-active" : ""}`}
              aria-expanded={open}
              aria-haspopup="true"
              onClick={() => (open ? scheduleClose() : openMenu(item.id))}
            >
              <span>{item.label}</span>
              <span className="home-nav-dd-caret" aria-hidden>
                ▾
              </span>
            </button>
            <div className="home-nav-dd-panel" role="menu" hidden={!open}>
              <div className="home-nav-dd-panel-inner">
                {item.children.map((child) => (
                  <Link
                    key={`${item.id}-${child.href}-${child.label}`}
                    href={child.href}
                    prefetch
                    role="menuitem"
                    className={`home-nav-dd-link${
                      isSiteNavChildActive(child.href, pathname) ? " is-active" : ""
                    }`}
                    onClick={(event) => {
                      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
                      onOpenIdChange(null);
                      onNavigate(event, child.href);
                    }}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </nav>
  );
}
