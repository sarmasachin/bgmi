import Link from "next/link";
import { ClientErrorBoundary } from "@/src/components/ClientErrorBoundary";
import { BgmiLiteStylishNameStudio } from "@/src/components/BgmiLiteStylishNameStudio";
import { FreeFireStylishNameIdeas } from "@/src/components/FreeFireStylishNameIdeas";
import { FaqAccordion } from "@/src/components/FaqAccordion";
import { HomeHeader } from "@/src/components/HomeHeader";
import { PageCommentSection } from "@/src/components/PageCommentSection";
import { SiteFooter } from "@/src/components/SiteFooter";
import { ToolPageRatingBlock } from "@/src/components/ToolPageRatingBlock";
import {
  cloneFreeFireStylishNamePage,
  FREE_FIRE_STYLISH_NAME_PAGE_KEY,
  FREE_FIRE_STYLISH_NAME_PATH,
  type FreeFireStylishNamePageContent,
} from "@/src/lib/freeFireStylishNamePage";
import {
  cloneFreeFireMaxStylishNamePage,
  FREE_FIRE_MAX_STYLISH_NAME_PAGE_KEY,
  FREE_FIRE_MAX_STYLISH_NAME_PATH,
} from "@/src/lib/freeFireMaxStylishNamePage";
import { FREE_FIRE_MAX_PATH } from "@/src/lib/freeFirePages";
import {
  FREE_FIRE_INDIA_STYLISH_NAME_GUIDE_ID,
  FREE_FIRE_INDIA_STYLISH_NAME_PAGE_KEY,
  FREE_FIRE_INDIA_STYLISH_NAME_PATH,
  toFreeFireIndiaNamePage,
} from "@/src/lib/freeFireIndiaNamePage";
import { FREE_FIRE_INDIA_PATH } from "@/src/lib/gamePagePath";
import { breadcrumbListSchema, faqSchema, webPageSchema } from "@/src/lib/schema";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import {
  listApprovedPageComments,
  type PublicPageComment,
} from "@/src/server/repositories/pageCommentsRepository";
import { getFreeFireStylishNamePage } from "@/src/server/repositories/freeFireStylishNameRepository";
import { getFreeFireMaxStylishNamePage } from "@/src/server/repositories/freeFireMaxStylishNameRepository";
import {
  getRatingSummary,
  type RatingSummary,
} from "@/src/server/repositories/ratingSummaryRepository";
import {
  getSettings,
  type SiteSettings,
} from "@/src/server/repositories/settingsRepository";

type StylishNameVariant = "free-fire" | "free-fire-max" | "free-fire-india";

type FreeFireStylishNameLandingOptions = {
  variant?: StylishNameVariant;
  path?: string;
  parentLabel?: string;
  parentHref?: string;
};

type LandingData = {
  settings: SiteSettings;
  page: FreeFireStylishNamePageContent;
  pageComments: PublicPageComment[];
  ratingSummary: RatingSummary | null;
};

function pageKeyFor(variant: StylishNameVariant): string {
  if (variant === "free-fire-max") return FREE_FIRE_MAX_STYLISH_NAME_PAGE_KEY;
  if (variant === "free-fire-india") return FREE_FIRE_INDIA_STYLISH_NAME_PAGE_KEY;
  return FREE_FIRE_STYLISH_NAME_PAGE_KEY;
}

async function loadLandingData(variant: StylishNameVariant): Promise<LandingData> {
  const isMax = variant === "free-fire-max";
  const pageKey = pageKeyFor(variant);
  const [settingsResult, pageResult, commentsResult, ratingResult] = await Promise.allSettled([
    getSettings(),
    isMax ? getFreeFireMaxStylishNamePage() : getFreeFireStylishNamePage(),
    listApprovedPageComments(pageKey),
    getRatingSummary("tool", pageKey),
  ]);

  if (settingsResult.status === "rejected") {
    throw settingsResult.reason instanceof Error
      ? settingsResult.reason
      : new Error("SETTINGS_UNAVAILABLE");
  }

  const fallback = isMax ? cloneFreeFireMaxStylishNamePage() : cloneFreeFireStylishNamePage();
  const source = pageResult.status === "fulfilled" ? pageResult.value : fallback;
  return {
    settings: settingsResult.value,
    page: variant === "free-fire-india" ? toFreeFireIndiaNamePage(source) : source,
    pageComments: commentsResult.status === "fulfilled" ? commentsResult.value : [],
    ratingSummary: ratingResult.status === "fulfilled" ? ratingResult.value : null,
  };
}

