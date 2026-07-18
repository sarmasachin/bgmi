import type { HomeFaqItem } from "@/src/server/repositories/homeFaqRepository";
import { getHomeFaqItems } from "@/src/server/repositories/homeFaqRepository";
import { ArticleFaqContent } from "@/src/components/ArticleFaqContent";

type ArticleFaqProps = {
  /** Extra class on outer wrapper (e.g. home page spacing after calculator). */
  wrapperClassName?: string;
  /** When provided (e.g. homepage), skips a duplicate getHomeFaqItems() round-trip. */
  faqItems?: HomeFaqItem[];
  /** Display text only. */
  game?: "bgmi" | "pubg";
};

export async function ArticleFaq({
  wrapperClassName,
  faqItems: faqItemsProp,
  game = "bgmi",
}: ArticleFaqProps = {}) {
  const faqItems = faqItemsProp ?? (await getHomeFaqItems());
  return (
    <ArticleFaqContent wrapperClassName={wrapperClassName} faqItems={faqItems} game={game} />
  );
}
