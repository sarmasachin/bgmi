import Link from "next/link";
import { BgmiLiteBetaApkInfoBlocks } from "@/src/components/BgmiLiteBetaApkInfoBlocks";
import { ClientErrorBoundary } from "@/src/components/ClientErrorBoundary";
import { FaqAccordion } from "@/src/components/FaqAccordion";
import { HomeHeader } from "@/src/components/HomeHeader";
import { HomeTitleDummyAd } from "@/src/components/HomeTitleDummyAd";
import { PageCommentSection } from "@/src/components/PageCommentSection";
import { RatingWidget } from "@/src/components/RatingWidget";
import { FreeFireApkHeroActions } from "@/src/components/FreeFireApkHeroActions";
import { SiteFooter } from "@/src/components/SiteFooter";
import {
  DEFAULT_FREE_FIRE_APK_PAGE,
  FREE_FIRE_APK_PAGE_KEY,
  FREE_FIRE_APK_PATH,
  isUsableFreeFireHeroImageSrc,
  type FreeFireApkPageContent,
} from "@/src/lib/freeFireApkPage";
import {
  DEFAULT_FREE_FIRE_INDIA_APK_PAGE,
  FREE_FIRE_INDIA_APK_GUIDE_ID,
  FREE_FIRE_INDIA_APK_PAGE_KEY,
  FREE_FIRE_INDIA_APK_PATH,
} from "@/src/lib/freeFireIndiaApkPage";
import { ratingWidgetRemountKey } from "@/src/lib/ratingWidgetKey";
import {
  androidApkAppSchema,
  breadcrumbListSchema,
  faqSchema,
  webPageSchema,
} from "@/src/lib/schema";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import { getFreeFireApkPage } from "@/src/server/repositories/freeFireApkPageRepository";
import { getFreeFireIndiaApkPage } from "@/src/server/repositories/freeFireIndiaApkPageRepository";
import {
  getRatingSummary,
  type RatingSummary,
} from "@/src/server/repositories/ratingSummaryRepository";
import {
  listApprovedPageComments,
  type PublicPageComment,
} from "@/src/server/repositories/pageCommentsRepository";
import { getSettings, type SiteSettings } from "@/src/server/repositories/settingsRepository";

type ApkLandingVariant = "freefire" | "india";

type LandingData = {
  settings: SiteSettings;
  page: FreeFireApkPageContent;
  pageComments: PublicPageComment[];
  ratingSummary: RatingSummary | null;
};

const LANDING_META = {
  freefire: {
    path: FREE_FIRE_APK_PATH,
    pageKey: FREE_FIRE_APK_PAGE_KEY,
    breadcrumb: "FF Apk",
    guideId: "free-fire-apk-guide",
    heroTitleId: "free-fire-apk-hero-title",
    pillsLabel: "Free Fire details",
    ratingLead: "Was this Free Fire APK guide helpful? Tap a star to rate.",
    downloadLabel: "Free Fire download options",
  },
  india: {
    path: FREE_FIRE_INDIA_APK_PATH,
    pageKey: FREE_FIRE_INDIA_APK_PAGE_KEY,
    breadcrumb: "FF India APK",
    guideId: FREE_FIRE_INDIA_APK_GUIDE_ID,
    heroTitleId: "free-fire-india-apk-hero-title",
    pillsLabel: "Free Fire India details",
    ratingLead: "Was this Free Fire India APK guide helpful? Tap a star to rate.",
    downloadLabel: "Free Fire India download options",
  },
} as const;

