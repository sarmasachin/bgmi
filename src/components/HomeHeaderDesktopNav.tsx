"use client";

import Link from "next/link";
import { Fragment, useEffect, useRef } from "react";
import type { MouseEvent } from "react";
import { FreeFireIndiaMenuLabel } from "@/src/components/FreeFireIndiaMenuLabel";
import {
  FREE_FIRE_INDIA_MENU,
  isFreeFireIndiaDesktopPath,
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
  /** Red LIVE mark above Free Fire India. Only on Free Fire and Free Fire Max pages. */
  showIndiaLive?: boolean;
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
  showIndiaLive = false,
}: Props) {
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const indiaActive = isFreeFireIndiaDesktopPath(pathname);
  const indiaOpen = openId === "free-fire-india";

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
        const node = !hasChildren(item) ? (
          <Link
            key={item.id}
            href={item.href}
            prefetch
            className={parentActive ? "is-active" : undefined}
            onClick={(event) => onNavigate(event, item.href)}
          >
            {item.label}
          </Link>
        ) : (
          <div
            key={item.id}
            className={`home-nav-dd${openId === item.id ? " is-open" : ""}${parentActive ? " is-active" : ""}`}
            onMouseEnter={() => openMenu(item.id)}
            onMouseLeave={scheduleClose}
          >
            <button
              type="button"
              className={`home-nav-dd-trigger${parentActive ? " is-active" : ""}`}
              aria-expanded={openId === item.id}
              aria-haspopup="true"
              onClick={() => (openId === item.id ? scheduleClose() : openMenu(item.id))}
            >
              <span>{item.label}</span>
              <span className="home-nav-dd-caret" aria-hidden>
                ▾
              </span>
            </button>
            <div className="home-nav-dd-panel" role="menu" hidden={openId !== item.id}>
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

        if (item.id !== "home") return node;
        return (
          <Fragment key="home-and-india">
            {node}
            <div
              className={`home-nav-dd${indiaOpen ? " is-open" : ""}${indiaActive ? " is-active" : ""}${showIndiaLive ? " has-live" : ""}`}
              onMouseEnter={() => openMenu("free-fire-india")}
              onMouseLeave={scheduleClose}
            >
              <button
                type="button"
                className={`home-nav-dd-trigger${indiaActive ? " is-active" : ""}`}
                aria-expanded={indiaOpen}
                aria-haspopup="true"
                onClick={() => (indiaOpen ? scheduleClose() : openMenu("free-fire-india"))}
              >
                {showIndiaLive ? (
                  <span className="home-nav-live" aria-hidden>
                    LIVE
                  </span>
                ) : null}
                <span>
                  <FreeFireIndiaMenuLabel />
                </span>
                <span className="home-nav-dd-caret" aria-hidden>
                  ▾
                </span>
              </button>
              <div className="home-nav-dd-panel" role="menu" hidden={!indiaOpen}>
                <div className="home-nav-dd-panel-inner">
                  {FREE_FIRE_INDIA_MENU.map((child) => (
                    <Link
                      key={child.href}
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
          </Fragment>
        );
      })}
    </nav>
  );
}
