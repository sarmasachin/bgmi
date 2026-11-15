"use client";

import { usePathname } from "next/navigation";

const CHEAT_PATH = "/gta-6-cheat-code";

export function Gta6Header({ path }: { path: string }) {
  const pathname = usePathname() || "";
  const onCheat = pathname === CHEAT_PATH || pathname.startsWith(`${CHEAT_PATH}/`);
  const onHome = !onCheat && pathname.startsWith(path);

  return (
    <nav className="home-header-nav" aria-label="GTA 6">
      <a href={path} className={onHome ? "is-active" : undefined} aria-current={onHome ? "page" : undefined}>
        Home
      </a>
      <a href={`${path}#calculator`}>Calculator</a>
      <a href={CHEAT_PATH} className={onCheat ? "is-active" : undefined} aria-current={onCheat ? "page" : undefined}>
        Cheats
      </a>
      <a href={`${path}#news`}>News</a>
      <a href="/">Games</a>
    </nav>
  );
}
