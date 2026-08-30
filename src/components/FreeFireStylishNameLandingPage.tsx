import Link from "next/link";
import { ClientErrorBoundary } from "@/src/components/ClientErrorBoundary";
import { BgmiLiteStylishNameStudio } from "@/src/components/BgmiLiteStylishNameStudio";
import { FreeFireStylishNameIdeas } from "@/src/components/FreeFireStylishNameIdeas";
import { FaqAccordion } from "@/src/components/FaqAccordion";
import { HomeHeader } from "@/src/components/HomeHeader";
import { PageCommentSection } from "@/src/components/PageCommentSection";
import { SiteFooter } from "@/src/components/SiteFooter";
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
import { breadcrumbListSchema, faqSchema, webPageSchema } from "@/src/lib/schema";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import {
  listApprovedPageComments,
  type PublicPageComment,
} from "@/src/server/repositories/pageCommentsRepository";
import { getFreeFireStylishNamePage } from "@/src/server/repositories/freeFireStylishNameRepository";
import { getFreeFireMaxStylishNamePage } from "@/src/server/repositories/freeFireMaxStylishNameRepository";
import {
  getSettings,
  type SiteSettings,
} from "@/src/server/repositories/settingsRepository";

type FreeFireStylishNameLandingOptions = {
  variant?: "free-fire" | "free-fire-max";
  path?: string;
  parentLabel?: string;
  parentHref?: string;
};

type LandingData = {
  settings: SiteSettings;
  page: FreeFireStylishNamePageContent;
  pageComments: PublicPageComment[];
};

async function loadLandingData(
  variant: "free-fire" | "free-fire-max",
): Promise<LandingData> {
  const isMax = variant === "free-fire-max";
  const pageKey = isMax ? FREE_FIRE_MAX_STYLISH_NAME_PAGE_KEY : FREE_FIRE_STYLISH_NAME_PAGE_KEY;
  const [settingsResult, pageResult, commentsResult] = await Promise.allSettled([
    getSettings(),
    isMax ? getFreeFireMaxStylishNamePage() : getFreeFireStylishNamePage(),
    listApprovedPageComments(pageKey),
  ]);

  if (settingsResult.status === "rejected") {
    throw settingsResult.reason instanceof Error
      ? settingsResult.reason
      : new Error("SETTINGS_UNAVAILABLE");
  }

  const fallback = isMax ? cloneFreeFireMaxStylishNamePage() : cloneFreeFireStylishNamePage();
  return {
    settings: settingsResult.value,
    page: pageResult.status === "fulfilled" ? pageResult.value : fallback,
    pageComments: commentsResult.status === "fulfilled" ? commentsResult.value : [],
  };
}

/** Free Fire / Free Fire Max stylish name — mobile-first studio + DB-backed copy. */
export async function FreeFireStylishNameLandingPage(
  options: FreeFireStylishNameLandingOptions = {},
) {
  const variant = options.variant ?? "free-fire";
  const isMax = variant === "free-fire-max";
  const { settings, page, pageComments } = await loadLandingData(variant);
  const path =
    options.path?.trim() ||
    (isMax ? FREE_FIRE_MAX_STYLISH_NAME_PATH : FREE_FIRE_STYLISH_NAME_PATH);
  const parentLabel = options.parentLabel?.trim() || (isMax ? "FF Max" : "Free Fire");
  const parentHref =
    options.parentHref?.trim() || (isMax ? FREE_FIRE_MAX_PATH : "/");
  const pageKey = isMax ? FREE_FIRE_MAX_STYLISH_NAME_PAGE_KEY : FREE_FIRE_STYLISH_NAME_PAGE_KEY;
  const canonical = toCanonicalUrl(path);
  const homeUrl = toCanonicalUrl("/");
  const parentUrl = toCanonicalUrl(parentHref);
  const crumbCurrent = (page.title || (isMax ? "FF Max Names" : "FF Names")).trim();
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
            id={isMax ? "free-fire-max-stylish-name-guide" : "free-fire-stylish-name-guide"}
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
