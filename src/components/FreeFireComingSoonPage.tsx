import { FaqAccordion } from "@/src/components/FaqAccordion";
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
import { faqSchema, toolAppReviewSchema } from "@/src/lib/schema";
import { getSiteUrl, toCanonicalUrl } from "@/src/lib/siteUrl";
import { buildSocialMetadata } from "@/src/lib/socialMeta";
import {
  ensureFreeFireCmsPages,
  getPageBySlug,
  getPublishedPageBySlug,
} from "@/src/server/repositories/pagesRepository";
import { getGameFaqItems } from "@/src/server/repositories/homeFaqRepository";
import { getSettings } from "@/src/server/repositories/settingsRepository";
import { listApprovedTestimonials } from "@/src/server/repositories/testimonialsRepository";
import { isAdminLoggedIn } from "@/src/server/auth";
import type { Metadata } from "next";

function extractHtml(content: unknown) {
  if (!content) return "";
  if (typeof content === "string") return content;
  if (typeof content === "object" && content && "html" in content) {
    const html = (content as { html?: unknown }).html;
    return typeof html === "string" ? html : "";
  }
  return "";
}

export async function buildFreeFireMetadata(variant: FreeFireVariant): Promise<Metadata> {
  const cfg = freeFireConfig(variant);
  await ensureFreeFireCmsPages();
  const page =
    (await getPublishedPageBySlug(cfg.slug)) ??
    (await getPublishedPageBySlug(`/${cfg.slug}`));
  const rawDescription = page?.seoDescription?.trim() || cfg.seoDescription;
  // Never expose stale "coming soon" CMS copy once the calculator is live.
  const description = /coming soon|in development|update soon/i.test(rawDescription)
    ? cfg.seoDescription
    : rawDescription;
  const title = page?.seoTitle?.trim() || page?.title || cfg.title;
  const canonical = toCanonicalUrl(cfg.path);

  return {
    title,
    description,
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
    alternates: { canonical },
    ...buildSocialMetadata({ title, description, url: canonical }),
  };
}

export async function FreeFireComingSoonPage({ variant }: { variant: FreeFireVariant }) {
  const cfg = freeFireConfig(variant);
  await ensureFreeFireCmsPages();
  const faqGame = variant === "freefire-max" ? "freefire-max" : "freefire";
  const testimonialGame = variant === "freefire-max" ? "freefire-max" : "freefire";

  const [settings, published, draft, faqItems, testimonials] = await Promise.all([
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
  ]);

  const page = published ?? (draft?.status === "draft" ? null : draft);
  // Code article is source of truth after deploy; CMS is only a fallback.
  const html = cfg.defaultArticleHtml || extractHtml(page?.content);
  const title = page?.title?.trim() || cfg.title;
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
        <FfCalculator isMax={variant === "freefire-max"} trustBar={settings.ffTrustBar} />
        <TestimonialsMarquee game={testimonialGame} initialItems={testimonials} />
        <TestimonialForm game={testimonialGame} />
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
