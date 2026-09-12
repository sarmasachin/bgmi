import Link from "next/link";
import { ClientErrorBoundary } from "@/src/components/ClientErrorBoundary";
import { BgmiRedeemCodeList } from "@/src/components/BgmiRedeemCodeList";
import { FaqAccordion } from "@/src/components/FaqAccordion";
import { HomeHeader } from "@/src/components/HomeHeader";
import { PageCommentSection } from "@/src/components/PageCommentSection";
import { SiteFooter } from "@/src/components/SiteFooter";
import {
  formatRedeemUpdatedLabelIst,
  resolveRedeemFreshnessAt,
  resolveRedeemFreshnessBanner,
} from "@/src/lib/bgmiLiteRedeemFreshness";
import {
  clonePubgRedeemPage,
  PUBG_REDEEM_CODE_PATH,
  PUBG_REDEEM_PAGE_KEY,
  type PubgRedeemCodePageContent,
} from "@/src/lib/pubgRedeemCodes";
import {
  applyAutoExpireRedeemCode,
  isRedeemCodePubliclyLive,
  sortExpiredRedeemCodesNewestFirst,
} from "@/src/lib/redeemCodeSchedule";
import { breadcrumbListSchema, faqSchema, webPageSchema } from "@/src/lib/schema";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import {
  getPubgRedeemPage,
  getPubgRedeemUpdatedAt,
} from "@/src/server/repositories/pubgRedeemCodesRepository";
import {
  listApprovedPageComments,
  type PublicPageComment,
} from "@/src/server/repositories/pageCommentsRepository";
import { getSettings, type SiteSettings } from "@/src/server/repositories/settingsRepository";

type LandingData = {
  settings: SiteSettings;
  page: PubgRedeemCodePageContent;
  updatedAt: Date | null;
  pageComments: PublicPageComment[];
};

/** Isolate data failures so comments/CMS cannot blank the whole page. */
async function loadLandingData(): Promise<LandingData> {
  const [settingsResult, pageResult, updatedAtResult, commentsResult] = await Promise.allSettled([
    getSettings(),
    getPubgRedeemPage(),
    getPubgRedeemUpdatedAt(),
    listApprovedPageComments(PUBG_REDEEM_PAGE_KEY),
  ]);

  if (settingsResult.status === "rejected") {
    throw settingsResult.reason instanceof Error
      ? settingsResult.reason
      : new Error("SETTINGS_UNAVAILABLE");
  }

  return {
    settings: settingsResult.value,
    page: pageResult.status === "fulfilled" ? pageResult.value : clonePubgRedeemPage(),
    updatedAt: updatedAtResult.status === "fulfilled" ? updatedAtResult.value : null,
    pageComments: commentsResult.status === "fulfilled" ? commentsResult.value : [],
  };
}

/** White PUBG Mobile redeem-code page: codes → article + FAQ → comments. */
export async function PubgRedeemCodeLandingPage() {
  const { settings, page, updatedAt, pageComments } = await loadLandingData();
  const ui = page.ui;
  const canonical = toCanonicalUrl(PUBG_REDEEM_CODE_PATH);
  const homeUrl = toCanonicalUrl("/");
  const pubgUrl = toCanonicalUrl("/pubg");
  const crumbCurrent = ui.breadcrumbName.trim() || "PUBG Redeem Code";
  const dated = page.codes.map((c) => applyAutoExpireRedeemCode(c));
  const live = dated.filter((c) => isRedeemCodePubliclyLive(c));
  const expired = sortExpiredRedeemCodesNewestFirst(
    dated.filter((c) => c.status === "expired"),
  );
  const freshnessAt = resolveRedeemFreshnessAt(
    updatedAt,
    live.map((c) => c.releasedAt),
  );
  const updatedToday = Boolean(freshnessAt);
  const updatedLabel = freshnessAt
    ? formatRedeemUpdatedLabelIst(freshnessAt, ui.updatedLabelPrefix)
    : null;
  const freshnessBanner = resolveRedeemFreshnessBanner(updatedToday, live.length);
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
    { name: "PUBG Mobile", url: pubgUrl },
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
            description: `PUBG Mobile redeem code: ${item.code}`,
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
            <Link href="/pubg">PUBG Mobile</Link>
          </li>
          <li aria-current="page">{crumbCurrent}</li>
        </ol>
      </nav>

      <main className="lite-redeem-main">
        <div className="lite-redeem-inner">
          <h1 className="lite-redeem-title">{page.title}</h1>
          <p className="lite-redeem-intro">{page.intro}</p>

          <h2 className="lite-redeem-h2">{page.sectionHeading}</h2>

          {freshnessBanner === "idle" ? (
            <div className="lite-redeem-freshness lite-redeem-freshness--idle" role="status">
              <p className="lite-redeem-freshness-title">{ui.freshnessIdleTitle}</p>
              <p className="lite-redeem-freshness-text">{ui.freshnessIdleText}</p>
            </div>
          ) : freshnessBanner === "ok" && updatedLabel ? (
            <p className="lite-redeem-freshness lite-redeem-freshness--ok" role="status">
              <i className="fa-solid fa-circle-check" aria-hidden />
              <span>{updatedLabel}</span>
            </p>
          ) : null}

          <ClientErrorBoundary label="Redeem codes">
            <BgmiRedeemCodeList
              items={live}
              emptyMessage={emptyLive}
              loadMoreLabel={ui.loadMoreLive}
              ui={cardUi}
            />
          </ClientErrorBoundary>

          {expired.length ? (
            <>
              <h2 className="lite-redeem-archive-h2">
                <i className="fa-solid fa-hourglass-half" aria-hidden />
                {page.archiveHeading}
              </h2>
              <ClientErrorBoundary label="Expired codes">
                <BgmiRedeemCodeList
                  items={expired}
                  emptyMessage={ui.emptyExpired}
                  loadMoreLabel={ui.loadMoreExpired}
                  ui={cardUi}
                />
              </ClientErrorBoundary>
            </>
          ) : null}

          <p className="lite-redeem-closing">{page.closing}</p>
        </div>
      </main>

      {page.articleHtml?.trim() || faqItems.length ? (
        <ClientErrorBoundary label="Guide">
          <div
            id="pubg-redeem-guide"
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
          pageKey={PUBG_REDEEM_PAGE_KEY}
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
