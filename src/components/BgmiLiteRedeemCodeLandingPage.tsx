import Link from "next/link";
import { ClientErrorBoundary } from "@/src/components/ClientErrorBoundary";
import { BgmiLiteRedeemCodeList } from "@/src/components/BgmiLiteRedeemCodeList";
import { FaqAccordion } from "@/src/components/FaqAccordion";
import { HomeHeader } from "@/src/components/HomeHeader";
import { PageCommentSection } from "@/src/components/PageCommentSection";
import { SiteFooter } from "@/src/components/SiteFooter";
import {
  BGMI_LITE_REDEEM_CODE_PATH,
  BGMI_LITE_REDEEM_PAGE_KEY,
} from "@/src/lib/bgmiLiteRedeemCodes";
import {
  formatRedeemUpdatedLabelIst,
  wasRedeemUpdatedTodayIst,
} from "@/src/lib/bgmiLiteRedeemFreshness";
import { sortExpiredRedeemCodesNewestFirst } from "@/src/lib/redeemCodeSchedule";
import { breadcrumbListSchema, faqSchema, webPageSchema } from "@/src/lib/schema";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import {
  getBgmiLiteRedeemPage,
  getBgmiLiteRedeemUpdatedAt,
} from "@/src/server/repositories/bgmiLiteRedeemCodesRepository";
import { listApprovedPageComments } from "@/src/server/repositories/pageCommentsRepository";
import { getSettings } from "@/src/server/repositories/settingsRepository";

/** White BGMI Lite redeem-code page: codes → article + FAQ → comments. */
export async function BgmiLiteRedeemCodeLandingPage() {
  const [settings, page, updatedAt, pageComments] = await Promise.all([
    getSettings(),
    getBgmiLiteRedeemPage(),
    getBgmiLiteRedeemUpdatedAt(),
    listApprovedPageComments(BGMI_LITE_REDEEM_PAGE_KEY),
  ]);
  const ui = page.ui;
  const canonical = toCanonicalUrl(BGMI_LITE_REDEEM_CODE_PATH);
  const homeUrl = toCanonicalUrl("/");
  const liteCalcUrl = toCanonicalUrl("/bgmi-lite");
  const crumbCurrent = ui.breadcrumbName.trim() || "BGMI Lite Redeem Code";
  const live = page.codes.filter((c) => c.status === "live");
  const expired = sortExpiredRedeemCodesNewestFirst(
    page.codes.filter((c) => c.status === "expired"),
  );
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
    { name: "BGMI Lite", url: liteCalcUrl },
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
            description: `BGMI Lite redeem code: ${item.code}`,
          })),
        }
      : null;

  const emptyLive = updatedToday ? ui.emptyLiveToday : ui.emptyLiveIdle;

  return (
    <div className="lite-redeem-page">
      <HomeHeader siteTitle={settings.homeDisplay.headerTitle} navigation={settings.navigation} />

      <nav className="ff-as-breadcrumb" aria-label="Breadcrumb">
        <ol className="ff-as-breadcrumb-list">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/bgmi-lite">BGMI Lite</Link>
          </li>
          <li aria-current="page">{crumbCurrent}</li>
        </ol>
      </nav>

      <main className="lite-redeem-main">
        <div className="lite-redeem-inner">
          <h1 className="lite-redeem-title">{page.title}</h1>
          <p className="lite-redeem-intro">{page.intro}</p>

          <h2 className="lite-redeem-h2">{page.sectionHeading}</h2>

          {!updatedToday ? (
            <div className="lite-redeem-freshness lite-redeem-freshness--idle" role="status">
              <p className="lite-redeem-freshness-title">{ui.freshnessIdleTitle}</p>
              <p className="lite-redeem-freshness-text">{ui.freshnessIdleText}</p>
            </div>
          ) : updatedLabel ? (
            <p className="lite-redeem-freshness lite-redeem-freshness--ok" role="status">
              <i className="fa-solid fa-circle-check" aria-hidden />
              <span>{updatedLabel}</span>
            </p>
          ) : null}

          <BgmiLiteRedeemCodeList
            items={live}
            emptyMessage={emptyLive}
            loadMoreLabel={ui.loadMoreLive}
            ui={cardUi}
          />

          {expired.length ? (
            <>
              <h2 className="lite-redeem-archive-h2">
                <i className="fa-solid fa-hourglass-half" aria-hidden />
                {page.archiveHeading}
              </h2>
              <BgmiLiteRedeemCodeList
                items={expired}
                emptyMessage={ui.emptyExpired}
                loadMoreLabel={ui.loadMoreExpired}
                ui={cardUi}
              />
            </>
          ) : null}

          <p className="lite-redeem-closing">{page.closing}</p>
        </div>
      </main>

      {page.articleHtml?.trim() || faqItems.length ? (
        <div
          id="bgmi-lite-redeem-guide"
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
      ) : null}

      <PageCommentSection
        pageKey={BGMI_LITE_REDEEM_PAGE_KEY}
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
