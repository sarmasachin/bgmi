import { HomeHeader } from "@/src/components/HomeHeader";
import { SiteFooter } from "@/src/components/SiteFooter";
import { TestimonialForm } from "@/src/components/TestimonialForm";
import { TestimonialsMarquee } from "@/src/components/TestimonialsMarquee";
import { FfCalculator } from "@/src/features/ffCalculator/FfCalculator";
import {
  freeFireConfig,
  type FreeFireVariant,
} from "@/src/lib/freeFirePages";
import { faqSchema } from "@/src/lib/schema";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
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
import Link from "next/link";

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
  const title = page?.seoTitle?.trim() || page?.title || cfg.title;
  const description = page?.seoDescription?.trim() || cfg.seoDescription;
  const canonical = toCanonicalUrl(cfg.path);

  return {
    title,
    description,
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
  const isAdmin = Boolean(draft);
  const faqLd = faqSchema(faqItems);

  return (
    <div>
      <HomeHeader siteTitle={settings.homeDisplay.headerTitle} navigation={settings.navigation} />
      <h1 className="main-title ff-gradient-title">{title}</h1>
      <main className="page-container">
        <FfCalculator isMax={variant === "freefire-max"} />
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

          {faqItems.length > 0 ? (
            <div className="faq-section" lang="en">
              <h2>Frequently Asked Questions (FAQ)</h2>
              <div className="faq-grid">
                {faqItems.map((item) => (
                  <div key={item.id} className="faq-card">
                    <h3>{item.question}</h3>
                    <p>{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {isAdmin ? (
            <p className="ff-admin-edit-hint">
              Admin: article in <Link href="/admin/pages">Pages</Link> (slug: <code>{cfg.slug}</code>
              ). FAQs in <Link href="/admin/game-faqs">Game FAQs</Link>.
            </p>
          ) : null}
        </div>
      </div>
      {faqLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      ) : null}
      <SiteFooter settings={settings} />
    </div>
  );
}
