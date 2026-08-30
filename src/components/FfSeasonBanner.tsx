"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FF_MAX_SEASON_EVENT, FF_SEASON_EVENT } from "@/src/lib/ffSeasonEvent";
import { FREE_FIRE_MAX_PATH } from "@/src/lib/freeFirePages";
import {
  isHomeFfPath,
  isLiteCalculatorPath,
  pickLitePageContent,
} from "@/src/lib/gamePagePath";
import type { FfHomeSeason } from "@/src/lib/homeCardsTypes";

type Props = {
  homeContent?: FfHomeSeason;
  liteContent?: FfHomeSeason;
  pubgLiteContent?: FfHomeSeason;
};

/**
 * Season / event banner.
 * Home = Free Fire; Max = Free Fire Max; Lite pages = BGMI Lite / PUBG Mobile Lite.
 */
export function FfSeasonBanner({ homeContent, liteContent, pubgLiteContent }: Props) {
  const pathname = usePathname() ?? "";
  const isHome = isHomeFfPath(pathname);
  const isMax = pathname === FREE_FIRE_MAX_PATH;
  const isLite = isLiteCalculatorPath(pathname);
  if (!isHome && !isMax && !isLite) return null;

  const event = isLite
    ? pickLitePageContent(pathname, homeContent, liteContent, pubgLiteContent)
    : (homeContent ?? (isMax ? FF_MAX_SEASON_EVENT : FF_SEASON_EVENT));
  if (!event) return null;

  return (
    <section className="ff-season" aria-labelledby="ff-season-title">
      <div className="ff-season-card">
        <div className="ff-season-main">
          <span className="ff-season-badge">
            <i className="fa-solid fa-gift" aria-hidden />
            {event.badge}
          </span>
          <div className="ff-season-copy">
            <p className="ff-season-meta">
              <time dateTime={event.dateIso}>{event.dateLabel}</time>
            </p>
            <h2 id="ff-season-title" className="ff-season-title">
              {event.title}
            </h2>
            <p className="ff-season-summary">{event.summary}</p>
          </div>
        </div>
        <div className="ff-season-actions">
          <Link className="ff-season-btn ff-season-btn--primary" href={event.ctaPath}>
            {event.ctaLabel}
            <i className="fa-solid fa-arrow-right" aria-hidden />
          </Link>
          <Link className="ff-season-btn ff-season-btn--ghost" href={event.secondaryPath}>
            {event.secondaryLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
