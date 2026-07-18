"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useOptimistic, useRef, useState, useTransition } from "react";
import type { MouseEvent } from "react";

type NavLink = { label: string; href: string };

type HomeHeaderProps = {
  /** Top bar / logo row title (admin: Website Settings → Home page titles). */
  siteTitle: string;
  /** Same list as footer main column & admin “Header & footer column” links. */
  navigation: NavLink[];
};

function isGameHref(href: string) {
  return href === "/" || href === "/pubg";
}

export function HomeHeader({ siteTitle, navigation }: HomeHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const links = navigation.map((item) => {
    const label = item.label.trim();
    if (/pubg/i.test(label) && (item.href === "/" || !item.href.trim())) {
      return { ...item, href: "/pubg" };
    }
    if (/^bgmi$/i.test(label)) {
      return { ...item, href: "/" };
    }
    return item;
  });
  const [scrollHidden, setScrollHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [spacerHeight, setSpacerHeight] = useState(104);
  const [optimisticPath, setOptimisticPath] = useOptimistic(pathname);
  const lastScrollY = useRef(0);
  const headerRef = useRef<HTMLElement>(null);
  const menuId = useId();

  // Prefetch game routes so BGMI ↔ PUBG feels instant.
  useEffect(() => {
    router.prefetch("/");
    router.prefetch("/pubg");
  }, [router]);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const measure = () => {
      setSpacerHeight(el.offsetHeight);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    // Fonts / first paint can change height after mount
    const t1 = window.setTimeout(measure, 50);
    const t2 = window.setTimeout(measure, 250);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [links, menuOpen]);

  useEffect(() => {
    lastScrollY.current = window.scrollY;
    const onScroll = () => {
      if (menuOpen) return;
      const y = window.scrollY;
      const delta = y - lastScrollY.current;
      lastScrollY.current = y;

      if (y < 48) {
        setScrollHidden(false);
        return;
      }
      if (delta > 8) {
        setScrollHidden(true);
      } else if (delta < -8) {
        setScrollHidden(false);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
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
      if (window.innerWidth >= 851) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  function closeMenu() {
    setMenuOpen(false);
  }

  function isActiveHref(href: string) {
    const path = optimisticPath || pathname;
    if (href === "/") return path === "/";
    return path === href || path.startsWith(`${href}/`);
  }

  function onGameNavClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
    closeMenu();
    if (!isGameHref(href)) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }
    if (href === pathname) {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    startTransition(() => {
      setOptimisticPath(href);
      router.push(href);
    });
  }

  return (
    <>
      <div className="home-header-spacer" style={{ height: spacerHeight }} aria-hidden />
      <header
        ref={headerRef}
        className={`home-site-header${scrollHidden ? " home-header--scroll-hidden" : ""}${
          menuOpen ? " home-header--menu-open" : ""
        }`}
      >
        <div className="home-header-inner">
          <div className="home-header-top-row">
            <div className="home-header-left">
              <button
                type="button"
                className={`home-header-menu-btn${menuOpen ? " is-open" : ""}`}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                aria-controls={menuId}
                onClick={() => setMenuOpen((open) => !open)}
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

            <nav className="home-header-desktop-nav" aria-label="Main navigation">
              {links.map((item) => (
                <Link
                  key={`desk-${item.href}-${item.label}`}
                  href={item.href}
                  prefetch
                  className={isActiveHref(item.href) ? "is-active" : undefined}
                  onClick={(event) => onGameNavClick(event, item.href)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <nav className="home-header-nav" aria-label="Games">
            {links.map((item) => (
              <Link
                key={`mob-${item.href}-${item.label}`}
                href={item.href}
                prefetch
                className={isActiveHref(item.href) ? "is-active" : undefined}
                onClick={(event) => onGameNavClick(event, item.href)}
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
        id={menuId}
        className={`home-side-menu${menuOpen ? " is-open" : ""}`}
        aria-hidden={!menuOpen}
        aria-label="Site menu"
      >
        <Link href="/" className="home-side-menu-brand" onClick={closeMenu}>
          <Image
            src="/sens-master-logo.svg"
            alt=""
            width={44}
            height={44}
            className="home-side-menu-logo"
          />
        </Link>
        <nav className="home-side-menu-nav" aria-label="Main navigation">
          {navigation.length ? (
            links.map((item) => (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                prefetch
                className={`home-side-menu-link${isActiveHref(item.href) ? " is-active" : ""}`}
                onClick={(event) => onGameNavClick(event, item.href)}
              >
                {item.label}
              </Link>
            ))
          ) : (
            <p className="home-side-menu-empty">No menu items yet</p>
          )}
        </nav>
      </aside>
    </>
  );
}
