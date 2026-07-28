import { FaqAccordion } from "@/src/components/FaqAccordion";
import { DEFAULT_PUBG_MOBILE_CODES_ARTICLE_HTML } from "@/src/lib/pubgMobileCodesArticleDefault";
import type { HomeFaqItem } from "@/src/server/repositories/homeFaqRepository";

type Props = {
  faqItems: HomeFaqItem[];
  /** Custom HTML from admin. null/empty = built-in default guide. */
  articleHtml?: string | null;
};

/**
 * Unique guide for /pubg-mobile-codes only — not shared with /pubg article.
 */
export function PubgMobileCodesArticle({ faqItems, articleHtml }: Props) {
  const custom = typeof articleHtml === "string" ? articleHtml.trim() : "";
  const html = custom || DEFAULT_PUBG_MOBILE_CODES_ARTICLE_HTML;

  return (
    <div className="light-content-wrapper light-content--after-home-calculator">
      <div className="content-inner">
        <div className="article" lang="en" dangerouslySetInnerHTML={{ __html: html }} />
        {faqItems.length > 0 ? <FaqAccordion items={faqItems} /> : null}
      </div>
    </div>
  );
}
