"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FF_NEXT_UPDATE } from "@/src/lib/ffNextUpdate";

/**
 * Next update card (OB55 teaser) — own copy only, on-site CTAs.
 */
export function FfNextUpdateCard() {
  const pathname = usePathname() ?? "";
  if (pathname !== "/" && pathname !== "") return null;

  const next = FF_NEXT_UPDATE;

  return (
    <section className="ff-next" aria-labelledby="ff-next-title">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
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

        <p className="ff-next-note">{next.note}</p>

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
