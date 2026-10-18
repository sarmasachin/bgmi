import Link from "next/link";
import { BgmiLiteBetaApkInfoBlocks } from "@/src/components/BgmiLiteBetaApkInfoBlocks";
import { ClientErrorBoundary } from "@/src/components/ClientErrorBoundary";
import { FaqAccordion } from "@/src/components/FaqAccordion";
import { ApkHeroDownloadActions } from "@/src/components/ApkHeroDownloadActions";
import { HomeHeader } from "@/src/components/HomeHeader";
import { HomeTitleDummyAd } from "@/src/components/HomeTitleDummyAd";
import { PageCommentSection } from "@/src/components/PageCommentSection";
import { RatingWidget } from "@/src/components/RatingWidget";
import { SiteFooter } from "@/src/components/SiteFooter";
import {
  BGMI_LITE_APK_PAGE_KEY,
  BGMI_LITE_APK_PATH,
} from "@/src/lib/bgmiLiteBetaApkPage";
import { ratingWidgetRemountKey } from "@/src/lib/ratingWidgetKey";
import {
  androidApkAppSchema,
  breadcrumbListSchema,
  faqSchema,
  webPageSchema,
} from "@/src/lib/schema";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import { getBgmiLiteApkPage } from "@/src/server/repositories/bgmiLiteApkPageRepository";
import { listApprovedPageComments } from "@/src/server/repositories/pageCommentsRepository";
import { getRatingSummary } from "@/src/server/repositories/ratingSummaryRepository";
import { getSettings } from "@/src/server/repositories/settingsRepository";

/**
 * BGMI Air APK page.
 * Top = Advance Server–style dark hero (countdown + image + cards).
 * Below = site standard light article + FAQ (AS itself has no article).
 * Then rating, then comments.
 */
export async function BgmiLiteBetaApkLandingPage() {
  const [settings, pageComments, page, ratingSummary] = await Promise.all([
    getSettings(),
    listApprovedPageComments(BGMI_LITE_APK_PAGE_KEY),
    getBgmiLiteApkPage(),
    getRatingSummary("tool", BGMI_LITE_APK_PAGE_KEY).catch(() => null),
  ]);
  const canonical = toCanonicalUrl(BGMI_LITE_APK_PATH);
  const homeUrl = toCanonicalUrl("/");
  const liteCalcUrl = toCanonicalUrl("/bgmi-lite");
  const ogImageAbs = toCanonicalUrl(page.heroImage || "/icon.png?v=3");
  const faqItems = page.faqs.map((item) => ({
    id: item.id,
    question: item.question,
    answer: item.answer,
  }));

  const faqLd = faqSchema(faqItems);
  const breadcrumbLd = breadcrumbListSchema([
    { name: "Home", url: homeUrl },
    { name: "BGMI Air", url: liteCalcUrl },
    { name: "BGMI Air APK", url: canonical },
  ]);
  const appLd = androidApkAppSchema({
    name: page.heroTitle,
    description: page.seoDescription,
    url: canonical,
    image: ogImageAbs,
    ratingSummary,
  });
  const webPageLd = webPageSchema({
    name: page.seoTitle,
    description: page.seoDescription,
    url: canonical,
    image: ogImageAbs,
    keywords: [...page.seoKeywords],
    inLanguage: "en",
    mainEntityId: `${canonical}#app`,
  });

  return (
    <div className="ff-as-page">
      <HomeHeader siteTitle={settings.homeDisplay.headerTitle} navigation={settings.navigation} />

      <nav className="ff-as-breadcrumb" aria-label="Breadcrumb">
        <ol className="ff-as-breadcrumb-list">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/bgmi-lite">BGMI Air</Link>
          </li>
          <li aria-current="page">BGMI Air APK</li>
        </ol>
      </nav>

      <header className="ff-as-article-head" aria-labelledby="bgmi-lite-apk-hero-title">
        <h1 id="bgmi-lite-apk-hero-title" className="ff-as-article-title">
          {page.heroTitle}
        </h1>
        <HomeTitleDummyAd slotKey="apk_below_title" />
        <p className="ff-as-article-sub">{page.subtitleEn}</p>

        <ul className="ff-as-pills" aria-label="BGMI Air details">
          {page.pills.map((pill, index) => (
            <li key={`pill-${index}`} className="ff-as-pill">
              {pill.label}
            </li>
          ))}
        </ul>

        <ApkHeroDownloadActions
          countdown={page.countdown}
          playStore={page.heroButtons.playStore}
          apk={page.heroButtons.apk}
          groupLabel="BGMI Air download options"
        />
        <HomeTitleDummyAd slotKey="apk_below_actions" />

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
          {page.cards.map((card) => (
            <article
              key={card.id}
              className={`ff-as-card${card.ctaHref ? " ff-as-card--cta" : ""}`}
              aria-labelledby={`bgmi-lite-apk-card-${card.id}`}
            >
              <div className="ff-as-card-top">
                <span className="ff-as-card-badge">
                  <i className={`fa-solid ${card.icon}`} aria-hidden />
                  {card.badge}
                </span>
              </div>
              <h2 id={`bgmi-lite-apk-card-${card.id}`} className="ff-as-card-title">
                {card.title}
              </h2>
              <p className="ff-as-card-summary">{card.summary}</p>
              <ul className="ff-as-card-points">
                {card.points.map((point, pointIndex) => (
                  <li key={`${card.id}-p-${pointIndex}`}>
                    <i className="fa-solid fa-check" aria-hidden />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              {card.ctaHref && card.ctaLabel ? (
                <div className="ff-as-card-links" role="group" aria-label={card.ctaLabel}>
                  <Link className="ff-as-card-link" href={card.ctaHref}>
                    <span className="ff-as-card-link-text">{card.ctaLabel}</span>
                    <i className="fa-solid fa-arrow-right" aria-hidden />
                  </Link>
                </div>
              ) : null}
            </article>
          ))}
        </div>

        <BgmiLiteBetaApkInfoBlocks
          preRegister={page.preRegister}
          facts={page.facts}
        />
      </main>

      <div
        id="bgmi-lite-apk-guide"
        className="light-content-wrapper light-content--after-home-calculator"
      >
        <div className="content-inner">
          <div
            className="article"
            lang="en"
            dangerouslySetInnerHTML={{ __html: page.articleHtml }}
          />
          {faqItems.length ? (
            <FaqAccordion items={faqItems} title={page.faqTitle} />
          ) : null}
        </div>
      </div>

      <section className="ff-as-rating" aria-label="Rate this page">
        <div className="ff-as-rating-inner">
          <h2 className="ff-as-rating-title">Rate this page</h2>
          <p className="ff-as-rating-lead">
            Was this BGMI Air APK guide helpful? Tap a star to rate.
          </p>
          <ClientErrorBoundary label="Rating">
            <RatingWidget
              key={ratingWidgetRemountKey("tool", BGMI_LITE_APK_PAGE_KEY)}
              title=""
              targetType="tool"
              targetId={BGMI_LITE_APK_PAGE_KEY}
              initialSummary={ratingSummary}
            />
          </ClientErrorBoundary>
        </div>
      </section>

      <PageCommentSection
        pageKey={BGMI_LITE_APK_PAGE_KEY}
        initialComments={pageComments}
        lead={page.commentsLead}
      />

      {faqLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      ) : null}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLd) }}
      />

      <ClientErrorBoundary label="Footer">
        <SiteFooter settings={settings} />
      </ClientErrorBoundary>
    </div>
  );
}
