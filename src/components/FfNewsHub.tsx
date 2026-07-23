"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type FfNewsHubItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  dateLabel: string;
  dateIso: string;
};

type Props = {
  items: FfNewsHubItem[];
  total: number;
};

/**
 * Point 8 — official-site “Latest News” hub direction.
 * Safe: only this site’s published posts + /news links (no external news).
 */
export function FfNewsHub({ items, total }: Props) {
  const pathname = usePathname() ?? "";
  if (pathname !== "/" && pathname !== "") return null;
  // Hide until real published news exists.
  if (!items.length) return null;

  return (
    <section className="ff-news-hub" aria-labelledby="ff-news-hub-title">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
      <div className="ff-news-hub-head">
        <h2 id="ff-news-hub-title" className="ff-news-hub-title">
          Latest Free Fire News
        </h2>
        <p className="ff-news-hub-lead">
          Latest {Math.min(items.length, 10)} stories — swipe sideways to browse
          {total > items.length ? ` · ${total} on site` : ""}.
        </p>
      </div>

      <div
        className="ff-news-hub-scroll"
        role="list"
        aria-label="Latest news stories"
      >
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/news/${item.slug}`}
            className="ff-news-hub-card"
            role="listitem"
          >
            <span className="ff-news-hub-card-meta">
              <span className="ff-news-hub-pill">News</span>
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
