import { PUBG_MOBILE_LITE_NAME_PATH } from "@/src/lib/pubgMobileLite";
import {
  PUBG_MOBILE_LITE_NAME_ARTICLE_HTML,
  PUBG_MOBILE_LITE_NAME_FAQS,
} from "@/src/lib/pubgMobileLiteNameContent";

export const PUBG_MOBILE_LITE_NAME_PAGE_KEY = "pubg-mobile-lite-name";

export { PUBG_MOBILE_LITE_NAME_PATH };

export type PubgMobileLiteNamePageContent = {
  path: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  title: string;
  subtitle: string;
  tipText: string;
  stepsHeading: string;
  steps: Array<{ title: string; text: string }>;
  ideasHeading: string;
  articleHtml: string;
  faqs: Array<{ id: string; question: string; answer: string }>;
  commentsLead: string;
  faqTitle: string;
  emptyStudioText: string;
};

export const DEFAULT_PUBG_MOBILE_LITE_NAME_PAGE: PubgMobileLiteNamePageContent = {
  path: PUBG_MOBILE_LITE_NAME_PATH,
  seoTitle: "PUBG Mobile Lite Stylish Name Generator",
  seoDescription:
    "Create readable PUBG Mobile Lite stylish names on mobile — fonts, light symbols, live length guide, and one-tap copy. Fan-made tool; preview inside the official client.",
  seoKeywords: [
    "PUBG Mobile Lite stylish name",
    "PUBG Lite name generator",
    "PUBG Lite nick name",
    "PUBG Lite stylish ID",
    "PUBG Mobile Lite rename",
  ],
  title: "PUBG Mobile Lite Stylish Name",
  subtitle:
    "Type your name once. Pick a clean style. Copy and paste into PUBG Mobile Lite — built for thumbs on mobile.",
  tipText:
    "Preview in Notes or Lite rename before spending a Rename Card. Fancy letters also count toward the limit.",
  stepsHeading: "Apply it in PUBG Mobile Lite",
  steps: [
    {
      title: "Copy a style",
      text: "Use the studio above and tap Copy on the name you like.",
    },
    {
      title: "Open Lite rename",
      text: "In PUBG Mobile Lite, open profile / rename and clear the old nickname field.",
    },
    {
      title: "Paste & preview",
      text: "Paste your stylish name, check boxes or cut-off text, then confirm.",
    },
  ],
  ideasHeading: "Quick name ideas",
  articleHtml: PUBG_MOBILE_LITE_NAME_ARTICLE_HTML,
  faqs: PUBG_MOBILE_LITE_NAME_FAQS.map((f) => ({ ...f })),
  faqTitle: "PUBG Mobile Lite Stylish Name FAQ",
  commentsLead:
    "Share a style that worked on your phone, or ask about Lite rename. Comments appear after admin approval — never post passwords or OTPs.",
  emptyStudioText: "Type a name to see stylish PUBG Mobile Lite IDs.",
};

export function clonePubgMobileLiteNamePage(
  page: PubgMobileLiteNamePageContent = DEFAULT_PUBG_MOBILE_LITE_NAME_PAGE,
): PubgMobileLiteNamePageContent {
  return {
    ...page,
    seoKeywords: [...page.seoKeywords],
    steps: page.steps.map((s) => ({ ...s })),
    faqs: page.faqs.map((f) => ({ ...f })),
  };
}
