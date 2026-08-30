import { FREE_FIRE_STYLISH_NAME_PATH } from "@/src/lib/freeFirePages";
import {
  FREE_FIRE_STYLISH_NAME_ARTICLE_HTML,
  FREE_FIRE_STYLISH_NAME_FAQS,
} from "@/src/lib/freeFireStylishNameContent";
import {
  cloneFreeFireStylishIdeaGroups,
  DEFAULT_FREE_FIRE_STYLISH_IDEA_GROUPS,
  type FreeFireStylishNameIdeaGroup,
} from "@/src/lib/freeFireStylishNameIdeasDefaults";

export const FREE_FIRE_STYLISH_NAME_PAGE_KEY = "free-fire-stylish-name";

export { FREE_FIRE_STYLISH_NAME_PATH };
export type { FreeFireStylishNameIdeaGroup, FreeFireStylishNameIdeaItem } from "@/src/lib/freeFireStylishNameIdeasDefaults";

export type FreeFireStylishNamePageContent = {
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
  /** Ready-name chips (tabs + copyable values) — CMS editable. */
  ideaGroups: FreeFireStylishNameIdeaGroup[];
  articleHtml: string;
  faqs: Array<{ id: string; question: string; answer: string }>;
  commentsLead: string;
  faqTitle: string;
  emptyStudioText: string;
};

export const DEFAULT_FREE_FIRE_STYLISH_NAME_PAGE: FreeFireStylishNamePageContent = {
  path: FREE_FIRE_STYLISH_NAME_PATH,
  seoTitle: "Free Fire Stylish Name Generator",
  seoDescription:
    "Create readable Free Fire stylish names on mobile — fonts, light symbols, live length guide, and one-tap copy. Fan-made tool; preview inside the official Garena client.",
  seoKeywords: [
    "Free Fire stylish name",
    "FF name generator",
    "Free Fire nick name",
    "FF stylish ID",
    "Free Fire rename",
  ],
  title: "Free Fire Stylish Name",
  subtitle:
    "Type your name once. Pick a clean style. Copy and paste into Free Fire — built for thumbs on mobile.",
  tipText:
    "Preview in Notes or Free Fire rename before spending a Rename Card. Fancy letters also count toward the limit.",
  stepsHeading: "Apply it in Free Fire",
  steps: [
    {
      title: "Copy a style",
      text: "Use the studio above and tap Copy on the name you like.",
    },
    {
      title: "Open Free Fire rename",
      text: "In Free Fire, open profile / rename and clear the old nickname field.",
    },
    {
      title: "Paste & preview",
      text: "Paste your stylish name, check boxes or cut-off text, then confirm.",
    },
  ],
  ideasHeading: "Quick name ideas",
  ideaGroups: cloneFreeFireStylishIdeaGroups(),
  articleHtml: FREE_FIRE_STYLISH_NAME_ARTICLE_HTML,
  faqs: FREE_FIRE_STYLISH_NAME_FAQS.map((f) => ({ ...f })),
  faqTitle: "Free Fire Stylish Name FAQ",
  commentsLead:
    "Share a style that worked on your phone, or ask about Free Fire rename. Comments appear after admin approval — never post passwords or OTPs.",
  emptyStudioText: "Type a name to see stylish Free Fire IDs.",
};

export function cloneFreeFireStylishNamePage(
  page: FreeFireStylishNamePageContent = DEFAULT_FREE_FIRE_STYLISH_NAME_PAGE,
): FreeFireStylishNamePageContent {
  return {
    ...page,
    seoKeywords: [...page.seoKeywords],
    steps: page.steps.map((s) => ({ ...s })),
    faqs: page.faqs.map((f) => ({ ...f })),
    ideaGroups: cloneFreeFireStylishIdeaGroups(
      page.ideaGroups?.length ? page.ideaGroups : DEFAULT_FREE_FIRE_STYLISH_IDEA_GROUPS,
    ),
  };
}