/** Isolate data failures so comments/CMS cannot blank the whole page. */
async function loadLandingData(variant: ApkLandingVariant): Promise<LandingData> {
  const meta = LANDING_META[variant];
  const [settingsResult, pageResult, commentsResult, ratingResult] = await Promise.allSettled([
    getSettings(),
    variant === "india" ? getFreeFireIndiaApkPage() : getFreeFireApkPage(),
    listApprovedPageComments(meta.pageKey),
    getRatingSummary("tool", meta.pageKey),
  ]);

  if (settingsResult.status === "rejected") {
    throw settingsResult.reason instanceof Error
      ? settingsResult.reason
      : new Error("SETTINGS_UNAVAILABLE");
  }

  const fallback =
    variant === "india" ? DEFAULT_FREE_FIRE_INDIA_APK_PAGE : DEFAULT_FREE_FIRE_APK_PAGE;
  return {
    settings: settingsResult.value,
    page: pageResult.status === "fulfilled" ? pageResult.value : fallback,
    pageComments: commentsResult.status === "fulfilled" ? commentsResult.value : [],
    ratingSummary: ratingResult.status === "fulfilled" ? ratingResult.value : null,
  };
}

async function FreeFireStyleApkLanding({ variant }: { variant: ApkLandingVariant }) {
  const meta = LANDING_META[variant];
  const { settings, pageComments, page, ratingSummary } = await loadLandingData(variant);
  const canonical = toCanonicalUrl(page.path || meta.path);
  const homeUrl = toCanonicalUrl("/");
  const ogImageAbs = toCanonicalUrl(page.heroImage || "/icon.png?v=3");
  const faqItems = page.faqs.map((item) => ({
    id: item.id,
    question: item.question,
    answer: item.answer,
  }));

  const faqLd = faqSchema(faqItems);
  const breadcrumbLd = breadcrumbListSchema([
    { name: "Home", url: homeUrl },
    { name: meta.breadcrumb, url: canonical },
  ]);
  const appLd = androidApkAppSchema({
    name: page.heroTitle,
    description: page.seoDescription,
    url: canonical,
    image: ogImageAbs,
    ratingSummary,
  });
  const cardPrefix = meta.guideId.replace(/-guide$/, "");
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
          <li aria-current="page">{meta.breadcrumb}</li>
        </ol>
      </nav>

      <header className="ff-as-article-head" aria-labelledby={meta.heroTitleId}>
        <h1 id={meta.heroTitleId} className="ff-as-article-title">
          {page.heroTitle}
        </h1>
        <HomeTitleDummyAd slotKey="apk_below_title" />
        <p className="ff-as-article-sub">{page.subtitleEn}</p>

        <ul className="ff-as-pills" aria-label={meta.pillsLabel}>
          {page.pills.map((pill, index) => (
            <li key={`pill-${index}`} className="ff-as-pill">
              {pill.label}
            </li>
          ))}
        </ul>

        <FreeFireApkHeroActions
          countdown={page.countdown}
          playStore={page.heroButtons.playStore}
          apk={page.heroButtons.apk}
          groupLabel={meta.downloadLabel}
        />
        <HomeTitleDummyAd slotKey="apk_below_actions" />

        {isUsableFreeFireHeroImageSrc(page.heroImage) ? (
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
              aria-labelledby={`${cardPrefix}-card-${card.id}`}
            >
              <div className="ff-as-card-top">
                <span className="ff-as-card-badge">
                  <i className={`fa-solid ${card.icon}`} aria-hidden />
                  {card.badge}
                </span>
              </div>
              <h2 id={`${cardPrefix}-card-${card.id}`} className="ff-as-card-title">
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
        id={meta.guideId}
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
            {meta.ratingLead}
          </p>
          <ClientErrorBoundary label="Rating">
            <RatingWidget
              key={ratingWidgetRemountKey("tool", meta.pageKey)}
              title=""
              targetType="tool"
              targetId={meta.pageKey}
              initialSummary={ratingSummary}
            />
          </ClientErrorBoundary>
        </div>
      </section>

      <ClientErrorBoundary label="Comments">
        <PageCommentSection
          pageKey={meta.pageKey}
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

export async function FreeFireApkLandingPage() {
  return <FreeFireStyleApkLanding variant="freefire" />;
}

export async function FreeFireIndiaApkLandingPage() {
  return <FreeFireStyleApkLanding variant="india" />;
}
