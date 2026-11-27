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
import { formatNewsPublishedAtIst, latestNewsDateValue } from "@/src/lib/formatNewsPublishedAt";
import { clampNewsListPage, newsListTotalPages, parseNewsListPage } from "@/src/lib/newsListPage";
import { NewsPagination } from "@/src/features/news/NewsPagination";
import { publicImageSrc } from "@/src/lib/publicImageSrc";
import { renameLiteNewsPost } from "@/src/lib/renameLiteDisplayNames";
import Link from "next/link";

/** 15 per page. First story is the lead; the rest sit in one 3-column grid. */
const NEWS_PAGE_SIZE = 15;

type Props = {
  page?: number;
  /** When set, only articles in this category (primary or extra). */
  category?: NewsCategorySlug;
  heading?: string;
  /** Pagination base path (defaults to `/{category}` or `/news`). */
  listBasePath?: string;
};

type NewsCardItem = {
  id: string;
  slug: string;
  href: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  featureImage: string;
  imageClass: string;
};

function FeaturedBlock({
  item,
  eager,
}: {
  item: NewsCardItem;
  eager?: boolean;
}) {
  return (
    <Link href={item.href} className="news-featured">
      {item.featureImage ? (
        <img
          className="news-featured-image"
          src={item.featureImage}
          alt={item.title}
          loading={eager ? "eager" : "lazy"}
        />
      ) : (
        <div className={`news-featured-image ${item.imageClass}`} aria-hidden />
      )}
      <div className="news-featured-body">
        <div className="news-meta-row">
          <span className="news-category featured">{item.category}</span>
          <span className="news-date">{item.publishedAt}</span>
        </div>
        <h3>{item.title}</h3>
        {item.excerpt ? <p>{item.excerpt}</p> : null}
      </div>
    </Link>
  );
}

function CardBlock({ item }: { item: NewsCardItem }) {
  return (
    <Link href={item.href} className="news-card">
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
        {item.excerpt ? <p>{item.excerpt}</p> : null}
      </div>
    </Link>
  );
}

/** First story is the lead. Every story after it is a card in one grid. */
function buildNewsBlocks(items: NewsCardItem[]) {
  const blocks: Array<
    | { type: "featured"; item: NewsCardItem }
    | { type: "cards"; items: NewsCardItem[] }
  > = [];
  const [lead, ...rest] = items;
  if (!lead) return blocks;
  blocks.push({ type: "featured", item: lead });
  if (rest.length) blocks.push({ type: "cards", items: rest });
  return blocks;
}

export async function NewsSection({ page = 1, category, heading, listBasePath }: Props) {
  const requestedPage = parseNewsListPage(page);
  const first = category
    ? await listPublishedNewsByCategory(category, requestedPage, NEWS_PAGE_SIZE)
    : await listPublishedNews(requestedPage, NEWS_PAGE_SIZE);
  const currentPage = clampNewsListPage(requestedPage, first.total, NEWS_PAGE_SIZE);
  const totalPages = newsListTotalPages(first.total, NEWS_PAGE_SIZE);
  const result =
    currentPage === requestedPage
      ? first
      : category
        ? await listPublishedNewsByCategory(category, currentPage, NEWS_PAGE_SIZE)
        : await listPublishedNews(currentPage, NEWS_PAGE_SIZE);

  const basePath = listBasePath || (category ? `/${category}` : "/news");

  const items: NewsCardItem[] = (result.data ?? []).map((item, index) => {
    const renamed = renameLiteNewsPost(item as Record<string, unknown>) as typeof item;
    const primary = coerceNewsCategory(
      (renamed as { primaryCategory?: string | null }).primaryCategory,
    );
    return {
      id: renamed.id,
      slug: renamed.slug ?? renamed.id,
      href: newsArticlePath(primary, renamed.slug ?? renamed.id),
      title: renamed.title,
      excerpt: renamed.excerpt ?? "",
      category: newsCategoryLabel(primary),
      publishedAt: formatNewsPublishedAtIst(latestNewsDateValue(renamed)),
      featureImage: publicImageSrc(renamed.featureImage),
      imageClass: `news-image-${(index % 5) + 1}`,
    };
  });

  if (!items.length) {
    return (
      <section className="news-section news-listing-light">
        <div className="news-section-head">
          <h2 className="section-heading">{heading ?? "Latest News"}</h2>
        </div>
        <p className="news-empty">No published articles yet.</p>
      </section>
    );
  }

  const blocks = buildNewsBlocks(items);
  let featuredCount = 0;

  return (
    <section className="news-section news-listing-light">
      <div className="news-section-head">
        <h2 className="section-heading">{heading ?? "Latest News"}</h2>
      </div>

      {blocks.map((block) => {
        if (block.type === "featured") {
          featuredCount += 1;
          return (
            <FeaturedBlock
              key={`feat-${block.item.id}`}
              item={block.item}
              eager={featuredCount === 1}
            />
          );
        }
        return (
          <div className="news-grid" key={`grid-${block.items.map((x) => x.id).join("-")}`}>
            {block.items.map((item) => (
              <CardBlock key={item.id} item={item} />
            ))}
          </div>
        );
      })}

      {totalPages > 1 ? (
        <NewsPagination currentPage={currentPage} totalPages={totalPages} basePath={basePath} />
      ) : null}
    </section>
  );
}
