import { FREE_FIRE_MAX_STYLISH_NAME_PATH } from "@/src/lib/freeFireMaxPages";
import {
  FREE_FIRE_MAX_STYLISH_NAME_ARTICLE_HTML,
  FREE_FIRE_MAX_STYLISH_NAME_FAQS,
} from "@/src/lib/freeFireMaxStylishNameContent";
import {
  cloneFreeFireStylishIdeaGroups,
  DEFAULT_FREE_FIRE_STYLISH_IDEA_GROUPS,
} from "@/src/lib/freeFireStylishNameIdeasDefaults";
import {
  cloneFreeFireStylishNamePage,
  type FreeFireStylishNamePageContent,
} from "@/src/lib/freeFireStylishNamePage";

export const FREE_FIRE_MAX_STYLISH_NAME_PAGE_KEY = "free-fire-max-stylish-name";
export const FREE_FIRE_MAX_STYLISH_NAME_SETTING_KEY = "settings:freeFireMaxStylishName";

export { FREE_FIRE_MAX_STYLISH_NAME_PATH };
export type { FreeFireStylishNamePageContent };

/** Built-in Free Fire Max stylish-name page (separate CMS from classic Free Fire). */
export const DEFAULT_FREE_FIRE_MAX_STYLISH_NAME_PAGE: FreeFireStylishNamePageContent = {
  path: FREE_FIRE_MAX_STYLISH_NAME_PATH,
  seoTitle: "Free Fire Max Stylish Name Generator",
  seoDescription:
    "Create readable Free Fire Max stylish names on mobile — fonts, light symbols, live length guide, and one-tap copy. Fan-made tool; preview inside the official Garena Free Fire Max client.",
  seoKeywords: [
    "Free Fire Max stylish name",
    "FF Max name generator",
    "Free Fire Max nick name",
    "FF Max stylish ID",
    "Free Fire Max rename",
  ],
  title: "Free Fire Max Stylish Name",
  subtitle:
    "Type your name once. Pick a clean style. Copy and paste into Free Fire Max — built for thumbs on mobile.",
  tipText:
    "Preview in Notes or Free Fire Max rename before spending a Rename Card. Fancy letters also count toward the limit.",
  stepsHeading: "Apply it in Free Fire Max",
  steps: [
    {
      title: "Copy a style",
      text: "Use the studio above and tap Copy on the name you like.",
    },
    {
      title: "Open Free Fire Max rename",
      text: "In Free Fire Max, open profile / rename and clear the old nickname field.",
    },
    {
      title: "Paste & preview",
      text: "Paste your stylish name, check boxes or cut-off text, then confirm.",
    },
  ],
  ideasHeading: "Quick FF Max name ideas",
  ideaGroups: cloneFreeFireStylishIdeaGroups(),
  articleHtml: FREE_FIRE_MAX_STYLISH_NAME_ARTICLE_HTML,
  faqs: FREE_FIRE_MAX_STYLISH_NAME_FAQS.map((f) => ({ ...f })),
  faqTitle: "Free Fire Max Stylish Name FAQ",
  commentsLead:
    "Share a style that worked on your phone, or ask about Free Fire Max rename. Comments appear after admin approval — never post passwords or OTPs.",
  emptyStudioText: "Type a name to see stylish Free Fire Max IDs.",
};

export function cloneFreeFireMaxStylishNamePage(
  page: FreeFireStylishNamePageContent = DEFAULT_FREE_FIRE_MAX_STYLISH_NAME_PAGE,
): FreeFireStylishNamePageContent {
  return cloneFreeFireStylishNamePage({
    ...page,
    ideaGroups: cloneFreeFireStylishIdeaGroups(
      page.ideaGroups?.length ? page.ideaGroups : DEFAULT_FREE_FIRE_STYLISH_IDEA_GROUPS,
    ),
  });
}
