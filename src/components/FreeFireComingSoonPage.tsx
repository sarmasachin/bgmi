import { FaqAccordion } from "@/src/components/FaqAccordion";
import { FfComparisonTables } from "@/src/components/FfComparisonTables";
import { FfExploreCards } from "@/src/components/FfExploreCards";
import { FfNewsHub } from "@/src/components/FfNewsHub";
import { FfPatchStrip } from "@/src/components/FfPatchStrip";
import { FfProTips } from "@/src/components/FfProTips";
import { FfRoleTips } from "@/src/components/FfRoleTips";
import { FfSeasonBanner } from "@/src/components/FfSeasonBanner";
import { HomeHeader } from "@/src/components/HomeHeader";
import { SiteFooter } from "@/src/components/SiteFooter";
import { TestimonialForm } from "@/src/components/TestimonialForm";
import { TestimonialsMarquee } from "@/src/components/TestimonialsMarquee";
import { FfCalculator } from "@/src/features/ffCalculator/FfCalculator";
import "@/src/features/ffCalculator/ffCalculator.css";
import {
  freeFireConfig,
  type FreeFireVariant,
} from "@/src/lib/freeFirePages";
import { formatNewsPublishedAtIst } from "@/src/lib/formatNewsPublishedAt";
import { faqSchema, toolAppReviewSchema } from "@/src/lib/schema";
import { getSiteUrl, toCanonicalUrl } from "@/src/lib/siteUrl";
import { buildSocialMetadata } from "@/src/lib/socialMeta";
import {
  ensureFreeFireCmsPages,
  getPageBySlug,
  getPublishedPageBySlug,
} from "@/src/server/repositories/pagesRepository";
import { getGameFaqItems } from "@/src/server/repositories/homeFaqRepository";
import { getGameArticleHtml } from "@/src/server/repositories/gameArticlesRepository";
import { getFfPageCards } from "@/src/server/repositories/homeCardsRepository";
import { listPublishedNews } from "@/src/server/repositories/newsRepository";
import { getSettings } from "@/src/server/repositories/settingsRepository";
import { listApprovedTestimonials } from "@/src/server/repositories/testimonialsRepository";
import { isAdminLoggedIn } from "@/src/server/auth";
import type { Metadata } from "next";

export async function buildFreeFireMetadata(variant: FreeFireVariant): Promise<Metadata> {
  const cfg = freeFireConfig(variant);
  await ensureFreeFireCmsPages();
  const page =
    (await getPublishedPageBySlug(cfg.slug)) ??
    (await getPublishedPageBySlug(`/${cfg.slug}`));
  const maxCards =
    variant === "freefire-max" ? await getFfPageCards("freefire-max") : null;
  const fromCardsDescription = maxCards?.seo.description.trim() || "";
  const rawDescription =
    fromCardsDescription || page?.seoDescription?.trim() || cfg.seoDescription;
  // Never expose stale "coming soon" CMS copy once the calculator is live.
  const description = /coming soon|in development|update soon/i.test(rawDescription)
    ? fromCardsDescription || cfg.seoDescription
    : rawDescription;
  const title =
    maxCards?.hero.title.trim() || page?.seoTitle?.trim() || page?.title || cfg.title;
  const keywords =
    maxCards?.seo.keywords?.length ? maxCards.seo.keywords : undefined;
  const canonical = toCanonicalUrl(cfg.path);

  return {
    title,
    description,
    ...(keywords ? { keywords } : {}),
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
    alternates: { canonical },
    ...buildSocialMetadata({
      title,
      description,
      url: canonical,
      image: "/icon.png?v=3",
      imageAlt: "Sensitivity Settings calculator",
    }),
  };
}

