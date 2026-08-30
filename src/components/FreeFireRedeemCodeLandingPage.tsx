import Link from "next/link";
import { ClientErrorBoundary } from "@/src/components/ClientErrorBoundary";
import { FaqAccordion } from "@/src/components/FaqAccordion";
import { FreeFireRedeemCodeBoard } from "@/src/components/FreeFireRedeemCodeBoard";
import { HomeHeader } from "@/src/components/HomeHeader";
import { PageCommentSection } from "@/src/components/PageCommentSection";
import { SiteFooter } from "@/src/components/SiteFooter";
import {
  formatRedeemUpdatedLabelIst,
  wasRedeemUpdatedTodayIst,
} from "@/src/lib/bgmiLiteRedeemFreshness";
import {
  cloneFreeFireRedeemPage,
  FREE_FIRE_REDEEM_CODE_PATH,
  FREE_FIRE_REDEEM_PAGE_KEY,
  type FreeFireRedeemCodePageContent,
} from "@/src/lib/freeFireRedeemCodes";
import {
  cloneFreeFireMaxRedeemPage,
  FREE_FIRE_MAX_REDEEM_CODE_PATH,
  FREE_FIRE_MAX_REDEEM_PAGE_KEY,
} from "@/src/lib/freeFireMaxRedeemCodes";
import { FREE_FIRE_MAX_PATH } from "@/src/lib/freeFirePages";
import { breadcrumbListSchema, faqSchema, webPageSchema } from "@/src/lib/schema";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import {
  listApprovedPageComments,
  type PublicPageComment,
} from "@/src/server/repositories/pageCommentsRepository";
import {
  getFreeFireRedeemPage,
  getFreeFireRedeemUpdatedAt,
} from "@/src/server/repositories/freeFireRedeemCodesRepository";
import {
  getFreeFireMaxRedeemPage,
  getFreeFireMaxRedeemUpdatedAt,
} from "@/src/server/repositories/freeFireMaxRedeemCodesRepository";
import {
  getSettings,
  type SiteSettings,
} from "@/src/server/repositories/settingsRepository";

type FreeFireRedeemLandingOptions = {
  /** Classic Free Fire vs separate Free Fire Max CMS. */
  variant?: "free-fire" | "free-fire-max";
  path?: string;
  parentLabel?: string;
  parentHref?: string;
};

type LandingData = {
  settings: SiteSettings;
  page: FreeFireRedeemCodePageContent;
  updatedAt: Date | null;
  pageComments: PublicPageComment[];
};

/** Isolate data failures so one soft-fail source cannot blank the whole page. */
async function loadLandingData(
  variant: "free-fire" | "free-fire-max",
): Promise<LandingData> {
  const isMax = variant === "free-fire-max";
  const pageKey = isMax ? FREE_FIRE_MAX_REDEEM_PAGE_KEY : FREE_FIRE_REDEEM_PAGE_KEY;
  const [settingsResult, pageResult, updatedAtResult, commentsResult] = await Promise.allSettled([
    getSettings(),
    isMax ? getFreeFireMaxRedeemPage() : getFreeFireRedeemPage(),
    isMax ? getFreeFireMaxRedeemUpdatedAt() : getFreeFireRedeemUpdatedAt(),
    listApprovedPageComments(pageKey),
  ]);

  if (settingsResult.status === "rejected") {
    throw settingsResult.reason instanceof Error
      ? settingsResult.reason
      : new Error("SETTINGS_UNAVAILABLE");
  }

  const fallbackPage = isMax ? cloneFreeFireMaxRedeemPage() : cloneFreeFireRedeemPage();
  return {
    settings: settingsResult.value,
    page: pageResult.status === "fulfilled" ? pageResult.value : fallbackPage,
    updatedAt: updatedAtResult.status === "fulfilled" ? updatedAtResult.value : null,
    pageComments: commentsResult.status === "fulfilled" ? commentsResult.value : [],
  };
}

