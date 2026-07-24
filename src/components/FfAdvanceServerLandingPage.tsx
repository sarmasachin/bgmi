import Link from "next/link";
import { ClientErrorBoundary } from "@/src/components/ClientErrorBoundary";
import { FaqAccordion } from "@/src/components/FaqAccordion";
import { FfAdvanceServerCountdown } from "@/src/components/FfAdvanceServerCountdown";
import { HomeHeader } from "@/src/components/HomeHeader";
import { PageCommentSection } from "@/src/components/PageCommentSection";
import { RatingWidget } from "@/src/components/RatingWidget";
import { SiteFooter } from "@/src/components/SiteFooter";
import {
  FF_ADVANCE_SERVER_PAGE,
  FREE_FIRE_ADVANCE_SERVER_PAGE_KEY,
} from "@/src/lib/ffAdvanceServerPage";
import { ratingWidgetRemountKey } from "@/src/lib/ratingWidgetKey";
import { faqSchema } from "@/src/lib/schema";
import { listApprovedPageComments } from "@/src/server/repositories/pageCommentsRepository";
import { getRatingSummary } from "@/src/server/repositories/ratingSummaryRepository";
import { getSettings } from "@/src/server/repositories/settingsRepository";

/**
 * Free Fire Advance Server landing — hero + one long official APK button.
 * Does not touch BGMI or calculator logic.
 */
export async function FfAdvanceServerLandingPage() {
  const settings = await getSettings();
  const page = FF_ADVANCE_SERVER_PAGE;
  const [pageComments, ratingSummary] = await Promise.all([
    listApprovedPageComments(FREE_FIRE_ADVANCE_SERVER_PAGE_KEY),
    getRatingSummary("tool", FREE_FIRE_ADVANCE_SERVER_PAGE_KEY),
  ]);
  const faqItems = page.faqs.map((item) => ({
    id: item.id,
    question: item.question,
    answer: item.answer,
  }));
  const faqLd = faqSchema(faqItems);

  return (
    <div className="ff-as-page">
      <HomeHeader siteTitle={settings.homeDisplay.headerTitle} navigation={settings.navigation} />

      <section
        className={`ff-as-hero${page.heroLayout === "split" ? " ff-as-hero--split" : " ff-as-hero--center"}`}
        aria-labelledby="ff-as-hero-title"
      >
        <div
          className="ff-as-hero-bg"
          style={{ backgroundImage: `url(${page.heroImage})` }}
          aria-hidden
        />
        <div className="ff-as-hero-overlay" aria-hidden />

        <div className="ff-as-hero-inner">
          <div className="ff-as-hero-copy">
            <h1 id="ff-as-hero-title" className="ff-as-hero-title">
              {page.heroTitle}
            </h1>
            <p className="ff-as-hero-sub">{page.subtitleEn}</p>

            <a
              className="ff-as-apk-btn"
              href={page.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fa-solid fa-download" aria-hidden />
              <span>{page.apkCta}</span>
            </a>

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
          </div>

          {page.heroLayout === "split" ? (
            <div className="ff-as-hero-visual">
              <img
                className="ff-as-hero-visual-img"
                src={page.heroImage}
                alt=""
                decoding="async"
              />
            </div>
          ) : null}
        </div>
      </section>

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
                        <span>{point}</span>
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
          <FaqAccordion items={faqItems} title="Free Fire Advance Server FAQ" />
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

      <SiteFooter settings={settings} />
    </div>
  );
}
