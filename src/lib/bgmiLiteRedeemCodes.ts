import { BGMI_LITE_REDEEM_CODE_PATH } from "@/src/lib/resolveNavForPath";
import {
  BGMI_LITE_REDEEM_ARTICLE_HTML,
  BGMI_LITE_REDEEM_FAQS,
} from "@/src/lib/bgmiLiteRedeemArticle";
import { DEFAULT_BGMI_LITE_REDEEM_CODES } from "@/src/lib/bgmiLiteRedeemDefaultCodes";
import { DEFAULT_BGMI_LITE_REDEEM_EXPIRED_CODES } from "@/src/lib/bgmiLiteRedeemExpiredDefaults";
import {
  cloneBgmiLiteRedeemUi,
  DEFAULT_BGMI_LITE_REDEEM_UI,
  type BgmiLiteRedeemUiLabels,
} from "@/src/lib/bgmiLiteRedeemUiDefaults";

export const BGMI_LITE_REDEEM_PAGE_KEY = "bgmi-lite-redeem-code";

export { BGMI_LITE_REDEEM_CODE_PATH };
export type { BgmiLiteRedeemUiLabels };

export type BgmiLiteRedeemCodeItem = {
  id: string;
  title: string;
  code: string;
  status: "live" | "expired";
  releasedLabel?: string;
  expiresLabel?: string;
  expiredOnLabel?: string;
};

export type BgmiLiteRedeemFaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type BgmiLiteRedeemCodePageContent = {
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
  faqs: BgmiLiteRedeemFaqItem[];
  commentsLead: string;
  ui: BgmiLiteRedeemUiLabels;
  codes: BgmiLiteRedeemCodeItem[];
};

/**
 * Built-in BGMI Lite redeem-code page content.
 * Fan-made info only — codes are illustrative until admin/CMS wiring.
 */
export const DEFAULT_BGMI_LITE_REDEEM_PAGE: BgmiLiteRedeemCodePageContent = {
  path: BGMI_LITE_REDEEM_CODE_PATH,
  seoTitle: "BGMI Lite Redeem Codes (Latest)",
  seoDescription:
    "Latest BGMI Lite redeem codes with copy button, live and expired archive. Fan-made guide — redeem only in the official game client.",
  seoKeywords: [
    "BGMI Lite redeem code",
    "BGMI Lite codes",
    "BGMI Lite UC code",
    "BGMI Lite crate code",
    "BGMI Lite redeem",
  ],
  title: "BGMI Lite Redeem Codes",
  intro:
    "Find the latest working BGMI Lite redeem codes in one place. Copy a live code, open BGMI Lite, and redeem it from the official in-game redeem section. We never ask for your password, OTP, or UC payment.",
  sectionHeading: "Active redeem codes",
  archiveHeading: "Expired archive",
  closing:
    "Codes expire fast and can stop working without notice. Always redeem inside the official BGMI Lite / Krafton client. This page is a fan-made tracker — not affiliated with Krafton. If a code fails, wait for the next live drop and skip any paid “code seller” links.",
  articleHtml: BGMI_LITE_REDEEM_ARTICLE_HTML,
  faqs: BGMI_LITE_REDEEM_FAQS.map((item) => ({ ...item })),
  commentsLead:
    "Share which codes worked for you, ask redeem questions, or tip others. Comments appear after admin approval — never post passwords or OTPs.",
  ui: cloneBgmiLiteRedeemUi(),
  codes: [
    ...DEFAULT_BGMI_LITE_REDEEM_CODES.map((c) => ({ ...c })),
    ...DEFAULT_BGMI_LITE_REDEEM_EXPIRED_CODES.map((c) => ({ ...c })),
  ],
};

export function cloneBgmiLiteRedeemPage(
  page: BgmiLiteRedeemCodePageContent = DEFAULT_BGMI_LITE_REDEEM_PAGE,
): BgmiLiteRedeemCodePageContent {
  return {
    ...page,
    seoKeywords: [...page.seoKeywords],
    faqs: page.faqs.map((f) => ({ ...f })),
    ui: cloneBgmiLiteRedeemUi(page.ui ?? DEFAULT_BGMI_LITE_REDEEM_UI),
    codes: page.codes.map((c) => ({ ...c })),
  };
}
