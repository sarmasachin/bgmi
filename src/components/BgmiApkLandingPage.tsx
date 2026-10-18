import Link from "next/link";
import { BgmiApkHeroActions } from "@/src/components/BgmiApkHeroActions";
import { BgmiLiteBetaApkInfoBlocks } from "@/src/components/BgmiLiteBetaApkInfoBlocks";
import { ClientErrorBoundary } from "@/src/components/ClientErrorBoundary";
import { FaqAccordion } from "@/src/components/FaqAccordion";
import { HomeHeader } from "@/src/components/HomeHeader";
import { HomeTitleDummyAd } from "@/src/components/HomeTitleDummyAd";
import { PageCommentSection } from "@/src/components/PageCommentSection";
import { RatingWidget } from "@/src/components/RatingWidget";
import { SiteFooter } from "@/src/components/SiteFooter";
import {
  BGMI_APK_PAGE_KEY,
  BGMI_APK_PATH,
  DEFAULT_BGMI_APK_PAGE,
  isUsableHeroImageSrc,
  type BgmiApkPageContent,
} from "@/src/lib/bgmiApkPage";
import { ratingWidgetRemountKey } from "@/src/lib/ratingWidgetKey";
import {
  androidApkAppSchema,
  breadcrumbListSchema,
  faqSchema,
  webPageSchema,
} from "@/src/lib/schema";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import { getBgmiApkPage } from "@/src/server/repositories/bgmiApkPageRepository";
import {
  getRatingSummary,
  type RatingSummary,
} from "@/src/server/repositories/ratingSummaryRepository";
import {
  listApprovedPageComments,
  type PublicPageComment,
} from "@/src/server/repositories/pageCommentsRepository";
import { getSettings, type SiteSettings } from "@/src/server/repositories/settingsRepository";

type LandingData = {
  settings: SiteSettings;
  page: BgmiApkPageContent;
  pageComments: PublicPageComment[];
  ratingSummary: RatingSummary | null;
};

/** Isolate data failures so comments/CMS cannot blank the whole page. */
async function loadLandingData(): Promise<LandingData> {
  const [settingsResult, pageResult, commentsResult, ratingResult] = await Promise.allSettled([
    getSettings(),
    getBgmiApkPage(),
    listApprovedPageComments(BGMI_APK_PAGE_KEY),
    getRatingSummary("tool", BGMI_APK_PAGE_KEY),
  ]);

  if (settingsResult.status === "rejected") {
    throw settingsResult.reason instanceof Error
      ? settingsResult.reason
      : new Error("SETTINGS_UNAVAILABLE");
  }

  return {
    settings: settingsResult.value,
    page: pageResult.status === "fulfilled" ? pageResult.value : DEFAULT_BGMI_APK_PAGE,
    pageComments: commentsResult.status === "fulfilled" ? commentsResult.value : [],
    ratingSummary: ratingResult.status === "fulfilled" ? ratingResult.value : null,
  };
}

export async function BgmiApkLandingPage() {
  const { settings, pageComments, page, ratingSummary } = await loadLandingData();
  const canonical = toCanonicalUrl(BGMI_APK_PATH);
  const homeUrl = toCanonicalUrl("/");
  const bgmiUrl = toCanonicalUrl("/bgmi");
  const ogImageAbs = toCanonicalUrl(page.heroImage || "/icon.png?v=3");
  const faqItems = page.faqs.map((item) => ({
    id: item.id,
    question: item.question,
    answer: item.answer,
  }));

  const faqLd = faqSchema(faqItems);
  const breadcrumbLd = breadcrumbListSchema([
    { name: "Home", url: homeUrl },
    { name: "BGMI", url: bgmiUrl },
    { name: "BGMI APK", url: canonical },
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
      <ClientErrorBoundary label="Header">
        <HomeHeader siteTitle={settings.homeDisplay.headerTitle} navigation={settings.navigation} />
      </ClientErrorBoundary>

      <nav className="ff-as-breadcrumb" aria-label="Breadcrumb">
        <ol className="ff-as-breadcrumb-list">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/bgmi">BGMI</Link>
          </li>
          <li aria-current="page">BGMI APK</li>
        </ol>
      </nav>

      <header className="ff-as-article-head" aria-labelledby="bgmi-apk-hero-title">
        <h1 id="bgmi-apk-hero-title" className="ff-as-article-title">
          {page.heroTitle}
        </h1>
        <HomeTitleDummyAd slotKey="apk_below_title" />
        <p className="ff-as-article-sub">{page.subtitleEn}</p>

        <ul className="ff-as-pills" aria-label="BGMI details">
          {page.pills.map((pill, index) => (
            <li key={`pill-${index}`} className="ff-as-pill">
              {pill.label}
            </li>
          ))}
        </ul>

        <BgmiApkHeroActions
          countdown={page.countdown}
          playStore={page.heroButtons.playStore}
          apk={page.heroButtons.apk}
        />
        <HomeTitleDummyAd slotKey="apk_below_actions" />

        {isUsableHeroImageSrc(page.heroImage) ? (
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
              aria-labelledby={`bgmi-apk-card-${card.id}`}
            >
              <div className="ff-as-card-top">
                <span className="ff-as-card-badge">
                  <i className={`fa-solid ${card.icon}`} aria-hidden />
                  {card.badge}
                </span>
              </div>
              <h2 id={`bgmi-apk-card-${card.id}`} className="ff-as-card-title">
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

        <BgmiLiteBetaApkInfoBlocks preRegister={page.preRegister} facts={page.facts} />
      </main>

      <div
        id="bgmi-apk-guide"
        className="light-content-wrapper light-content--after-home-calculator"
      >
        <div className="content-inner">
          <div
            className="article"
            lang="en"
            dangerouslySetInnerHTML={{ __html: page.articleHtml }}
          />
          {faqItems.length ? (
            <ClientErrorBoundary label="FAQ">
              <FaqAccordion items={faqItems} title={page.faqTitle} />
            </ClientErrorBoundary>
          ) : null}
        </div>
      </div>

      <section className="ff-as-rating" aria-label="Rate this page">
        <div className="ff-as-rating-inner">
          <h2 className="ff-as-rating-title">Rate this page</h2>
          <p className="ff-as-rating-lead">
            Was this BGMI APK guide helpful? Tap a star to rate.
          </p>
          <ClientErrorBoundary label="Rating">
            <RatingWidget
              key={ratingWidgetRemountKey("tool", BGMI_APK_PAGE_KEY)}
              title=""
              targetType="tool"
              targetId={BGMI_APK_PAGE_KEY}
              initialSummary={ratingSummary}
            />
          </ClientErrorBoundary>
        </div>
      </section>

      <ClientErrorBoundary label="Comments">
        <PageCommentSection
          pageKey={BGMI_APK_PAGE_KEY}
          initialComments={pageComments}
          lead={page.commentsLead}
        />
      </ClientErrorBoundary>

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
