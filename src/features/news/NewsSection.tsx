import { listPublishedNews } from "@/src/server/repositories/newsRepository";
import Link from "next/link";

const NEWS_PAGE_SIZE = 12;

type Props = {
  page?: number;
};

export async function NewsSection({ page = 1 }: Props) {
  const requestedPage = Math.max(1, page);
  const first = await listPublishedNews(requestedPage, NEWS_PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(first.total / NEWS_PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const result =
    currentPage === requestedPage ? first : await listPublishedNews(currentPage, NEWS_PAGE_SIZE);

  const items = (result.data ?? []).map((item) => ({
    id: item.id,
    slug: item.slug ?? item.id,
    title: item.title,
    excerpt: item.excerpt ?? "",
    category: "NEWS",
    publishedAt: item.publishedAt
      ? new Date(item.publishedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      : item.createdAt
        ? new Date(item.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
        : "-",
    featureImage: item.featureImage ?? "",
    imageClass: "news-image-1",
  }));

  const [featured, ...rest] = items;
  if (!featured) return null;

  return (
    <section className="news-section">
      <div className="news-section-head">
        <h2 className="section-heading">Latest News</h2>
        <span className="news-section-kicker">{result.total} stories</span>
      </div>

      <Link
        href={`/news/${featured.slug}`}
        className={`news-featured ${featured.imageClass}`}
      >
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
          <Link href={`/news/${item.slug}`} className="news-card" key={item.id}>
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
              <h4>
                {item.title}
              </h4>
              <p>{item.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 ? (
        <div className="news-pagination-row">
          {currentPage > 1 ? (
            <Link href={currentPage === 2 ? "/news" : `/news?page=${currentPage - 1}`}>Prev</Link>
          ) : (
            <span aria-disabled="true">Prev</span>
          )}
          <span>
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages ? (
            <Link href={`/news?page=${currentPage + 1}`}>Next</Link>
          ) : (
            <span aria-disabled="true">Next</span>
          )}
        </div>
      ) : null}
    </section>
  );
}
