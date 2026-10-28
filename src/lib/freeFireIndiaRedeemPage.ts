import { asFreeFireIndiaCopy } from "@/src/lib/freeFireIndiaCopy";
import { FREE_FIRE_INDIA_PATH, FREE_FIRE_INDIA_REDEEM_CODE_PATH } from "@/src/lib/gamePagePath";
import {
  cloneFreeFireRedeemPage,
  type FreeFireRedeemCodePageContent,
  type FreeFireRedeemUiLabels,
} from "@/src/lib/freeFireRedeemCodes";

export { FREE_FIRE_INDIA_REDEEM_CODE_PATH };
export const FREE_FIRE_INDIA_REDEEM_PAGE_KEY = "free-fire-india-redeem-code";
export const FREE_FIRE_INDIA_REDEEM_GUIDE_ID = "free-fire-india-redeem-guide";
export const FREE_FIRE_INDIA_REDEEM_SETTINGS_KEY = "settings:freeFireIndiaRedeemCodes";

const UI_TEXT_KEYS = [
  "liveBadge",
  "expiredBadge",
  "inactiveLabel",
  "copyLabel",
  "copiedLabel",
  "copyFailedLabel",
  "copyAriaCopied",
  "copyAriaFailed",
  "copyHint",
  "expiredStatusLabel",
  "loadMoreLive",
  "loadMoreExpired",
  "emptyLiveToday",
  "emptyLiveIdle",
  "emptyExpired",
  "freshnessIdleTitle",
  "freshnessIdleText",
  "updatedLabelPrefix",
  "faqTitle",
  "breadcrumbName",
  "socialImageAlt",
] as const satisfies readonly (keyof FreeFireRedeemUiLabels)[];

function sayUi(ui: FreeFireRedeemUiLabels): FreeFireRedeemUiLabels {
  const next = { ...ui };
  for (const key of UI_TEXT_KEYS) next[key] = asFreeFireIndiaCopy(ui[key]);
  return next;
}

/** Same Free Fire redeem page, with the public name set to Free Fire India. Codes stay unchanged. */
export function toFreeFireIndiaRedeemPage(
  page: FreeFireRedeemCodePageContent,
): FreeFireRedeemCodePageContent {
  const say = asFreeFireIndiaCopy;
  const articleHtml = say(page.articleHtml).replace(
    `<a href="/">Free Fire India sensitivity calculator</a>`,
    `<a href="${FREE_FIRE_INDIA_PATH}">Free Fire India sensitivity calculator</a>`,
  );

  return {
    ...page,
    path: FREE_FIRE_INDIA_REDEEM_CODE_PATH,
    seoTitle: say(page.seoTitle),
    seoDescription: say(page.seoDescription),
    seoKeywords: page.seoKeywords.map(say),
    title: say(page.title),
    intro: say(page.intro),
    sectionHeading: say(page.sectionHeading),
    closing: say(page.closing),
    archiveHeading: say(page.archiveHeading),
    articleHtml,
    faqs: page.faqs.map((item) => ({
      ...item,
      question: say(item.question),
      answer: say(item.answer),
    })),
    commentsLead: say(page.commentsLead),
    ui: sayUi(page.ui),
    servers: page.servers.map((server) => ({
      ...server,
      label: say(server.label),
      badge: say(server.badge),
    })),
    codes: page.codes.map((item) => ({
      ...item,
      title: say(item.title),
      releasedLabel: item.releasedLabel ? say(item.releasedLabel) : item.releasedLabel,
      expiresLabel: item.expiresLabel ? say(item.expiresLabel) : item.expiresLabel,
      expiredOnLabel: item.expiredOnLabel ? say(item.expiredOnLabel) : item.expiredOnLabel,
    })),
  };
}

/** Built-in India page. Not a live copy of the saved Free Fire redeem row. */
export const DEFAULT_FREE_FIRE_INDIA_REDEEM_PAGE: FreeFireRedeemCodePageContent =
  toFreeFireIndiaRedeemPage(cloneFreeFireRedeemPage());
