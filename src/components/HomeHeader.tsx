"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import type { MouseEvent } from "react";
import { HomeHeaderDesktopNav } from "@/src/components/HomeHeaderDesktopNav";
import { HomeHeaderSideNav } from "@/src/components/HomeHeaderSideNav";
import {
  FREE_FIRE_MAX_PATH,
  FREE_FIRE_PATH,
} from "@/src/lib/freeFirePages";
import { PUBG_MOBILE_CODES_PATH } from "@/src/lib/pubgMobileCodes";
import { PUBG_MOBILE_LITE_PATH } from "@/src/lib/pubgMobileLite";
import { resolveNavForPath } from "@/src/lib/resolveNavForPath";
import {
  isSiteNavItemActive,
  SITE_GAME_NAV,
  SITE_GAME_NAV_PREFETCH_HREFS,
} from "@/src/lib/siteGameNav";

type NavLink = { label: string; href: string };

type HomeHeaderProps = {
  /** Top bar / logo row title (admin: Website Settings → Home page titles). */
  siteTitle: string;
  /** Same list as footer; used to resolve mobile chip (family) menu. */
  navigation: NavLink[];
};

function normalizePath(path: string | null | undefined) {
  return typeof path === "string" ? path : "";
}

function isChipActive(href: string, activePath: string) {
  if (href === "/") return activePath === "/" || activePath === "";
  return activePath === href || activePath.startsWith(`${href}/`);
}