export async function FreeFireComingSoonPage({ variant }: { variant: FreeFireVariant }) {
  const cfg = freeFireConfig(variant);
  await ensureFreeFireCmsPages();
  const faqGame = variant === "freefire-max" ? "freefire-max" : "freefire";
  const testimonialGame = variant === "freefire-max" ? "freefire-max" : "freefire";

  const articleGame = variant === "freefire-max" ? "freefire-max" : "freefire";
  const [settings, published, draft, faqItems, testimonials, homeNews, storedArticleHtml, maxCards] =
    await Promise.all([
      getSettings(),
      getPublishedPageBySlug(cfg.slug).then(
        (p) => p ?? getPublishedPageBySlug(`/${cfg.slug}`),
      ),
      isAdminLoggedIn().then(async (ok) => {
        if (!ok) return null;
        return (await getPageBySlug(cfg.slug)) ?? (await getPageBySlug(`/${cfg.slug}`));
      }),
      getGameFaqItems(faqGame),
      listApprovedTestimonials({ game: variant === "freefire-max" ? "freefire-max" : "freefire" }),
      variant === "freefire-max"
        ? listPublishedNews(1, 10)
        : Promise.resolve({ data: [] as Awaited<ReturnType<typeof listPublishedNews>>["data"], total: 0 }),
      getGameArticleHtml(articleGame),
      variant === "freefire-max" ? getFfPageCards("freefire-max") : Promise.resolve(null),
    ]);

  const newsItems = (homeNews.data ?? []).map((item) => {
    const rawDate = item.publishedAt ?? item.createdAt ?? null;
    const date = rawDate ? new Date(rawDate) : null;
    const excerpt = (item.excerpt ?? "").trim();
    return {
      id: item.id,
      slug: item.slug ?? item.id,
      title: item.title,
      excerpt: excerpt.length > 120 ? `${excerpt.slice(0, 117).trimEnd()}…` : excerpt,
      dateLabel: formatNewsPublishedAtIst(rawDate),
      dateIso: date && !Number.isNaN(date.getTime()) ? date.toISOString().slice(0, 10) : "",
    };
  });

  const page = published ?? (draft?.status === "draft" ? null : draft);
  // Article body: Game Articles only (then built-in default). Page clones hold SEO shell.
  const html = storedArticleHtml ?? cfg.defaultArticleHtml;
  const title =
    (maxCards?.hero.title.trim() || page?.title?.trim() || cfg.title);
  const description = page?.seoDescription?.trim() || cfg.seoDescription;
  const faqLd = faqSchema(faqItems);
  const toolLd = toolAppReviewSchema({
    baseUrl: getSiteUrl(),
    name: title,
    description,
    url: toCanonicalUrl(cfg.path),
    reviews: testimonials.map((t) => ({
      name: t.name,
      rating: t.rating,
      message: t.message,
    })),
  });

  return (
    <div>
      <HomeHeader siteTitle={settings.homeDisplay.headerTitle} navigation={settings.navigation} />
      <h1 className="main-title ff-gradient-title">{title}</h1>
      <main className="page-container">
        {variant === "freefire-max" && maxCards ? <FfPatchStrip homeContent={maxCards.patchStrip} /> : null}
        <div id="ff-calculator" className="ff-calculator-anchor">
          <FfCalculator isMax={variant === "freefire-max"} trustBar={settings.ffTrustBar} />
        </div>
        <TestimonialsMarquee game={testimonialGame} initialItems={testimonials} />
        <TestimonialForm game={testimonialGame} />
        {variant === "freefire-max" && maxCards ? (
          <>
            <FfRoleTips homeContent={maxCards.roleTips} />
            <FfSeasonBanner homeContent={maxCards.season} />
            <FfProTips homeContent={maxCards.proTips} />
            <FfNewsHub items={newsItems} total={homeNews.total} />
            <FfComparisonTables homeContent={maxCards.comparison} />
            <FfExploreCards homeContent={maxCards.explore} />
          </>
        ) : null}
      </main>
      <div className="light-content-wrapper">
        <div className="content-inner">
          <div className="article">
            {html ? (
              <div dangerouslySetInnerHTML={{ __html: html }} />
            ) : (
              <p>Article content coming soon.</p>
            )}
          </div>

          {faqItems.length > 0 ? <FaqAccordion items={faqItems} /> : null}

        </div>
      </div>
      {faqLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      ) : null}
      {toolLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(toolLd) }}
        />
      ) : null}
      <SiteFooter settings={settings} />
    </div>
  );
}
