import { FREE_FIRE_INDIA_APK_PATH } from "@/src/lib/gamePagePath";
import { DEFAULT_FREE_FIRE_APK_PAGE, type FreeFireApkPageContent } from "@/src/lib/freeFireApkPage";

export const FREE_FIRE_INDIA_APK_PAGE_KEY = "free-fire-india-apk";
export const FREE_FIRE_INDIA_APK_GUIDE_ID = "free-fire-india-apk-guide";
export const FREE_FIRE_INDIA_PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.garena.game.ffi&hl=en_IN";
export { FREE_FIRE_INDIA_APK_PATH };

/** Keep Free Fire MAX as its own game, then rename this page's game name to Free Fire India. */
export function toFreeFireIndiaText(input: string): string {
  return input
    .replaceAll("Free Fire MAX", "\uE000")
    .replaceAll("Free Fire Max", "\uE001")
    .replaceAll("FF MAX", "\uE002")
    .replaceAll("FF Max", "\uE003")
    .replaceAll("Free Fire", "Free Fire India")
    .replaceAll("FF MOD APK", "Free Fire India MOD APK")
    .replaceAll("FF APK", "Free Fire India APK")
    .replaceAll("FF Apk", "Free Fire India APK")
    .replaceAll("FF apk", "Free Fire India APK")
    .replaceAll("\uE000", "Free Fire MAX")
    .replaceAll("\uE001", "Free Fire Max")
    .replaceAll("\uE002", "FF MAX")
    .replaceAll("\uE003", "FF Max");
}

function toIndiaGuideHref(href: string): string {
  return href.replaceAll("#free-fire-apk-guide", `#${FREE_FIRE_INDIA_APK_GUIDE_ID}`);
}

/** Same Free Fire APK page content, with the public name set to Free Fire India. */
export function toFreeFireIndiaApkPage(page: FreeFireApkPageContent): FreeFireApkPageContent {
  return {
    ...page,
    path: FREE_FIRE_INDIA_APK_PATH,
    seoTitle: toFreeFireIndiaText(page.seoTitle),
    seoDescription: toFreeFireIndiaText(page.seoDescription),
    seoKeywords: page.seoKeywords.map(toFreeFireIndiaText),
    heroTitle: toFreeFireIndiaText(page.heroTitle),
    subtitleEn: toFreeFireIndiaText(page.subtitleEn),
    pills: page.pills.map((pill) => ({ label: toFreeFireIndiaText(pill.label) })),
    heroButtons: {
      playStore: {
        ...page.heroButtons.playStore,
        label: toFreeFireIndiaText(page.heroButtons.playStore.label),
        href: toIndiaGuideHref(page.heroButtons.playStore.href),
      },
      apk: {
        ...page.heroButtons.apk,
        label: toFreeFireIndiaText(page.heroButtons.apk.label),
        href: toIndiaGuideHref(page.heroButtons.apk.href),
      },
    },
    countdown: {
      ...page.countdown,
      label: toFreeFireIndiaText(page.countdown.label),
      dateText: toFreeFireIndiaText(page.countdown.dateText),
      liveMessage: toFreeFireIndiaText(page.countdown.liveMessage),
    },
    heroImageAlt: toFreeFireIndiaText(page.heroImageAlt),
    cards: page.cards.map((card) => ({
      ...card,
      title: toFreeFireIndiaText(card.title),
      summary: toFreeFireIndiaText(card.summary),
      points: card.points.map(toFreeFireIndiaText),
      ctaLabel: card.ctaLabel ? toFreeFireIndiaText(card.ctaLabel) : card.ctaLabel,
      ctaHref: card.ctaHref ? toIndiaGuideHref(card.ctaHref) : card.ctaHref,
    })),
    preRegister: {
      ...page.preRegister,
      title: toFreeFireIndiaText(page.preRegister.title),
      intro: toFreeFireIndiaText(page.preRegister.intro),
      steps: page.preRegister.steps.map(toFreeFireIndiaText),
      guideHref: toIndiaGuideHref(page.preRegister.guideHref),
      guideLabel: toFreeFireIndiaText(page.preRegister.guideLabel),
    },
    facts: {
      ...page.facts,
      title: toFreeFireIndiaText(page.facts.title),
      rows: page.facts.rows.map((row) => ({
        label: toFreeFireIndiaText(row.label),
        value: toFreeFireIndiaText(row.value),
      })),
      note: toFreeFireIndiaText(page.facts.note),
    },
    articleHtml: toIndiaGuideHref(toFreeFireIndiaText(page.articleHtml)),
    faqs: page.faqs.map((item) => ({
      ...item,
      question: toFreeFireIndiaText(item.question),
      answer: toFreeFireIndiaText(item.answer),
    })),
    faqTitle: toFreeFireIndiaText(page.faqTitle),
    commentsLead: toFreeFireIndiaText(page.commentsLead),
  };
}

/** Built-in India page. Not a live copy of the saved Free Fire APK row. */
export const DEFAULT_FREE_FIRE_INDIA_APK_PAGE: FreeFireApkPageContent = (() => {
  const page = toFreeFireIndiaApkPage(DEFAULT_FREE_FIRE_APK_PAGE);
  return {
    ...page,
    heroButtons: {
      ...page.heroButtons,
      playStore: {
        ...page.heroButtons.playStore,
        href: FREE_FIRE_INDIA_PLAY_STORE_URL,
      },
    },
  };
})();
