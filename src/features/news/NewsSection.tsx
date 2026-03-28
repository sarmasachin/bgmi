import { listPublishedNews } from "@/src/server/repositories/newsRepository";
import Link from "next/link";

export async function NewsSection() {
  const result = await listPublishedNews(1, 12);
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
    </section>
  );
}
