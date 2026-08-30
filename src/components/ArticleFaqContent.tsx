import { FaqAccordion } from "@/src/components/FaqAccordion";
import { DEFAULT_BGMI_ARTICLE_HTML } from "@/src/lib/bgmiArticleDefault";
import { DEFAULT_BGMI_LITE_ARTICLE_HTML } from "@/src/lib/bgmiLiteArticleDefault";
import { DEFAULT_PUBG_ARTICLE_HTML } from "@/src/lib/pubgArticleDefault";
import { DEFAULT_PUBG_MOBILE_LITE_ARTICLE_HTML } from "@/src/lib/pubgMobileLiteArticleDefault";

type HomeFaqItem = {
  id: string;
  question: string;
  answer: string;
};

type ArticleGame = "bgmi" | "bgmi-lite" | "pubg" | "pubg-mobile-lite";

type Props = {
  wrapperClassName?: string;
  faqItems: HomeFaqItem[];
  game?: ArticleGame;
  /** Custom CMS HTML. Empty / missing → built-in default guide. */
  articleHtml?: string | null;
};

function defaultHtmlForGame(game: ArticleGame): string {
  if (game === "pubg") return DEFAULT_PUBG_ARTICLE_HTML;
  if (game === "pubg-mobile-lite") return DEFAULT_PUBG_MOBILE_LITE_ARTICLE_HTML;
  if (game === "bgmi-lite") return DEFAULT_BGMI_LITE_ARTICLE_HTML;
  return DEFAULT_BGMI_ARTICLE_HTML;
}

function isMeaningfulArticleHtml(html: string): boolean {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length >= 40;
}

/** Sync FAQ/article block — safe for client wrappers. */
export function ArticleFaqContent({
  wrapperClassName,
  faqItems,
  game = "bgmi",
  articleHtml = null,
}: Props) {
  const wrapClass = ["light-content-wrapper", wrapperClassName].filter(Boolean).join(" ");
  const custom = typeof articleHtml === "string" ? articleHtml.trim() : "";
  const html =
    custom && isMeaningfulArticleHtml(custom) ? custom : defaultHtmlForGame(game);

  return (
    <div className={wrapClass}>
      <div className="content-inner">
        <div className="article" lang="en" dangerouslySetInnerHTML={{ __html: html }} />
        {faqItems.length > 0 ? <FaqAccordion items={faqItems} /> : null}
      </div>
    </div>
  );
}
