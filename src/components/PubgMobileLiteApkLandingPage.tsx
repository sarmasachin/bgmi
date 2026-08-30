import Link from "next/link";
import { ClientErrorBoundary } from "@/src/components/ClientErrorBoundary";
import { FaqAccordion } from "@/src/components/FaqAccordion";
import { FfAdvanceServerCountdown } from "@/src/components/FfAdvanceServerCountdown";
import { HomeHeader } from "@/src/components/HomeHeader";
import { PageCommentSection } from "@/src/components/PageCommentSection";
import { PubgMobileLiteApkInfoBlocks } from "@/src/components/PubgMobileLiteApkInfoBlocks";
import { SiteFooter } from "@/src/components/SiteFooter";
import {
  PUBG_MOBILE_LITE_APK_PATH,
  PUBG_MOBILE_LITE_PATH,
} from "@/src/lib/pubgMobileLite";
import {
  DEFAULT_PUBG_MOBILE_LITE_APK_PAGE,
  PUBG_MOBILE_LITE_APK_PAGE_KEY,
} from "@/src/lib/pubgMobileLiteApkPage";
import {
  PUBG_MOBILE_LITE_APK_FACTS,
  PUBG_MOBILE_LITE_APK_INSTALL,
} from "@/src/lib/pubgMobileLiteApkSections";
import {
  breadcrumbListSchema,
  faqSchema,
  webPageSchema,
} from "@/src/lib/schema";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import { listApprovedPageComments } from "@/src/server/repositories/pageCommentsRepository";
import { getSettings } from "@/src/server/repositories/settingsRepository";

/**
 * PUBG Mobile Lite APK page — same dark hero + countdown layout as BGMI Lite APK.
 */
export async function PubgMobileLiteApkLandingPage() {
  const [settings, pageComments] = await Promise.all([
    getSettings(),
    listApprovedPageComments(PUBG_MOBILE_LITE_APK_PAGE_KEY),
  ]);
  const page = DEFAULT_PUBG_MOBILE_LITE_APK_PAGE;
  const canonical = toCanonicalUrl(PUBG_MOBILE_LITE_APK_PATH);
  const homeUrl = toCanonicalUrl("/");
  const liteCalcUrl = toCanonicalUrl(PUBG_MOBILE_LITE_PATH);
  const ogImageAbs = toCanonicalUrl(page.heroImage || "/icon.png?v=3");
  const faqItems = page.faqs.map((item) => ({
    id: item.id,
    question: item.question,
    answer: item.answer,
  }));

  const faqLd = faqSchema(faqItems);
  const breadcrumbLd = breadcrumbListSchema([
    { name: "Home", url: homeUrl },
    { name: "PUBG Mobile Lite", url: liteCalcUrl },
    { name: "PUBG Lite APK", url: canonical },
  ]);
  const webPageLd = webPageSchema({
    name: page.seoTitle,
    description: page.seoDescription,
    url: canonical,
    image: ogImageAbs,
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
          <li>
            <Link href={PUBG_MOBILE_LITE_PATH}>PUBG Mobile Lite</Link>
          </li>
          <li aria-current="page">PUBG Lite APK</li>
        </ol>
      </nav>

      <header className="ff-as-article-head" aria-labelledby="pml-apk-hero-title">
        <h1 id="pml-apk-hero-title" className="ff-as-article-title">
          {page.heroTitle}
        </h1>
        <p className="ff-as-article-sub">{page.subtitleEn}</p>

        <ul className="ff-as-pills" aria-label="PUBG Mobile Lite details">
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
          liveMessage={page.countdown.liveMessage}
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
          {page.cards.map((card) => (
            <article
              key={card.id}
              className={`ff-as-card${card.ctaHref ? " ff-as-card--cta" : ""}`}
              aria-labelledby={`pml-apk-card-${card.id}`}
            >
              <div className="ff-as-card-top">
                <span className="ff-as-card-badge">
                  <i className={`fa-solid ${card.icon}`} aria-hidden />
                  {card.badge}
                </span>
              </div>
              <h2 id={`pml-apk-card-${card.id}`} className="ff-as-card-title">
                {card.title}
              </h2>
              <p className="ff-as-card-summary">{card.summary}</p>
              <ul className="ff-as-card-points">
                {card.points.map((point) => (
                  <li key={point}>
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

        <PubgMobileLiteApkInfoBlocks
          install={PUBG_MOBILE_LITE_APK_INSTALL}
          facts={PUBG_MOBILE_LITE_APK_FACTS}
        />
      </main>

      <div
        id="pubg-mobile-lite-apk-guide"
        className="light-content-wrapper light-content--after-home-calculator"
      >
        <div className="content-inner">
          <div
            className="article"
            lang="en"
            dangerouslySetInnerHTML={{ __html: page.articleHtml }}
          />
          {faqItems.length ? (
            <FaqAccordion items={faqItems} title="PUBG Lite APK FAQ" />
          ) : null}
        </div>
      </div>

      <PageCommentSection
        pageKey={PUBG_MOBILE_LITE_APK_PAGE_KEY}
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLd) }}
      />

      <ClientErrorBoundary label="Footer">
        <SiteFooter settings={settings} />
      </ClientErrorBoundary>
    </div>
  );
}
