import { FREE_FIRE_MAX_REDEEM_CODE_PATH } from "@/src/lib/freeFireMaxPages";
import {
  FREE_FIRE_MAX_REDEEM_ARTICLE_HTML,
  FREE_FIRE_MAX_REDEEM_FAQS,
} from "@/src/lib/freeFireMaxRedeemArticle";
import { DEFAULT_FREE_FIRE_MAX_REDEEM_CODES } from "@/src/lib/freeFireMaxRedeemDefaultCodes";
import { DEFAULT_FREE_FIRE_MAX_REDEEM_EXPIRED_CODES } from "@/src/lib/freeFireMaxRedeemExpiredDefaults";
import {
  cloneFreeFireRedeemPage,
  type FreeFireRedeemCodePageContent,
} from "@/src/lib/freeFireRedeemCodes";
import {
  cloneFreeFireRedeemUi,
  DEFAULT_FREE_FIRE_REDEEM_UI,
} from "@/src/lib/freeFireRedeemUiDefaults";

export const FREE_FIRE_MAX_REDEEM_PAGE_KEY = "free-fire-max-redeem-code";
export const FREE_FIRE_MAX_REDEEM_SETTINGS_KEY = "settings:freeFireMaxRedeemCodes";

export { FREE_FIRE_MAX_REDEEM_CODE_PATH };
export type { FreeFireRedeemCodePageContent };

/**
 * Built-in Free Fire Max redeem-code page content (separate from classic Free Fire).
 */
export const DEFAULT_FREE_FIRE_MAX_REDEEM_PAGE: FreeFireRedeemCodePageContent = {
  path: FREE_FIRE_MAX_REDEEM_CODE_PATH,
  seoTitle: "Free Fire Max Redeem Codes (Latest)",
  seoDescription:
    "Latest Free Fire Max redeem codes with copy button, live and expired archive. Fan-made guide — redeem only in the official Garena Free Fire Max client.",
  seoKeywords: [
    "Free Fire Max redeem code",
    "FF Max redeem codes",
    "Free Fire Max diamond code",
    "Garena Free Fire Max redeem",
    "FF Max code today",
  ],
  title: "Free Fire Max Redeem Codes",
  intro:
    "Find the latest working Free Fire Max redeem codes by server. Pick your region tab, copy a live code, and redeem it in the official Free Fire Max client on that same server. We never ask for your password, OTP, or diamond payment.",
  sectionHeading: "Active Free Fire Max codes",
  archiveHeading: "Expired Max archive",
  closing:
    "Codes expire fast and can stop working without notice. Always redeem inside the official Free Fire Max client. This page is a fan-made tracker — not affiliated with Garena. If a code fails, wait for the next live drop and skip any paid “code seller” links.",
  articleHtml: FREE_FIRE_MAX_REDEEM_ARTICLE_HTML,
  faqs: FREE_FIRE_MAX_REDEEM_FAQS.map((item) => ({ ...item })),
  commentsLead:
    "Share which Free Fire Max codes worked for you, ask redeem questions, or tip others. Comments appear after admin approval — never post passwords or OTPs.",
  ui: {
    ...cloneFreeFireRedeemUi(),
    breadcrumbName: "Redeem Code",
    socialImageAlt: "Sensitivity Settings — Free Fire Max redeem codes",
    freshnessIdleTitle: "No new Free Fire Max codes today",
    freshnessIdleText:
      "Check back later for fresh Free Fire Max redeem codes. Live codes above still work until they expire.",
    updatedLabelPrefix: "Max codes updated",
    faqTitle: "Free Fire Max Redeem FAQ",
    emptyLiveToday: "No live Free Fire Max codes right now — check again soon.",
    emptyLiveIdle: "No live Free Fire Max codes listed yet.",
    emptyExpired: "No expired Free Fire Max codes in the archive yet.",
  },
  servers: [{ id: "global", label: "Global", badge: "Global" }],
  codes: [
    ...DEFAULT_FREE_FIRE_MAX_REDEEM_CODES.map((c) => ({ ...c })),
    ...DEFAULT_FREE_FIRE_MAX_REDEEM_EXPIRED_CODES.map((c) => ({ ...c })),
  ],
};

export function cloneFreeFireMaxRedeemPage(
  page: FreeFireRedeemCodePageContent = DEFAULT_FREE_FIRE_MAX_REDEEM_PAGE,
): FreeFireRedeemCodePageContent {
  return cloneFreeFireRedeemPage({
    ...page,
    ui: cloneFreeFireRedeemUi(page.ui ?? DEFAULT_FREE_FIRE_REDEEM_UI),
  });
}
