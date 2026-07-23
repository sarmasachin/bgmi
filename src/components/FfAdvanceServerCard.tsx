"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FF_ADVANCE_SERVER } from "@/src/lib/ffAdvanceServer";

/**
 * Advance Server OB55 guide card — SEO copy + bullets.
 * APK CTA opens official Garena portal only (noopener).
 */
export function FfAdvanceServerCard() {
  const pathname = usePathname() ?? "";
  if (pathname !== "/" && pathname !== "") return null;

  const adv = FF_ADVANCE_SERVER;

  return (
    <section className="ff-advance" aria-labelledby="ff-advance-title">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
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

        <p className="ff-advance-note">{adv.note}</p>

        <div className="ff-advance-actions">
          <a
            className="ff-advance-btn ff-advance-btn--primary"
            href={adv.officialUrl}
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
