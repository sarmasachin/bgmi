"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FF_MAX_SITE_PATCH, FF_SITE_PATCH } from "@/src/lib/ffOfficialPatch";
import { FREE_FIRE_MAX_PATH } from "@/src/lib/freeFirePages";
import {
  getLiteCalcBrand,
  isHomeFfPath,
  isLiteCalculatorPath,
  pickLitePageContent,
} from "@/src/lib/gamePagePath";
import type { FfHomePatchStrip } from "@/src/lib/homeCardsTypes";

type Props = {
  homeContent?: FfHomePatchStrip;
  liteContent?: FfHomePatchStrip;
  pubgLiteContent?: FfHomePatchStrip;
};

/**
 * Update strip — CTAs stay on this website (news).
 * Home = Free Fire; Max = Free Fire Max; Lite pages = BGMI Lite / PUBG Mobile Lite.
 */
export function FfPatchStrip({ homeContent, liteContent, pubgLiteContent }: Props) {
  const pathname = usePathname() ?? "";
  const isHome = isHomeFfPath(pathname);
  const isMax = pathname === FREE_FIRE_MAX_PATH;
  const isLite = isLiteCalculatorPath(pathname);
  if (!isHome && !isMax && !isLite) return null;

  const patch = isLite
    ? pickLitePageContent(pathname, homeContent, liteContent, pubgLiteContent)
    : (homeContent ?? (isMax ? FF_MAX_SITE_PATCH : FF_SITE_PATCH));
  if (!patch) return null;

  const brand = getLiteCalcBrand(pathname);
  const aria =
    brand === "pubg-mobile-lite"
      ? "PUBG Mobile Lite update news"
      : brand === "bgmi-lite"
        ? "BGMI Lite update news"
        : isMax
          ? "Free Fire Max update news"
          : "Free Fire update news";

  return (
    <aside className="ff-patch-strip" aria-label={aria}>
      <div className="ff-patch-strip-inner">
        <div className="ff-patch-strip-main">
          <span className="ff-patch-badge">
            <i className="fa-solid fa-bolt" aria-hidden />
            {patch.label}
          </span>
          <div className="ff-patch-copy">
            <p className="ff-patch-meta">
              <span>{patch.typeLabel}</span>
              <span aria-hidden>·</span>
              <time dateTime={patch.dateIso}>{patch.dateLabel}</time>
            </p>
            <p className="ff-patch-summary">{patch.summary}</p>
          </div>
        </div>
        <div className="ff-patch-actions">
          <Link className="ff-patch-btn" href={patch.articlePath || "/news"}>
            {patch.primaryCta || "Latest news"}
          </Link>
          <Link className="ff-patch-btn is-ghost" href={patch.newsListPath || "/news"}>
            {patch.secondaryCta || "All news"}
          </Link>
        </div>
      </div>
    </aside>
  );
}
