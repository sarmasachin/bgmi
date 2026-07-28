import { FaqAccordion } from "@/src/components/FaqAccordion";
import { DEFAULT_BGMI_ARTICLE_HTML } from "@/src/lib/bgmiArticleDefault";
import { DEFAULT_PUBG_ARTICLE_HTML } from "@/src/lib/pubgArticleDefault";

type HomeFaqItem = {
  id: string;
  question: string;
  answer: string;
};

type Props = {
  wrapperClassName?: string;
  faqItems: HomeFaqItem[];
  game?: "bgmi" | "pubg";
  /** Custom CMS HTML. Empty / missing → built-in default guide. */
  articleHtml?: string | null;
};

function defaultHtmlForGame(game: "bgmi" | "pubg"): string {
  return game === "pubg" ? DEFAULT_PUBG_ARTICLE_HTML : DEFAULT_BGMI_ARTICLE_HTML;
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
