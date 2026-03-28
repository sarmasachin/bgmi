"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type NavLink = { label: string; href: string };

type HomeHeaderProps = {
  /** Top bar / logo row title (admin: Website Settings → Home page titles). */
  siteTitle: string;
  /** Same list as footer main column & admin “Header & footer column” links. */
  navigation: NavLink[];
};

export function HomeHeader({ siteTitle, navigation }: HomeHeaderProps) {
  const [scrollHidden, setScrollHidden] = useState(false);
  const [spacerHeight, setSpacerHeight] = useState(96);
  const lastScrollY = useRef(0);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const measure = () => {
      if (headerRef.current) {
        setSpacerHeight(headerRef.current.offsetHeight);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    lastScrollY.current = window.scrollY;
    const onScroll = () => {
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
  }, []);

  return (
    <>
      <div className="home-header-spacer" style={{ height: spacerHeight }} aria-hidden />
      <header
        ref={headerRef}
        className={`home-site-header${scrollHidden ? " home-header--scroll-hidden" : ""}`}
      >
        <div className="home-header-inner">
          <div className="home-header-top-row">
            <Link href="/" className="home-header-logo-link" aria-label="Home">
              <Image
                src="/sens-master-logo.svg"
                alt=""
                width={40}
                height={40}
                className="home-header-logo-img"
                priority
              />
            </Link>
            <Link href="/" className="home-header-title-link">
              <span className="home-header-title">{siteTitle}</span>
            </Link>
            <div className="home-header-balance" aria-hidden />
          </div>
          <nav className="home-header-nav" aria-label="Main navigation">
            {navigation.map((item) => (
              <Link key={`${item.href}-${item.label}`} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
    </>
  );
}
