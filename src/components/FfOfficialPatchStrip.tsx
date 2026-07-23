"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FF_SITE_PATCH } from "@/src/lib/ffOfficialPatch";

/**
 * Home-only update strip — all CTAs stay on this website (news), no external links.
 */
export function FfOfficialPatchStrip() {
  const pathname = usePathname() ?? "";
  if (pathname !== "/" && pathname !== "") return null;

  const patch = FF_SITE_PATCH;

  return (
    <aside className="ff-patch-strip" aria-label="Free Fire update news">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
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
