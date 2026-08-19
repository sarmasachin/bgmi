import Link from "next/link";
import { ClientErrorBoundary } from "@/src/components/ClientErrorBoundary";
import { FaqAccordion } from "@/src/components/FaqAccordion";
import { FfAdvanceServerCountdown } from "@/src/components/FfAdvanceServerCountdown";
import { HomeHeader } from "@/src/components/HomeHeader";
import { PageCommentSection } from "@/src/components/PageCommentSection";
import { RatingWidget } from "@/src/components/RatingWidget";
import { SiteFooter } from "@/src/components/SiteFooter";
import {
  FREE_FIRE_ADVANCE_SERVER_PAGE_KEY,
  FREE_FIRE_ADVANCE_SERVER_PATH,
} from "@/src/lib/ffAdvanceServerPage";
import { ratingWidgetRemountKey } from "@/src/lib/ratingWidgetKey";
import {
  breadcrumbListSchema,
  faqSchema,
  webPageSchema,
} from "@/src/lib/schema";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import { toSitemapLastmodIst } from "@/src/lib/sitemapLastmod";
import { getAdvanceServerPage, getAdvanceServerUpdatedAt } from "@/src/server/repositories/advanceServerPageRepository";
import { listApprovedPageComments } from "@/src/server/repositories/pageCommentsRepository";
import { getRatingSummary } from "@/src/server/repositories/ratingSummaryRepository";
import { getSettings } from "@/src/server/repositories/settingsRepository";

function renderCardPoint(cardId: string, point: string) {
  if (cardId !== "ob55-update-date") return <span>{point}</span>;
  const splitAt = point.indexOf(": ");
  if (splitAt < 0) return <span>{point}</span>;
  return (
    <span className="ff-as-point-with-date">
      <span className="ff-as-point-label">{point.slice(0, splitAt + 1)}</span>
      <span className="ff-as-date-highlight">{point.slice(splitAt + 2)}</span>
    </span>
  );
}

/**
 * Free Fire Advance Server info guide — fan-made only.
 * No APK hosted and no publisher / Garena outbound links.
 */
