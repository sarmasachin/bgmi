"use client";

import { GTA6_APK_PATH } from "@/src/features/gta6Calculator/gta6-apk-copy";
import { newsCategoryListingPath } from "@/src/lib/newsCategories";
import { usePathname } from "next/navigation";

const CHEAT_PATH = "/gta-6-cheat-code";
const NEWS_PATH = newsCategoryListingPath("gta-6");

export function Gta6Header({ path }: { path: string }) {
  const pathname = usePathname() || "";
  const onCheat = pathname === CHEAT_PATH || pathname.startsWith(`${CHEAT_PATH}/`);
  const onApk = pathname === GTA6_APK_PATH || pathname.startsWith(`${GTA6_APK_PATH}/`);
  const onNews = pathname === NEWS_PATH || pathname.startsWith(`${NEWS_PATH}/`);
  const onHome = !onCheat && !onApk && !onNews && pathname.startsWith(path);

  return (
    <nav className="home-header-nav" aria-label="GTA 6">
      <a href={path} className={onHome ? "is-active" : undefined} aria-current={onHome ? "page" : undefined}>
        Home
      </a>
      <a href={`${path}#calculator`}>Calculator</a>
      <a href={CHEAT_PATH} className={onCheat ? "is-active" : undefined} aria-current={onCheat ? "page" : undefined}>
        Cheats
      </a>
      <a href={GTA6_APK_PATH} className={onApk ? "is-active" : undefined} aria-current={onApk ? "page" : undefined}>
        GT6 APK
      </a>
      <a href={NEWS_PATH} className={onNews ? "is-active" : undefined} aria-current={onNews ? "page" : undefined}>
        News
      </a>
      <a href="/">Games</a>
    </nav>
  );
}
