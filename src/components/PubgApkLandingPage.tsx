import Link from "next/link";
import type { ReactNode } from "react";
import { BgmiLiteBetaApkInfoBlocks } from "@/src/components/BgmiLiteBetaApkInfoBlocks";
import { ClientErrorBoundary } from "@/src/components/ClientErrorBoundary";
import { FaqAccordion } from "@/src/components/FaqAccordion";
import { FfAdvanceServerCountdown } from "@/src/components/FfAdvanceServerCountdown";
import { HomeHeader } from "@/src/components/HomeHeader";
import { PageCommentSection } from "@/src/components/PageCommentSection";
import { SiteFooter } from "@/src/components/SiteFooter";
import {
  DEFAULT_PUBG_APK_PAGE,
  PUBG_APK_PAGE_KEY,
  PUBG_APK_PATH,
  type PubgApkHeroButton,
  type PubgApkPageContent,
} from "@/src/lib/pubgApkPage";
import { breadcrumbListSchema, faqSchema, webPageSchema } from "@/src/lib/schema";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import { getPubgApkPage } from "@/src/server/repositories/pubgApkPageRepository";
import {
  listApprovedPageComments,
  type PublicPageComment,
} from "@/src/server/repositories/pageCommentsRepository";
import { getSettings, type SiteSettings } from "@/src/server/repositories/settingsRepository";

function isPublicHeroButton(btn: PubgApkHeroButton): boolean {
  return btn.visible && Boolean(btn.label.trim()) && Boolean(btn.href.trim());
}

function HeroCtaLink({
  btn,
  className,
  icon,
}: {
  btn: PubgApkHeroButton;
  className: string;
  icon: string;
}) {
  const href = btn.href.trim();
  const external = /^https?:\/\//i.test(href);
  const inner: ReactNode = (
    <>
      <i className={`fa-solid ${icon}`} aria-hidden />
      <span>{btn.label}</span>
    </>
  );
  if (external) {
    return (
      <a className={className} href={href} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    );
  }
  return (
    <Link className={className} href={href}>
      {inner}
    </Link>
  );
}

type LandingData = {
  settings: SiteSettings;
  page: PubgApkPageContent;
  pageComments: PublicPageComment[];
};

/** Isolate data failures so comments/CMS cannot blank the whole page. */
async function loadLandingData(): Promise<LandingData> {
  const [settingsResult, pageResult, commentsResult] = await Promise.allSettled([
    getSettings(),
    getPubgApkPage(),
    listApprovedPageComments(PUBG_APK_PAGE_KEY),
  ]);

  if (settingsResult.status === "rejected") {
    throw settingsResult.reason instanceof Error
      ? settingsResult.reason
      : new Error("SETTINGS_UNAVAILABLE");
  }

  return {
    settings: settingsResult.value,
    page: pageResult.status === "fulfilled" ? pageResult.value : DEFAULT_PUBG_APK_PAGE,
    pageComments: commentsResult.status === "fulfilled" ? commentsResult.value : [],
  };
}

export async function PubgApkLandingPage() {
  const { settings, pageComments, page } = await loadLandingData();
  const canonical = toCanonicalUrl(PUBG_APK_PATH);
  const homeUrl = toCanonicalUrl("/");
  const pubgUrl = toCanonicalUrl("/pubg");
  const ogImageAbs = toCanonicalUrl(page.heroImage || "/icon.png?v=3");
  const faqItems = page.faqs.map((item) => ({
    id: item.id,
    question: item.question,
    answer: item.answer,
  }));
  const showPlay = isPublicHeroButton(page.heroButtons.playStore);
  const showApk = isPublicHeroButton(page.heroButtons.apk);

  const faqLd = faqSchema(faqItems);
  const breadcrumbLd = breadcrumbListSchema([
    { name: "Home", url: homeUrl },
    { name: "PUBG Mobile", url: pubgUrl },
    { name: "PUBG APK", url: canonical },
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
      <ClientErrorBoundary label="Header">
        <HomeHeader siteTitle={settings.homeDisplay.headerTitle} navigation={settings.navigation} />
      </ClientErrorBoundary>

      <nav className="ff-as-breadcrumb" aria-label="Breadcrumb">
        <ol className="ff-as-breadcrumb-list">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/pubg">PUBG Mobile</Link>
          </li>
          <li aria-current="page">PUBG APK</li>
        </ol>
      </nav>

      <header className="ff-as-article-head" aria-labelledby="pubg-apk-hero-title">
        <h1 id="pubg-apk-hero-title" className="ff-as-article-title">
          {page.heroTitle}
        </h1>
        <p className="ff-as-article-sub">{page.subtitleEn}</p>

        <ul className="ff-as-pills" aria-label="PUBG Mobile details">
          {page.pills.map((pill, index) => (
            <li key={`pill-${index}`} className="ff-as-pill">
              {pill.label}
            </li>
          ))}
        </ul>

        {page.countdown.visible && page.countdown.targetIso ? (
          <ClientErrorBoundary label="Update countdown">
            <FfAdvanceServerCountdown
              label={page.countdown.label}
              targetIso={page.countdown.targetIso}
              dateText={page.countdown.dateText}
              liveMessage={page.countdown.liveMessage}
            />
          </ClientErrorBoundary>
        ) : null}

        {showPlay || showApk ? (
          <div className="ff-as-hero-btns" role="group" aria-label="PUBG Mobile download options">
            {showPlay ? (
              <HeroCtaLink
                btn={page.heroButtons.playStore}
                className="ff-as-apk-btn"
                icon="fa-store"
              />
            ) : null}
            {showApk ? (
              <HeroCtaLink
                btn={page.heroButtons.apk}
                className="ff-as-apk-btn ff-as-apk-btn--alt"
                icon="fa-download"
              />
            ) : null}
          </div>
        ) : null}

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
              aria-labelledby={`pubg-apk-card-${card.id}`}
            >
              <div className="ff-as-card-top">
                <span className="ff-as-card-badge">
                  <i className={`fa-solid ${card.icon}`} aria-hidden />
                  {card.badge}
                </span>
              </div>
              <h2 id={`pubg-apk-card-${card.id}`} className="ff-as-card-title">
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
        id="pubg-apk-guide"
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

      <ClientErrorBoundary label="Comments">
        <PageCommentSection
          pageKey={PUBG_APK_PAGE_KEY}
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLd) }}
      />

      <ClientErrorBoundary label="Footer">
        <SiteFooter settings={settings} />
      </ClientErrorBoundary>
    </div>
  );
}