/** Free Fire / Free Fire Max stylish name — mobile-first studio + DB-backed copy. */
export async function FreeFireStylishNameLandingPage(
  options: FreeFireStylishNameLandingOptions = {},
) {
  const variant = options.variant ?? "free-fire";
  const isMax = variant === "free-fire-max";
  const isIndia = variant === "free-fire-india";
  const { settings, page, pageComments, ratingSummary } = await loadLandingData(variant);
  const path =
    options.path?.trim() ||
    (isMax
      ? FREE_FIRE_MAX_STYLISH_NAME_PATH
      : isIndia
        ? FREE_FIRE_INDIA_STYLISH_NAME_PATH
        : FREE_FIRE_STYLISH_NAME_PATH);
  const parentLabel =
    options.parentLabel?.trim() || (isMax ? "FF Max" : isIndia ? "Free Fire India" : "Free Fire");
  const parentHref =
    options.parentHref?.trim() || (isMax ? FREE_FIRE_MAX_PATH : isIndia ? FREE_FIRE_INDIA_PATH : "/");
  const pageKey = pageKeyFor(variant);
  const guideId = isMax
    ? "free-fire-max-stylish-name-guide"
    : isIndia
      ? FREE_FIRE_INDIA_STYLISH_NAME_GUIDE_ID
      : "free-fire-stylish-name-guide";
  const ratingGame = isMax ? "FF Max" : isIndia ? "Free Fire India" : "Free Fire";
  const canonical = toCanonicalUrl(path);
  const homeUrl = toCanonicalUrl("/");
  const parentUrl = toCanonicalUrl(parentHref);
  const crumbCurrent = (
    page.title || (isMax ? "FF Max Names" : isIndia ? "FF India Names" : "FF Names")
  ).trim();
  const faqItems = page.faqs.map((f) => ({
    id: f.id,
    question: f.question,
    answer: f.answer,
  }));
  const faqLd = faqSchema(faqItems);
  const breadcrumbLd = breadcrumbListSchema([
    { name: "Home", url: homeUrl },
    { name: parentLabel, url: parentUrl },
    { name: crumbCurrent, url: canonical },
  ]);
  const webPageLd = webPageSchema({
    name: page.seoTitle,
    description: page.seoDescription,
    url: canonical,
    keywords: [...page.seoKeywords],
    inLanguage: "en",
    mainEntityId: `${canonical}#app`,
  });

  return (
    <div className="lite-stylish-page">
      <ClientErrorBoundary label="Header">
        <HomeHeader siteTitle={settings.homeDisplay.headerTitle} navigation={settings.navigation} />
      </ClientErrorBoundary>

      <nav className="ff-as-breadcrumb" aria-label="Breadcrumb">
        <ol className="ff-as-breadcrumb-list">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href={parentHref}>{parentLabel}</Link>
          </li>
          <li aria-current="page">{crumbCurrent}</li>
        </ol>
      </nav>

      <main className="lite-stylish-main">
        <div className="lite-stylish-inner">
          <header className="lite-stylish-hero">
            <h1 className="lite-stylish-title">{page.title}</h1>
            <p className="lite-stylish-sub">{page.subtitle}</p>
          </header>

          <ClientErrorBoundary label="Name studio">
            <BgmiLiteStylishNameStudio tipText={page.tipText} emptyText={page.emptyStudioText} />
          </ClientErrorBoundary>

          <ClientErrorBoundary label="Name ideas">
            <FreeFireStylishNameIdeas
              heading={page.ideasHeading}
              groups={page.ideaGroups ?? []}
            />
          </ClientErrorBoundary>

          <ClientErrorBoundary label="Steps">
            <section className="lite-stylish-steps" aria-labelledby="ff-name-steps-title">
              <h2 id="ff-name-steps-title" className="lite-stylish-section-title">
                {page.stepsHeading}
              </h2>
              <ol className="lite-stylish-step-list">
                {page.steps.map((step, index) => (
                  <li key={`${step.title}-${index}`} className="lite-stylish-step">
                    <span className="lite-stylish-step-num" aria-hidden>
                      {index + 1}
                    </span>
                    <div>
                      <strong>{step.title}</strong>
                      <p>{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </ClientErrorBoundary>
        </div>
      </main>

      {page.articleHtml?.trim() || faqItems.length ? (
        <ClientErrorBoundary label="Guide">
          <div
            id={guideId}
            className="light-content-wrapper light-content--after-home-calculator"
          >
            <div className="content-inner">
              {page.articleHtml?.trim() ? (
                <div
                  className="article"
                  lang="en"
                  dangerouslySetInnerHTML={{ __html: page.articleHtml }}
                />
              ) : null}
              {faqItems.length ? <FaqAccordion items={faqItems} title={page.faqTitle} /> : null}
            </div>
          </div>
        </ClientErrorBoundary>
      ) : null}

      <ToolPageRatingBlock
        pageKey={pageKey}
        lead={`Was this ${ratingGame} stylish name tool helpful? Tap a star to rate.`}
        ratingSummary={ratingSummary}
        appName={page.seoTitle || crumbCurrent}
        appDescription={page.seoDescription}
        appUrl={canonical}
      />

      <ClientErrorBoundary label="Comments">
        <PageCommentSection
          pageKey={pageKey}
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
