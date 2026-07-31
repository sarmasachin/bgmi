import {
  listPublishedNews,
  listPublishedNewsByCategory,
} from "@/src/server/repositories/newsRepository";
import {
  coerceNewsCategory,
  newsArticlePath,
  newsCategoryLabel,
  type NewsCategorySlug,
} from "@/src/lib/newsCategories";
import { formatNewsPublishedAtIst } from "@/src/lib/formatNewsPublishedAt";
import Link from "next/link";

const NEWS_PAGE_SIZE = 12;

type Props = {
  page?: number;
  /** When set, only articles in this category (primary or extra). */
  category?: NewsCategorySlug;
  heading?: string;
};

export async function NewsSection({ page = 1, category, heading }: Props) {
  const requestedPage = Math.max(1, page);
  const first = category
    ? await listPublishedNewsByCategory(category, requestedPage, NEWS_PAGE_SIZE)
    : await listPublishedNews(requestedPage, NEWS_PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(first.total / NEWS_PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const result =
    currentPage === requestedPage
      ? first
      : category
        ? await listPublishedNewsByCategory(category, currentPage, NEWS_PAGE_SIZE)
        : await listPublishedNews(currentPage, NEWS_PAGE_SIZE);

  const basePath = category ? `/${category}` : "/news";

  const items = (result.data ?? []).map((item) => {
    const primary = coerceNewsCategory(
      (item as { primaryCategory?: string | null }).primaryCategory,
    );
    return {
      id: item.id,
      slug: item.slug ?? item.id,
      href: newsArticlePath(primary, item.slug ?? item.id),
      title: item.title,
      excerpt: item.excerpt ?? "",
      category: newsCategoryLabel(primary),
      publishedAt: formatNewsPublishedAtIst(item.publishedAt ?? item.createdAt),
      featureImage: item.featureImage ?? "",
      imageClass: "news-image-1",
    };
  });

  const [featured, ...rest] = items;
  if (!featured) {
    return (
      <section className="news-section">
        <div className="news-section-head">
          <h2 className="section-heading">{heading ?? "Latest News"}</h2>
        </div>
        <p>No published articles yet.</p>
      </section>
    );
  }

  return (
    <section className="news-section">
      <div className="news-section-head">
        <h2 className="section-heading">{heading ?? "Latest News"}</h2>
      </div>

      <Link href={featured.href} className={`news-featured ${featured.imageClass}`}>
        {featured.featureImage ? (
          <img
            className="news-featured-image"
            src={featured.featureImage}
            alt={featured.title}
            loading="eager"
          />
        ) : null}
        <div className="news-featured-overlay">
          <div className="news-meta-row">
            <span className="news-category featured">{featured.category}</span>
            <span className="news-date">{featured.publishedAt}</span>
          </div>
          <h3>{featured.title}</h3>
          <p>{featured.excerpt}</p>
        </div>
      </Link>

      <div className="news-grid">
        {rest.map((item) => (
          <Link href={item.href} className="news-card" key={item.id}>
            {item.featureImage ? (
              <img
                className="news-thumb news-thumb-image"
                src={item.featureImage}
                alt={item.title}
                loading="lazy"
              />
            ) : (
              <div className={`news-thumb ${item.imageClass}`} />
            )}
            <div className="news-content">
              <div className="news-meta-row">
                <span className="news-category">{item.category}</span>
                <span className="news-date">{item.publishedAt}</span>
              </div>
              <h4>{item.title}</h4>
              <p>{item.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 ? (
        <div className="news-pagination-row">
          {currentPage > 1 ? (
            <Link href={currentPage === 2 ? basePath : `${basePath}?page=${currentPage - 1}`}>
              Prev
            </Link>
          ) : (
            <span aria-disabled="true">Prev</span>
          )}
          <span>
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages ? (
            <Link href={`${basePath}?page=${currentPage + 1}`}>Next</Link>
          ) : (
            <span aria-disabled="true">Next</span>
          )}
        </div>
      ) : null}
    </section>
  );
}
