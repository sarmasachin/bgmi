"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FREE_FIRE_MAX_PATH } from "@/src/lib/freeFirePages";
import {
  getLiteCalcBrand,
  isHomeFfPath,
  isLiteCalculatorPath,
} from "@/src/lib/gamePagePath";
import { newsCategoryListingPath } from "@/src/lib/newsCategories";

export const FF_NEWS_HUB_LIMIT = 5;

export type FfNewsHubItem = {
  id: string;
  slug: string;
  href: string;
  title: string;
  excerpt: string;
  dateLabel: string;
  dateIso: string;
  categoryLabel?: string;
  featureImage?: string;
};

type Props = {
  items: FfNewsHubItem[];
  total: number;
  /** When set, BGMI Lite calculator pages use these instead of mixed `items`. */
  liteItems?: FfNewsHubItem[];
  liteTotal?: number;
  /** When set, PUBG Mobile Lite calculator pages use these instead of BGMI Lite news. */
  pubgMobileLiteItems?: FfNewsHubItem[];
  pubgMobileLiteTotal?: number;
};

/**
 * Home / FF Max / Lite calculators — latest news hub: feature image + horizontal scroll, max 5.
 */
export function FfNewsHub({
  items,
  total,
  liteItems,
  liteTotal,
  pubgMobileLiteItems,
  pubgMobileLiteTotal,
}: Props) {
  const pathname = usePathname() ?? "";
  const isHome = isHomeFfPath(pathname);
  const isMax = pathname === FREE_FIRE_MAX_PATH;
  const isLite = isLiteCalculatorPath(pathname);
  if (!isHome && !isMax && !isLite) return null;

  const liteBrand = getLiteCalcBrand(pathname);
  const sourceItems =
    liteBrand === "pubg-mobile-lite" && pubgMobileLiteItems
      ? pubgMobileLiteItems
      : isLite && liteItems
        ? liteItems
        : items;
  const sourceTotal =
    liteBrand === "pubg-mobile-lite" && typeof pubgMobileLiteTotal === "number"
      ? pubgMobileLiteTotal
      : isLite && typeof liteTotal === "number"
        ? liteTotal
        : total;
  const visible = sourceItems.slice(0, FF_NEWS_HUB_LIMIT);
  if (!visible.length) return null;

  const shown = visible.length;
  const title = isLite
    ? liteBrand === "pubg-mobile-lite"
      ? "Latest PUBG Mobile Lite news"
      : "Latest BGMI Lite news"
    : isMax
      ? "Latest Free Fire Max news"
      : "Latest Free Fire News";
  const lead = isLite
    ? `Latest ${shown} Lite ${shown === 1 ? "story" : "stories"} — swipe sideways to browse`
    : isMax
      ? `Updates & guides for Max players — latest ${shown} ${shown === 1 ? "post" : "posts"}`
      : `Latest ${shown} ${shown === 1 ? "story" : "stories"} — swipe sideways to browse`;

  const viewAllHref =
    liteBrand === "pubg-mobile-lite"
      ? newsCategoryListingPath("pubg-mobile-lite")
      : liteBrand === "bgmi-lite"
        ? newsCategoryListingPath("bgmi-lite")
        : "/news";
  const viewAllLabel =
    liteBrand === "pubg-mobile-lite"
      ? "View all PUBG Mobile Lite news"
      : liteBrand === "bgmi-lite"
        ? "View all BGMI Lite news"
        : "View all news";

  return (
    <section className="ff-news-hub" aria-labelledby="ff-news-hub-title">
      <div className="ff-news-hub-head">
        <h2 id="ff-news-hub-title" className="ff-news-hub-title">
          {title}
        </h2>
        <p className="ff-news-hub-lead">
          {lead}
          {sourceTotal > shown ? ` · ${sourceTotal} on site` : ""}.
        </p>
      </div>

      <div
        className="ff-news-hub-scroll"
        role="list"
        aria-label="Latest news stories"
      >
        {visible.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="ff-news-hub-card"
            role="listitem"
          >
            {item.featureImage ? (
              <img
                className="ff-news-hub-card-image"
                src={item.featureImage}
                alt=""
                loading="lazy"
              />
            ) : (
              <div className="ff-news-hub-card-image is-placeholder" aria-hidden />
            )}
            <span className="ff-news-hub-card-body">
              <span className="ff-news-hub-card-meta">
                <span className="ff-news-hub-pill">{item.categoryLabel ?? "News"}</span>
                <time dateTime={item.dateIso}>{item.dateLabel}</time>
              </span>
              <h3 className="ff-news-hub-card-title">{item.title}</h3>
              {item.excerpt ? (
                <p className="ff-news-hub-card-excerpt">{item.excerpt}</p>
              ) : null}
              <span className="ff-news-hub-card-more">
                Read more
                <i className="fa-solid fa-arrow-right" aria-hidden />
              </span>
            </span>
          </Link>
        ))}
      </div>

      <Link className="ff-news-hub-cta" href={viewAllHref}>
        {viewAllLabel}
        <i className="fa-solid fa-arrow-right" aria-hidden />
      </Link>
    </section>
  );
}
