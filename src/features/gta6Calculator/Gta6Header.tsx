"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import "@/src/features/gta6Calculator/gta6-header.css";

const CHEAT_PATH = "/gta-6-cheat-code";

export function Gta6Header({ path }: { path: string }) {
  const pathname = usePathname() || "";
  const onCheat = pathname === CHEAT_PATH || pathname.startsWith(`${CHEAT_PATH}/`);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const headerRef = useRef<HTMLElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const header = headerRef.current;
    const spacer = spacerRef.current;
    if (!header || !spacer) return;
    const sync = () => {
      spacer.style.height = `${header.offsetHeight}px`;
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    lastScrollY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastScrollY.current;
      lastScrollY.current = y;
      if (y < 48) {
        setHidden(false);
        return;
      }
      if (delta > 8) setHidden(true);
      else if (delta < -8) setHidden(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div ref={spacerRef} className="gta6-header-spacer" aria-hidden="true" />
      <header ref={headerRef} className={hidden ? "gta6-header is-scroll-hidden" : "gta6-header"}>
        <a className="gta6-mark" href={path}>
          GTA 6 Sensitivity
        </a>
        <nav className="gta6-nav" aria-label="GTA 6">
          <a href={path} aria-current={!onCheat && pathname.startsWith(path) ? "page" : undefined}>
            Home
          </a>
          <a href={`${path}#calculator`}>Calculator</a>
          <a href={CHEAT_PATH} aria-current={onCheat ? "page" : undefined}>
            Cheats
          </a>
          <a href={`${path}#news`}>News</a>
          <a href="/">Games</a>
        </nav>
      </header>
    </>
  );
}
