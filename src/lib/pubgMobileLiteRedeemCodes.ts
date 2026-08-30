import { PUBG_MOBILE_LITE_REDEEM_CODE_PATH } from "@/src/lib/pubgMobileLite";
import {
  PUBG_MOBILE_LITE_REDEEM_ARTICLE_HTML,
  PUBG_MOBILE_LITE_REDEEM_FAQS,
} from "@/src/lib/pubgMobileLiteRedeemArticle";
import { DEFAULT_PUBG_MOBILE_LITE_REDEEM_CODES } from "@/src/lib/pubgMobileLiteRedeemDefaultCodes";
import { DEFAULT_PUBG_MOBILE_LITE_REDEEM_EXPIRED_CODES } from "@/src/lib/pubgMobileLiteRedeemExpiredDefaults";
import {
  clonePubgMobileLiteRedeemUi,
  DEFAULT_PUBG_MOBILE_LITE_REDEEM_UI,
  type PubgMobileLiteRedeemUiLabels,
} from "@/src/lib/pubgMobileLiteRedeemUiDefaults";

export const PUBG_MOBILE_LITE_REDEEM_PAGE_KEY = "pubg-mobile-lite-redeem-code";

export { PUBG_MOBILE_LITE_REDEEM_CODE_PATH };
export type { PubgMobileLiteRedeemUiLabels };

export type PubgMobileLiteRedeemCodeItem = {
  id: string;
  title: string;
  code: string;
  status: "live" | "expired";
  releasedLabel?: string;
  expiresLabel?: string;
  expiredOnLabel?: string;
};

export type PubgMobileLiteRedeemFaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type PubgMobileLiteRedeemCodePageContent = {
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
  faqs: PubgMobileLiteRedeemFaqItem[];
  commentsLead: string;
  ui: PubgMobileLiteRedeemUiLabels;
  codes: PubgMobileLiteRedeemCodeItem[];
};

/**
 * Built-in PUBG Mobile Lite redeem-code page content.
 * Fan-made info only — admin CMS can override via /admin/pubg-mobile-lite-redeem.
 */
export const DEFAULT_PUBG_MOBILE_LITE_REDEEM_PAGE: PubgMobileLiteRedeemCodePageContent = {
  path: PUBG_MOBILE_LITE_REDEEM_CODE_PATH,
  seoTitle: "PUBG Mobile Lite Redeem Codes (Latest)",
  seoDescription:
    "Latest PUBG Mobile Lite redeem codes with copy button, live and expired archive. Fan-made guide — redeem only in the official game client.",
  seoKeywords: [
    "PUBG Mobile Lite redeem code",
    "PUBG Lite redeem codes",
    "PUBG Lite UC code",
    "PUBG Lite crate code",
    "PUBG Mobile Lite redeem",
  ],
  title: "PUBG Mobile Lite Redeem Codes",
  intro:
    "Find the latest working PUBG Mobile Lite redeem codes in one place. Copy a live code, open PUBG Mobile Lite, and redeem it from the official in-game redeem section. We never ask for your password, OTP, or UC payment.",
  sectionHeading: "Active redeem codes",
  archiveHeading: "Expired archive",
  closing:
    "Codes expire fast and can stop working without notice. Always redeem inside the official PUBG Mobile Lite client. This page is a fan-made tracker — not affiliated with Krafton / PUBG. If a code fails, wait for the next live drop and skip any paid “code seller” links.",
  articleHtml: PUBG_MOBILE_LITE_REDEEM_ARTICLE_HTML,
  faqs: PUBG_MOBILE_LITE_REDEEM_FAQS.map((item) => ({ ...item })),
  commentsLead:
    "Share which codes worked for you, ask redeem questions, or tip others. Comments appear after admin approval — never post passwords or OTPs.",
  ui: clonePubgMobileLiteRedeemUi(),
  codes: [
    ...DEFAULT_PUBG_MOBILE_LITE_REDEEM_CODES.map((c) => ({ ...c })),
    ...DEFAULT_PUBG_MOBILE_LITE_REDEEM_EXPIRED_CODES.map((c) => ({ ...c })),
  ],
};

export function clonePubgMobileLiteRedeemPage(
  page: PubgMobileLiteRedeemCodePageContent = DEFAULT_PUBG_MOBILE_LITE_REDEEM_PAGE,
): PubgMobileLiteRedeemCodePageContent {
  return {
    ...page,
    seoKeywords: [...page.seoKeywords],
    faqs: page.faqs.map((f) => ({ ...f })),
    ui: clonePubgMobileLiteRedeemUi(page.ui ?? DEFAULT_PUBG_MOBILE_LITE_REDEEM_UI),
    codes: page.codes.map((c) => ({ ...c })),
  };
}
