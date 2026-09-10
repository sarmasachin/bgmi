import { PUBG_REDEEM_CODE_PATH } from "@/src/lib/resolveNavForPath";
import { PUBG_REDEEM_ARTICLE_HTML, PUBG_REDEEM_FAQS } from "@/src/lib/pubgRedeemArticle";
import {
  clonePubgRedeemUi,
  DEFAULT_PUBG_REDEEM_UI,
  type PubgRedeemUiLabels,
} from "@/src/lib/pubgRedeemUiDefaults";

export const PUBG_REDEEM_PAGE_KEY = "pubg-redeem-code";

export { PUBG_REDEEM_CODE_PATH };
export type { PubgRedeemUiLabels };

export type PubgRedeemCodeItem = {
  id: string;
  title: string;
  code: string;
  status: "live" | "expired";
  releasedAt?: string;
  expiresAt?: string;
  expiredOnAt?: string;
  releasedLabel?: string;
  expiresLabel?: string;
  expiredOnLabel?: string;
};

export type PubgRedeemFaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type PubgRedeemCodePageContent = {
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
  faqs: PubgRedeemFaqItem[];
  commentsLead: string;
  ui: PubgRedeemUiLabels;
  codes: PubgRedeemCodeItem[];
};

/**
 * Built-in PUBG Mobile redeem-code page content.
 * Fan-made info only — admin CMS can override via /admin/pubg-redeem.
 */
export const DEFAULT_PUBG_REDEEM_PAGE: PubgRedeemCodePageContent = {
  path: PUBG_REDEEM_CODE_PATH,
  seoTitle: "PUBG Mobile Redeem Codes (Latest)",
  seoDescription:
    "Latest PUBG Mobile redeem codes with copy button, live and expired archive. Fan-made guide — redeem only in the official game client.",
  seoKeywords: [
    "PUBG Mobile redeem code",
    "PUBG redeem codes",
    "PUBG Mobile UC code",
    "PUBG Mobile crate code",
    "PUBG Mobile redeem",
  ],
  title: "PUBG Mobile Redeem Codes",
  intro:
    "Find the latest working PUBG Mobile redeem codes in one place. Copy a live code, open PUBG Mobile, and redeem it from the official in-game redeem section. We never ask for your password, OTP, or UC payment.",
  sectionHeading: "Active redeem codes",
  archiveHeading: "Expired archive",
  closing:
    "Codes expire fast and can stop working without notice. Always redeem inside the official PUBG Mobile client. This page is a fan-made tracker — not affiliated with Krafton or Level Infinite. If a code fails, wait for the next live drop and skip any paid “code seller” links.",
  articleHtml: PUBG_REDEEM_ARTICLE_HTML,
  faqs: PUBG_REDEEM_FAQS.map((item) => ({ ...item })),
  commentsLead:
    "Share which codes worked for you, ask redeem questions, or tip others. Comments appear after admin approval — never post passwords or OTPs.",
  ui: clonePubgRedeemUi(),
  codes: [],
};

export function clonePubgRedeemPage(
  page: PubgRedeemCodePageContent = DEFAULT_PUBG_REDEEM_PAGE,
): PubgRedeemCodePageContent {
  return {
    ...page,
    seoKeywords: [...page.seoKeywords],
    faqs: page.faqs.map((f) => ({ ...f })),
    ui: clonePubgRedeemUi(page.ui ?? DEFAULT_PUBG_REDEEM_UI),
    codes: page.codes.map((c) => ({ ...c })),
  };
}
