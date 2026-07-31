"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FREE_FIRE_MAX_PATH } from "@/src/lib/freeFirePages";

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
};

/**
 * Home / FF Max — latest news hub: feature image + horizontal scroll, max 5.
 */
export function FfNewsHub({ items, total }: Props) {
  const pathname = usePathname() ?? "";
  const isHome = pathname === "/" || pathname === "";
  const isMax = pathname === FREE_FIRE_MAX_PATH;
  if (!isHome && !isMax) return null;

  const visible = items.slice(0, FF_NEWS_HUB_LIMIT);
  if (!visible.length) return null;

  const shown = visible.length;

  return (
    <section className="ff-news-hub" aria-labelledby="ff-news-hub-title">
      <div className="ff-news-hub-head">
        <h2 id="ff-news-hub-title" className="ff-news-hub-title">
          {isMax ? "Latest Free Fire Max news" : "Latest Free Fire News"}
        </h2>
        <p className="ff-news-hub-lead">
          {isMax
            ? `Updates & guides for Max players — latest ${shown} ${shown === 1 ? "post" : "posts"}`
            : `Latest ${shown} ${shown === 1 ? "story" : "stories"} — swipe sideways to browse`}
          {total > shown ? ` · ${total} on site` : ""}.
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

      <Link className="ff-news-hub-cta" href="/news">
        View all news
        <i className="fa-solid fa-arrow-right" aria-hidden />
      </Link>
    </section>
  );
}