/** White Free Fire / Free Fire Max redeem-code page: codes → article + FAQ → comments. */
export async function FreeFireRedeemCodeLandingPage(
  options: FreeFireRedeemLandingOptions = {},
) {
  const variant = options.variant ?? "free-fire";
  const isMax = variant === "free-fire-max";
  const { settings, page, updatedAt, pageComments } = await loadLandingData(variant);
  const ui = page.ui;
  const path =
    options.path?.trim() ||
    (isMax ? FREE_FIRE_MAX_REDEEM_CODE_PATH : FREE_FIRE_REDEEM_CODE_PATH);
  const parentLabel = options.parentLabel?.trim() || (isMax ? "FF Max" : "Free Fire");
  const parentHref =
    options.parentHref?.trim() || (isMax ? FREE_FIRE_MAX_PATH : "/");
  const pageKey = isMax ? FREE_FIRE_MAX_REDEEM_PAGE_KEY : FREE_FIRE_REDEEM_PAGE_KEY;
  const codeLabel = isMax ? "Free Fire Max redeem code" : "Free Fire redeem code";
  const canonical = toCanonicalUrl(path);
  const homeUrl = toCanonicalUrl("/");
  const parentUrl = toCanonicalUrl(parentHref);
  const crumbCurrent = ui.breadcrumbName.trim() || "Redeem Code";
  const live = page.codes.filter((c) => c.status === "live");
  const updatedToday = wasRedeemUpdatedTodayIst(updatedAt);
  const updatedLabel =
    updatedAt && updatedToday
      ? formatRedeemUpdatedLabelIst(updatedAt, ui.updatedLabelPrefix)
      : null;
  const faqItems = page.faqs.map((item) => ({
    id: item.id,
    question: item.question,
    answer: item.answer,
  }));
  const cardUi = {
    liveBadge: ui.liveBadge,
    expiredBadge: ui.expiredBadge,
    inactiveLabel: ui.inactiveLabel,
    copyLabel: ui.copyLabel,
    copiedLabel: ui.copiedLabel,
    copyFailedLabel: ui.copyFailedLabel,
    copyAriaCopied: ui.copyAriaCopied,
    copyAriaFailed: ui.copyAriaFailed,
    copyHint: ui.copyHint,
    expiredStatusLabel: ui.expiredStatusLabel,
  };

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
    dateModified: updatedAt ? updatedAt.toISOString() : undefined,
  });
  const faqLd = faqSchema(faqItems);
  const itemListLd =
    live.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: page.sectionHeading,
          numberOfItems: live.length,
          itemListElement: live.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.title,
            description: `${codeLabel}: ${item.code}`,
          })),
        }
      : null;

  const emptyLive = updatedToday ? ui.emptyLiveToday : ui.emptyLiveIdle;

  return (
    <div className="lite-redeem-page">
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

      <main className="lite-redeem-main">
        <div className="lite-redeem-inner">
          <h1 className="lite-redeem-title">{page.title}</h1>
          <p className="lite-redeem-intro">{page.intro}</p>

          <ClientErrorBoundary label="Redeem codes">
            <FreeFireRedeemCodeBoard
              codes={page.codes}
              sectionHeading={page.sectionHeading}
              archiveHeading={page.archiveHeading}
              emptyLive={emptyLive}
              emptyExpired={ui.emptyExpired}
              loadMoreLive={ui.loadMoreLive}
              loadMoreExpired={ui.loadMoreExpired}
              ui={cardUi}
              freshness={
                !updatedToday ? (
                  <div className="lite-redeem-freshness lite-redeem-freshness--idle" role="status">
                    <p className="lite-redeem-freshness-title">{ui.freshnessIdleTitle}</p>
                    <p className="lite-redeem-freshness-text">{ui.freshnessIdleText}</p>
                  </div>
                ) : updatedLabel ? (
                  <p className="lite-redeem-freshness lite-redeem-freshness--ok" role="status">
                    <i className="fa-solid fa-circle-check" aria-hidden />
                    <span>{updatedLabel}</span>
                  </p>
                ) : null
              }
            />
          </ClientErrorBoundary>

          <p className="lite-redeem-closing">{page.closing}</p>
        </div>
      </main>

      {page.articleHtml?.trim() || faqItems.length ? (
        <ClientErrorBoundary label="Guide">
          <div
            id={isMax ? "free-fire-max-redeem-guide" : "free-fire-redeem-guide"}
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
              {faqItems.length ? <FaqAccordion items={faqItems} title={ui.faqTitle} /> : null}
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
      {itemListLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
        />
      ) : null}

      <ClientErrorBoundary label="Footer">
        <SiteFooter settings={settings} />
      </ClientErrorBoundary>
    </div>
  );
}
