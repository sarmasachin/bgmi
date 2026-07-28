"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FF_ADVANCE_SERVER, FF_MAX_ADVANCE_SERVER } from "@/src/lib/ffAdvanceServer";
import { FREE_FIRE_MAX_PATH } from "@/src/lib/freeFirePages";
import type { FfHomeFeatureCard } from "@/src/lib/homeCardsTypes";

type Props = {
  homeContent?: FfHomeFeatureCard;
};

/**
 * Advance Server OB55 guide card — SEO copy + bullets.
 * APK CTA opens official Garena portal only (noopener).
 * Home = Free Fire copy; Max page = Free Fire Max copy.
 */
export function FfAdvanceServerCard({ homeContent }: Props) {
  const pathname = usePathname() ?? "";
  const isHome = pathname === "/" || pathname === "";
  const isMax = pathname === FREE_FIRE_MAX_PATH;
  if (!isHome && !isMax) return null;

  const adv =
    homeContent ??
    (isMax
      ? { ...FF_MAX_ADVANCE_SERVER, features: [...FF_MAX_ADVANCE_SERVER.features] }
      : { ...FF_ADVANCE_SERVER, features: [...FF_ADVANCE_SERVER.features] });

  return (
    <section className="ff-advance" aria-labelledby="ff-advance-title">
      <article className="ff-advance-card">
        <div className="ff-advance-top">
          <span className="ff-advance-badge">
            <i className="fa-solid fa-server" aria-hidden />
            {adv.badge}
          </span>
          <span className="ff-advance-code">{adv.code}</span>
        </div>

        <p className="ff-advance-meta">{adv.meta}</p>
        <h2 id="ff-advance-title" className="ff-advance-title">
          {adv.title}
        </h2>
        <p className="ff-advance-summary">{adv.summary}</p>

        <ul className="ff-advance-features">
          {adv.features.map((feature) => (
            <li key={feature}>
              <i className="fa-solid fa-check" aria-hidden />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {adv.note ? <p className="ff-advance-note">{adv.note}</p> : null}

        <div className="ff-advance-actions">
          <a
            className="ff-advance-btn ff-advance-btn--primary"
            href={adv.officialUrl || FF_ADVANCE_SERVER.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {adv.primaryCta}
            <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden />
          </a>
          <Link className="ff-advance-btn ff-advance-btn--ghost" href={adv.secondaryPath}>
            {adv.secondaryCta}
          </Link>
        </div>
      </article>
    </section>
  );
}
