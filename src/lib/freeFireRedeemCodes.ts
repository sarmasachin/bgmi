import { FREE_FIRE_REDEEM_CODE_PATH } from "@/src/lib/freeFirePages";
import {
  FREE_FIRE_REDEEM_ARTICLE_HTML,
  FREE_FIRE_REDEEM_FAQS,
} from "@/src/lib/freeFireRedeemArticle";
import { DEFAULT_FREE_FIRE_REDEEM_CODES } from "@/src/lib/freeFireRedeemDefaultCodes";
import { DEFAULT_FREE_FIRE_REDEEM_EXPIRED_CODES } from "@/src/lib/freeFireRedeemExpiredDefaults";
import {
  cloneFreeFireRedeemUi,
  DEFAULT_FREE_FIRE_REDEEM_UI,
  type FreeFireRedeemUiLabels,
} from "@/src/lib/freeFireRedeemUiDefaults";
import type { FreeFireRedeemServerId } from "@/src/lib/freeFireRedeemServers";

export const FREE_FIRE_REDEEM_PAGE_KEY = "free-fire-redeem-code";

export { FREE_FIRE_REDEEM_CODE_PATH };
export type { FreeFireRedeemUiLabels, FreeFireRedeemServerId };

export type FreeFireRedeemCodeItem = {
  id: string;
  title: string;
  code: string;
  status: "live" | "expired";
  /** Which Free Fire region/server this code works on. */
  server: FreeFireRedeemServerId;
  releasedLabel?: string;
  expiresLabel?: string;
  expiredOnLabel?: string;
};

export type FreeFireRedeemFaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type FreeFireRedeemCodePageContent = {
  path: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  title: string;
  intro: string;
  sectionHeading: string;
  closing: string;
  archiveHeading: string;
  articleHtml: string;
  faqs: FreeFireRedeemFaqItem[];
  commentsLead: string;
  ui: FreeFireRedeemUiLabels;
  codes: FreeFireRedeemCodeItem[];
};

/**
 * Built-in Free Fire redeem-code page content.
 * Fan-made info only — admin CMS can override when wired.
 */
export const DEFAULT_FREE_FIRE_REDEEM_PAGE: FreeFireRedeemCodePageContent = {
  path: FREE_FIRE_REDEEM_CODE_PATH,
  seoTitle: "Free Fire Redeem Codes (Latest)",
  seoDescription:
    "Latest Free Fire redeem codes with copy button, live and expired archive. Fan-made guide — redeem only in the official Garena Free Fire client.",
  seoKeywords: [
    "Free Fire redeem code",
    "FF redeem codes",
    "Free Fire diamond code",
    "Garena Free Fire redeem",
    "FF code today",
  ],
  title: "Free Fire Redeem Codes",
  intro:
    "Find the latest working Free Fire redeem codes by server. Pick your region tab, copy a live code, and redeem it in the official Free Fire client on that same server. We never ask for your password, OTP, or diamond payment.",
  sectionHeading: "Active redeem codes",
  archiveHeading: "Expired archive",
  closing:
    "Codes expire fast and can stop working without notice. Always redeem inside the official Free Fire client. This page is a fan-made tracker — not affiliated with Garena. If a code fails, wait for the next live drop and skip any paid “code seller” links.",
  articleHtml: FREE_FIRE_REDEEM_ARTICLE_HTML,
  faqs: FREE_FIRE_REDEEM_FAQS.map((item) => ({ ...item })),
  commentsLead:
    "Share which codes worked for you, ask redeem questions, or tip others. Comments appear after admin approval — never post passwords or OTPs.",
  ui: cloneFreeFireRedeemUi(),
  codes: [
    ...DEFAULT_FREE_FIRE_REDEEM_CODES.map((c) => ({ ...c })),
    ...DEFAULT_FREE_FIRE_REDEEM_EXPIRED_CODES.map((c) => ({ ...c })),
  ],
};

export function cloneFreeFireRedeemPage(
  page: FreeFireRedeemCodePageContent = DEFAULT_FREE_FIRE_REDEEM_PAGE,
): FreeFireRedeemCodePageContent {
  return {
    ...page,
    seoKeywords: [...page.seoKeywords],
    faqs: page.faqs.map((f) => ({ ...f })),
    ui: cloneFreeFireRedeemUi(page.ui ?? DEFAULT_FREE_FIRE_REDEEM_UI),
    codes: page.codes.map((c) => ({ ...c })),
  };
}