export function HomeHeader({ siteTitle, navigation }: HomeHeaderProps) {
  const pathname = normalizePath(usePathname());
  const router = useRouter();
  const [, startTransition] = useTransition();
  const normalized = navigation.map((item) => {
    const label = item.label.trim();
    if (/pubg\s*mobile\s*code/i.test(label)) {
      return { ...item, href: PUBG_MOBILE_CODES_PATH };
    }
    if (/pubg/i.test(label) && (item.href === "/" || !item.href.trim())) {
      return { ...item, href: "/pubg" };
    }
    if (/^bgmi\s*lite$/i.test(label)) {
      return { ...item, href: "/bgmi-lite" };
    }
    if (/pubg\s*mobile\s*lite/i.test(label)) {
      return { ...item, href: PUBG_MOBILE_LITE_PATH };
    }
    if (/^bgmi$/i.test(label)) {
      return { ...item, href: "/bgmi" };
    }
    if (/free\s*fire\s*max/i.test(label)) {
      return { ...item, href: FREE_FIRE_MAX_PATH };
    }
    if (/free\s*fire/i.test(label) && !/max/i.test(label)) {
      return { ...item, href: "/" };
    }
    return item;
  });
  /** Mobile chip row: path family menu (FF page → FF links, Max → Max, …). */
  const familyLinks = resolveNavForPath(pathname, normalized);
  const [scrollHidden, setScrollHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [desktopOpenId, setDesktopOpenId] = useState<string | null>(null);
  const [sideOpenId, setSideOpenId] = useState<string | null>(null);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const lastScrollY = useRef(0);
  const sideMenuRef = useRef<HTMLElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const activePath = pendingPath ?? pathname;

  useEffect(() => {
    for (const href of SITE_GAME_NAV_PREFETCH_HREFS) {
      router.prefetch(href);
    }
  }, [router]);

  useEffect(() => {
    setPendingPath(null);
    setDesktopOpenId(null);
  }, [pathname]);

  useEffect(() => {
    lastScrollY.current = window.scrollY;
    const onScroll = () => {
      // Keep header still while a desktop dropdown is open (submenu clickable).
      if (menuOpen || desktopOpenId) return;
      const y = window.scrollY
      const delta = y - lastScrollY.current;
      lastScrollY.current = y;
      if (y < 48) {
        setScrollHidden(false);
        return;
      }
      if (delta > 8) setScrollHidden(true);
      else if (delta < -8) setScrollHidden(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [menuOpen, desktopOpenId]);

  useEffect(() => {
    const el = sideMenuRef.current;
    if (!el) return;
    el.inert = !menuOpen;
    // Closing: don't leave focus inside an aria-hidden / inert drawer.
    if (!menuOpen) {
      const active = document.activeElement;
      if (active instanceof HTMLElement && el.contains(active)) {
        active.blur();
      }
    }
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [menuOpen]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 851 && menuOpen) {
        releaseSideMenuFocus();
        setMenuOpen(false);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const active = SITE_GAME_NAV.find((item) => isSiteNavItemActive(item, pathname));
    if (active?.children?.length) setSideOpenId(active.id);
  }, [menuOpen, pathname]);

  function releaseSideMenuFocus() {
    const side = sideMenuRef.current;
    const active = document.activeElement;
    if (side && active instanceof HTMLElement && side.contains(active)) {
      active.blur();
    }
  }

  function closeMenu() {
    releaseSideMenuFocus();
    setMenuOpen(false);
    // Return focus to the hamburger so aria-hidden is not applied over a focused descendant.
    queueMicrotask(() => menuBtnRef.current?.focus({ preventScroll: true }));
  }

  function onNavClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
    closeMenu();
    setDesktopOpenId(null);
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }
    if (href === pathname) {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    startTransition(() => {
      setPendingPath(href);
      router.push(href);
    });
  }

  return (
    <>
      <div className="home-header-spacer" aria-hidden />
      <header
        className={`home-site-header${scrollHidden ? " home-header--scroll-hidden" : ""}${
          menuOpen ? " home-header--menu-open" : ""
        }`}
      >
        <div className="home-header-inner">
          <div className="home-header-top-row">
            <div className="home-header-left">
              <button
                ref={menuBtnRef}
                type="button"
                className={`home-header-menu-btn${menuOpen ? " is-open" : ""}`}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                aria-controls={menuId}
                onClick={() => {
                  if (menuOpen) {
                    closeMenu();
                    return;
                  }
                  setMenuOpen(true);
                }}
              >
                <span className="home-header-menu-line" />
                <span className="home-header-menu-line" />
                <span className="home-header-menu-line" />
              </button>

              <Link href="/" className="home-header-logo-link" aria-label="Home" onClick={closeMenu}>
                <Image
                  src="/sens-master-logo.svg"
                  alt=""
                  width={36}
                  height={36}
                  className="home-header-logo-img"
                  priority
                />
              </Link>

              <Link href="/" className="home-header-title-link" onClick={closeMenu}>
                <span className="home-header-title">{siteTitle}</span>
              </Link>
            </div>

            <HomeHeaderDesktopNav
              pathname={activePath}
              openId={desktopOpenId}
              onOpenIdChange={setDesktopOpenId}
              onNavigate={onNavClick}
            />
          </div>

          <nav className="home-header-nav" aria-label="Games">
            {familyLinks.map((item) => (
              <Link
                key={`chip-${item.href}-${item.label}`}
                href={item.href}
                prefetch
                className={isChipActive(item.href, activePath) ? "is-active" : undefined}
                onClick={(event) => onNavClick(event, item.href)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <div
        className={`home-menu-overlay${menuOpen ? " is-open" : ""}`}
        onClick={closeMenu}
        aria-hidden={!menuOpen}
      />

      <aside
        ref={sideMenuRef}
        id={menuId}
        className={`home-side-menu${menuOpen ? " is-open" : ""}`}
        aria-label="Site menu"
      >
        <Link
          href="/"
          className="home-side-menu-brand"
          onClick={closeMenu}
          tabIndex={menuOpen ? undefined : -1}
        >
          <Image
            src="/sens-master-logo.svg"
            alt=""
            width={44}
            height={44}
            className="home-side-menu-logo"
          />
        </Link>
        <HomeHeaderSideNav
          pathname={activePath}
          menuOpen={menuOpen}
          openId={sideOpenId}
          onOpenIdChange={setSideOpenId}
          onNavigate={onNavClick}
        />
      </aside>
    </>
  );
}
