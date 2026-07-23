"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FF_SEASON_EVENT } from "@/src/lib/ffSeasonEvent";

/**
 * Point 5 — official-site “Special Event / season” direction.
 * Safe: own copy only; links stay on this website (news + calculator).
 */
export function FfSeasonBanner() {
  const pathname = usePathname() ?? "";
  if (pathname !== "/" && pathname !== "") return null;

  const event = FF_SEASON_EVENT;

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
