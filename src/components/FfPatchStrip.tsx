"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FF_MAX_SITE_PATCH, FF_SITE_PATCH } from "@/src/lib/ffOfficialPatch";
import { FREE_FIRE_MAX_PATH } from "@/src/lib/freeFirePages";
import type { FfHomePatchStrip } from "@/src/lib/homeCardsTypes";

type Props = {
  homeContent?: FfHomePatchStrip;
};

/**
 * Update strip — CTAs stay on this website (news).
 * Home = Free Fire copy; Max page = Free Fire Max copy.
 */
export function FfPatchStrip({ homeContent }: Props) {
  const pathname = usePathname() ?? "";
  const isHome = pathname === "/" || pathname === "";
  const isMax = pathname === FREE_FIRE_MAX_PATH;
  if (!isHome && !isMax) return null;

  const patch = homeContent ?? (isMax ? FF_MAX_SITE_PATCH : FF_SITE_PATCH);

  return (
    <aside className="ff-patch-strip" aria-label={isMax ? "Free Fire Max update news" : "Free Fire update news"}>
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
        <div className="ff-patch-strip-actions">
          <Link className="ff-patch-btn ff-patch-btn--primary" href={patch.articlePath}>
            {patch.primaryCta}
            <i className="fa-solid fa-arrow-right" aria-hidden />
          </Link>
          <Link className="ff-patch-btn ff-patch-btn--ghost" href={patch.newsListPath}>
            {patch.secondaryCta}
          </Link>
        </div>
      </div>
    </aside>
  );
}
