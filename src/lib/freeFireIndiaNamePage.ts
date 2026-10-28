import { FREE_FIRE_INDIA_STYLISH_NAME_PATH } from "@/src/lib/gamePagePath";
import { toFreeFireIndiaText } from "@/src/lib/freeFireIndiaApkPage";
import {
  cloneFreeFireStylishNamePage,
  type FreeFireStylishNamePageContent,
} from "@/src/lib/freeFireStylishNamePage";

export const FREE_FIRE_INDIA_STYLISH_NAME_PAGE_KEY = "free-fire-india-stylish-name";
export const FREE_FIRE_INDIA_STYLISH_NAME_GUIDE_ID = "free-fire-india-stylish-name-guide";
export const FREE_FIRE_INDIA_STYLISH_NAME_SETTINGS_KEY = "settings:freeFireIndiaStylishName";
export { FREE_FIRE_INDIA_STYLISH_NAME_PATH };

/** Short FF name phrases on the stylish-name page, after the shared Free Fire India rename. */
function toIndiaNameText(input: string): string {
  return toFreeFireIndiaText(input)
    .replaceAll("#free-fire-stylish-name-guide", `#${FREE_FIRE_INDIA_STYLISH_NAME_GUIDE_ID}`)
    .replaceAll("FF stylish", "Free Fire India stylish")
    .replaceAll("FF name", "Free Fire India name")
    .replaceAll("FF ID", "Free Fire India ID");
}

/** Same Free Fire stylish-name page, with the public name set to Free Fire India. */
export function toFreeFireIndiaNamePage(
  page: FreeFireStylishNamePageContent,
): FreeFireStylishNamePageContent {
  return {
    ...page,
    path: FREE_FIRE_INDIA_STYLISH_NAME_PATH,
    seoTitle: toIndiaNameText(page.seoTitle),
    seoDescription: toIndiaNameText(page.seoDescription),
    seoKeywords: page.seoKeywords.map(toIndiaNameText),
    title: toIndiaNameText(page.title),
    subtitle: toIndiaNameText(page.subtitle),
    tipText: toIndiaNameText(page.tipText),
    stepsHeading: toIndiaNameText(page.stepsHeading),
    steps: page.steps.map((step) => ({
      title: toIndiaNameText(step.title),
      text: toIndiaNameText(step.text),
    })),
    ideasHeading: toIndiaNameText(page.ideasHeading),
    ideaGroups: (page.ideaGroups ?? []).map((group) => ({
      ...group,
      tab: toIndiaNameText(group.tab),
      items: group.items.map((item) => ({ ...item })),
    })),
    articleHtml: toIndiaNameText(page.articleHtml),
    faqs: page.faqs.map((item) => ({
      ...item,
      question: toIndiaNameText(item.question),
      answer: toIndiaNameText(item.answer),
    })),
    commentsLead: toIndiaNameText(page.commentsLead),
    faqTitle: toIndiaNameText(page.faqTitle),
    emptyStudioText: toIndiaNameText(page.emptyStudioText),
  };
}

/** Built-in India page. Nickname values are copied unchanged. Not a live Free Fire row. */
export const DEFAULT_FREE_FIRE_INDIA_STYLISH_NAME_PAGE: FreeFireStylishNamePageContent =
  toFreeFireIndiaNamePage(cloneFreeFireStylishNamePage());
