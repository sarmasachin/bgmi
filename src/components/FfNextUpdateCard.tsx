"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FF_MAX_NEXT_UPDATE, FF_NEXT_UPDATE } from "@/src/lib/ffNextUpdate";
import { FREE_FIRE_MAX_PATH } from "@/src/lib/freeFirePages";

/**
 * Next update card (OB55 teaser) — own copy only, on-site CTAs.
 * Home uses Free Fire copy; Max page uses Free Fire Max copy.
 */
export function FfNextUpdateCard() {
  const pathname = usePathname() ?? "";
  const isHome = pathname === "/" || pathname === "";
  const isMax = pathname === FREE_FIRE_MAX_PATH;
  if (!isHome && !isMax) return null;

  const next = isMax ? FF_MAX_NEXT_UPDATE : FF_NEXT_UPDATE;

  return (
    <section className="ff-next" aria-labelledby="ff-next-title">
      <article className="ff-next-card">
        <div className="ff-next-top">
          <span className="ff-next-badge">
            <i className="fa-solid fa-rocket" aria-hidden />
            {next.badge}
          </span>
          <span className="ff-next-code">{next.code}</span>
        </div>

        <p className="ff-next-meta">
          <time dateTime={next.metaIso}>{next.meta}</time>
        </p>
        <h2 id="ff-next-title" className="ff-next-title">
          {next.title}
        </h2>
        <p className="ff-next-summary">{next.summary}</p>

        <ul className="ff-next-features">
          {next.features.map((feature) => (
            <li key={feature}>
              <i className="fa-solid fa-check" aria-hidden />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {next.note ? <p className="ff-next-note">{next.note}</p> : null}

        <div className="ff-next-actions">
          <Link className="ff-next-btn ff-next-btn--primary" href={next.primaryPath}>
            {next.primaryCta}
            <i className="fa-solid fa-arrow-right" aria-hidden />
          </Link>
          <Link className="ff-next-btn ff-next-btn--ghost" href={next.secondaryPath}>
            {next.secondaryCta}
          </Link>
        </div>
      </article>
    </section>
  );
}
