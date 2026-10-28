"use client";

import Link from "next/link";
import { Fragment } from "react";
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
  const indiaActive = isFreeFireIndiaDesktopPath(pathname);
  const indiaOpen = openId === "free-fire-india" || (openId === null && indiaActive);

  return (
    <nav className="home-side-menu-nav" aria-label="Main navigation">
      {SITE_GAME_NAV.map((item) => {
        const parentActive = isSiteNavItemActive(item, pathname);
        const node = !hasChildren(item) ? (
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
        ) : (
          <SideAccordion
            key={item.id}
            item={item}
            pathname={pathname}
            open={openId === item.id || (openId === null && parentActive)}
            openId={openId}
            parentActive={parentActive}
            tabIndex={tabIndex}
            onOpenIdChange={onOpenIdChange}
            onNavigate={onNavigate}
          />
        );

        if (item.id !== "home") return node;
        return (
          <Fragment key="home-and-india">
            {node}
            <div
              className={`home-side-acc${indiaOpen ? " is-open" : ""}${indiaActive ? " is-active" : ""}`}
            >
              <button
                type="button"
                className={`home-side-acc-trigger${indiaActive ? " is-active" : ""}`}
                aria-expanded={indiaOpen}
                tabIndex={tabIndex}
                onClick={() => onOpenIdChange(indiaOpen && openId === "free-fire-india" ? null : "free-fire-india")}
              >
                <span>
                  <FreeFireIndiaMenuLabel />
                </span>
                <span className="home-side-acc-caret" aria-hidden>
                  {indiaOpen ? "▾" : "▸"}
                </span>
              </button>
              {indiaOpen ? (
                <div className="home-side-acc-panel">
                  {FREE_FIRE_INDIA_MENU.map((child) => (
                    <Link
                      key={`free-fire-india-${child.href}`}
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
          </Fragment>
        );
      })}
    </nav>
  );
}

function SideAccordion({
  item,
  pathname,
  open,
  openId,
  parentActive,
  tabIndex,
  onOpenIdChange,
  onNavigate,
}: {
  item: SiteNavItem & { children: NonNullable<SiteNavItem["children"]> };
  pathname: string;
  open: boolean;
  openId: string | null;
  parentActive: boolean;
  tabIndex: number | undefined;
  onOpenIdChange: (id: string | null) => void;
  onNavigate: (event: MouseEvent<HTMLAnchorElement>, href: string) => void;
}) {
  return (
    <div className={`home-side-acc${open ? " is-open" : ""}${parentActive ? " is-active" : ""}`}>
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
}
