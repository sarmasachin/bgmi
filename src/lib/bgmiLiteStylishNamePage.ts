import { BGMI_LITE_STYLISH_NAME_PATH } from "@/src/lib/resolveNavForPath";
import {
  BGMI_LITE_STYLISH_ARTICLE_HTML,
  BGMI_LITE_STYLISH_FAQS,
} from "@/src/lib/bgmiLiteStylishNameContent";

export const BGMI_LITE_STYLISH_PAGE_KEY = "bgmi-lite-stylish-name";

export { BGMI_LITE_STYLISH_NAME_PATH };

export type BgmiLiteStylishNamePageContent = {
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
};

export const DEFAULT_BGMI_LITE_STYLISH_PAGE: BgmiLiteStylishNamePageContent = {
  path: BGMI_LITE_STYLISH_NAME_PATH,
  seoTitle: "BGMI Air Stylish Name Generator",
  seoDescription:
    "Create readable BGMI Air stylish names on mobile — fonts, light symbols, live length guide, and one-tap copy. Fan-made tool; preview inside the official client.",
  seoKeywords: [
    "BGMI Air stylish name",
    "BGMI Air name generator",
    "BGMI Air nick name",
    "BGMI Air stylish ID",
    "BGMI Air rename",
  ],
  title: "BGMI Air Stylish Name",
  subtitle:
    "Type your name once. Pick a clean style. Copy and paste into BGMI Air — built for thumbs on mobile.",
  tipText:
    "Preview in Notes or BGMI Air rename before spending a Rename Card. Fancy letters also count toward the limit.",
  stepsHeading: "Apply it in BGMI Air",
  steps: [
    {
      title: "Copy a style",
      text: "Use the studio above and tap Copy on the name you like.",
    },
    {
      title: "Open BGMI Air rename",
      text: "In BGMI Air, open profile / rename and clear the old nickname field.",
    },
    {
      title: "Paste & preview",
      text: "Paste your stylish name, check boxes or cut-off text, then confirm.",
    },
  ],
  ideasHeading: "Quick name ideas",
  articleHtml: BGMI_LITE_STYLISH_ARTICLE_HTML,
  faqs: BGMI_LITE_STYLISH_FAQS.map((f) => ({ ...f })),
  faqTitle: "BGMI Air Stylish Name FAQ",
  commentsLead:
    "Share a style that worked on your phone, or ask about BGMI Air rename. Comments appear after admin approval — never post passwords or OTPs.",
};

export function cloneBgmiLiteStylishPage(
  page: BgmiLiteStylishNamePageContent = DEFAULT_BGMI_LITE_STYLISH_PAGE,
): BgmiLiteStylishNamePageContent {
  return {
    ...page,
    seoKeywords: [...page.seoKeywords],
    steps: page.steps.map((s) => ({ ...s })),
    faqs: page.faqs.map((f) => ({ ...f })),
  };
}