export async function FfAdvanceServerLandingPage() {
  const [settings, page, pageComments, ratingSummary, contentUpdatedAt] = await Promise.all([
    getSettings(),
    getAdvanceServerPage(),
    listApprovedPageComments(FREE_FIRE_ADVANCE_SERVER_PAGE_KEY),
    getRatingSummary("tool", FREE_FIRE_ADVANCE_SERVER_PAGE_KEY),
    getAdvanceServerUpdatedAt(),
  ]);
  const faqItems = page.faqs.map((item) => ({
    id: item.id,
    question: item.question,
    answer: item.answer,
  }));
  const canonical = toCanonicalUrl(FREE_FIRE_ADVANCE_SERVER_PATH);
  const homeUrl = toCanonicalUrl("/");
  const ogImageAbs = toCanonicalUrl("/icon.png?v=3");

  const faqLd = faqSchema(faqItems);
  const breadcrumbLd = breadcrumbListSchema([
    { name: "Home", url: homeUrl },
    { name: "Advance Server", url: canonical },
  ]);
  const webPageLd = webPageSchema({
    name: page.seoTitle,
    description: page.seoDescription,
    url: canonical,
    image: ogImageAbs,
    dateModified: toSitemapLastmodIst(contentUpdatedAt),
    keywords: [...page.seoKeywords],
    inLanguage: "en",
  });

  return (
    <div className="ff-as-page">
      <HomeHeader siteTitle={settings.homeDisplay.headerTitle} navigation={settings.navigation} />

      <nav className="ff-as-breadcrumb" aria-label="Breadcrumb">
        <ol className="ff-as-breadcrumb-list">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li aria-current="page">Advance Server</li>
        </ol>
      </nav>

      <header className="ff-as-article-head" aria-labelledby="ff-as-hero-title">
            <h1 id="ff-as-hero-title" className="ff-as-article-title">
          {page.heroTitle}
        </h1>
        <p className="ff-as-article-sub">{page.subtitleEn}</p>

        <ul className="ff-as-pills" aria-label="Advance Server details">
          {page.pills.map((pill) => (
            <li key={pill.label} className="ff-as-pill">
              {pill.label}
            </li>
          ))}
        </ul>

        <FfAdvanceServerCountdown
          label={page.countdown.label}
          targetIso={page.countdown.targetIso}
          dateText={page.countdown.dateText}
        />

        {page.heroImage ? (
          <img
            className="ff-as-feature-image"
            src={page.heroImage}
            alt={page.heroImageAlt}
            loading="eager"
            decoding="async"
          />
        ) : null}
      </header>

      <main className="ff-as-main">
        <div className="ff-as-cards">
          {page.cards.map((card) => {
            const links = "links" in card ? card.links : undefined;
            const pros = "pros" in card ? card.pros : undefined;
            const cons = "cons" in card ? card.cons : undefined;
            const isProsCons = Boolean(pros?.length || cons?.length);
            return (
              <article
                key={card.id}
                className={`ff-as-card${links && links.length > 0 ? " ff-as-card--cta" : ""}${isProsCons ? " ff-as-card--pros-cons" : ""}`}
                aria-labelledby={`ff-as-card-${card.id}`}
              >
                <div className="ff-as-card-top">
                  <span className="ff-as-card-badge">
                    <i className={`fa-solid ${card.icon}`} aria-hidden />
                    {card.badge}
                  </span>
                </div>
                <h2 id={`ff-as-card-${card.id}`} className="ff-as-card-title">
                  {card.title}
                </h2>
                <p className="ff-as-card-summary">{card.summary}</p>
                {card.points.length > 0 ? (
                  <ul className="ff-as-card-points">
                    {card.points.map((point) => (
                      <li key={point}>
                        <i className="fa-solid fa-check" aria-hidden />
                        {renderCardPoint(card.id, point)}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {isProsCons ? (
                  <div className="ff-as-pros-cons">
                    {pros && pros.length > 0 ? (
                      <div className="ff-as-pros">
                        <h3 className="ff-as-pros-cons-title">
                          <i className="fa-solid fa-thumbs-up" aria-hidden /> Pros
                        </h3>
                        <ul className="ff-as-card-points">
                          {pros.map((item) => (
                            <li key={item}>
                              <i className="fa-solid fa-check" aria-hidden />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {cons && cons.length > 0 ? (
                      <div className="ff-as-cons">
                        <h3 className="ff-as-pros-cons-title">
                          <i className="fa-solid fa-thumbs-down" aria-hidden /> Cons
                        </h3>
                        <ul className="ff-as-card-points ff-as-card-points--cons">
                          {cons.map((item) => (
                            <li key={item}>
                              <i className="fa-solid fa-xmark" aria-hidden />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                ) : null}
                {links && links.length > 0 ? (
                  <div className="ff-as-card-links" role="group" aria-label="Open calculators">
                    {links.map((link) => (
                      <Link key={link.href} className="ff-as-card-link" href={link.href}>
                        <span className="ff-as-card-link-text">{link.label}</span>
                        <i className="fa-solid fa-arrow-right" aria-hidden />
                      </Link>
                    ))}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>

        <div className="ff-as-tables">
          {page.tables.map((table) => (
            <section
              key={table.id}
              className="ff-as-table-block"
              aria-labelledby={`ff-as-table-${table.id}`}
            >
              <div className="ff-as-card-top">
                <span className="ff-as-card-badge">
                  <i className={`fa-solid ${table.icon}`} aria-hidden />
                  {table.badge}
                </span>
              </div>
              <h2 id={`ff-as-table-${table.id}`} className="ff-as-card-title">
                {table.title}
              </h2>
              <p className="ff-as-card-summary">{table.summary}</p>
              <div className="ff-as-table-wrap">
                <table className="ff-as-table">
                  <thead>
                    <tr>
                      {table.columns.map((col) => (
                        <th key={col} scope="col">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows.map((row) => (
                      <tr key={row.join("-")}>
                        {row.map((cell, index) =>
                          index === 0 ? (
                            <th key={`${row[0]}-${index}`} scope="row">
                              {cell}
                            </th>
                          ) : (
                            <td key={`${row[0]}-${index}`}>{cell}</td>
                          ),
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      </main>

      <section className="ff-as-faq" aria-label="Advance Server FAQ">
        <div className="ff-as-faq-inner">
          <FaqAccordion items={faqItems} title="Advance Server FAQ" />
        </div>
      </section>

      <section className="ff-as-rating" aria-label="Rate this page">
        <div className="ff-as-rating-inner">
          <h2 className="ff-as-rating-title">Rate this page</h2>
          <p className="ff-as-rating-lead">
            Was this Advance Server guide helpful? Tap a star to rate.
          </p>
          <ClientErrorBoundary label="Rating">
            <RatingWidget
              key={ratingWidgetRemountKey("tool", FREE_FIRE_ADVANCE_SERVER_PAGE_KEY)}
              title=""
              targetType="tool"
              targetId={FREE_FIRE_ADVANCE_SERVER_PAGE_KEY}
              initialSummary={ratingSummary}
            />
          </ClientErrorBoundary>
        </div>
      </section>

      <PageCommentSection
        pageKey={FREE_FIRE_ADVANCE_SERVER_PAGE_KEY}
        initialComments={pageComments}
      />

      {faqLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      ) : null}
      {breadcrumbLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        />
      ) : null}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLd) }}
      />

      <SiteFooter settings={settings} />
    </div>
  );
}
