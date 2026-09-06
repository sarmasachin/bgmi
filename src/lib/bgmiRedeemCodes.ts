import { BGMI_REDEEM_CODE_PATH } from "@/src/lib/resolveNavForPath";
import { BGMI_REDEEM_ARTICLE_HTML, BGMI_REDEEM_FAQS } from "@/src/lib/bgmiRedeemArticle";
import { DEFAULT_BGMI_REDEEM_CODES } from "@/src/lib/bgmiRedeemDefaultCodes";
import { DEFAULT_BGMI_REDEEM_EXPIRED_CODES } from "@/src/lib/bgmiRedeemExpiredDefaults";
import {
  cloneBgmiRedeemUi,
  DEFAULT_BGMI_REDEEM_UI,
  type BgmiRedeemUiLabels,
} from "@/src/lib/bgmiRedeemUiDefaults";

export const BGMI_REDEEM_PAGE_KEY = "bgmi-redeem-code";

export { BGMI_REDEEM_CODE_PATH };
export type { BgmiRedeemUiLabels };

export type BgmiRedeemCodeItem = {
  id: string;
  title: string;
  code: string;
  status: "live" | "expired";
  releasedLabel?: string;
  expiresLabel?: string;
  expiredOnLabel?: string;
};

export type BgmiRedeemFaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type BgmiRedeemCodePageContent = {
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
  faqs: BgmiRedeemFaqItem[];
  commentsLead: string;
  ui: BgmiRedeemUiLabels;
  codes: BgmiRedeemCodeItem[];
};

/**
 * Built-in BGMI redeem-code page content.
 * Fan-made info only — admin CMS can override via /admin/bgmi-redeem.
 */
export const DEFAULT_BGMI_REDEEM_PAGE: BgmiRedeemCodePageContent = {
  path: BGMI_REDEEM_CODE_PATH,
  seoTitle: "BGMI Redeem Codes (Latest)",
  seoDescription:
    "Latest BGMI redeem codes with copy button, live and expired archive. Fan-made guide — redeem only in the official game client.",
  seoKeywords: [
    "BGMI redeem code",
    "BGMI codes",
    "BGMI UC code",
    "BGMI crate code",
    "BGMI redeem",
  ],
  title: "BGMI Redeem Codes",
  intro:
    "Find the latest working BGMI redeem codes in one place. Copy a live code, open BGMI, and redeem it from the official in-game redeem section. We never ask for your password, OTP, or UC payment.",
  sectionHeading: "Active redeem codes",
  archiveHeading: "Expired archive",
  closing:
    "Codes expire fast and can stop working without notice. Always redeem inside the official BGMI / Krafton client. This page is a fan-made tracker — not affiliated with Krafton. If a code fails, wait for the next live drop and skip any paid “code seller” links.",
  articleHtml: BGMI_REDEEM_ARTICLE_HTML,
  faqs: BGMI_REDEEM_FAQS.map((item) => ({ ...item })),
  commentsLead:
    "Share which codes worked for you, ask redeem questions, or tip others. Comments appear after admin approval — never post passwords or OTPs.",
  ui: cloneBgmiRedeemUi(),
  codes: [
    ...DEFAULT_BGMI_REDEEM_CODES.map((c) => ({ ...c })),
    ...DEFAULT_BGMI_REDEEM_EXPIRED_CODES.map((c) => ({ ...c })),
  ],
};

export function cloneBgmiRedeemPage(
  page: BgmiRedeemCodePageContent = DEFAULT_BGMI_REDEEM_PAGE,
): BgmiRedeemCodePageContent {
  return {
    ...page,
    seoKeywords: [...page.seoKeywords],
    faqs: page.faqs.map((f) => ({ ...f })),
    ui: cloneBgmiRedeemUi(page.ui ?? DEFAULT_BGMI_REDEEM_UI),
    codes: page.codes.map((c) => ({ ...c })),
  };
}
