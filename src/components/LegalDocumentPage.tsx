import { HomeHeader } from "@/src/components/HomeHeader";
import { SiteFooter } from "@/src/components/SiteFooter";
import {
  defaultSeoForSlug,
  defaultTitleForSlug,
  isCoreLegalSlug,
} from "@/src/lib/legalPages";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import { buildSocialMetadata } from "@/src/lib/socialMeta";
import {
  extractLegalHtml,
  getPublishedLegalPageBySlug,
} from "@/src/server/repositories/legalPagesRepository";
import { getSettings } from "@/src/server/repositories/settingsRepository";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = {
  slug: string;
  /** When true, missing published page shows a soft fallback instead of 404 (core routes). */
  softFallback?: boolean;
};

export async function buildLegalMetadata(slug: string): Promise<Metadata> {
  const item = await getPublishedLegalPageBySlug(slug);
  const defaults = defaultSeoForSlug(slug);
  const title = item?.seoTitle?.trim() || item?.title || defaults.seoTitle || defaultTitleForSlug(slug);
  const description =
    item?.seoDescription?.trim() ||
    defaults.seoDescription ||
    `${title} — Sensitivity Settings.`;
  const path = isCoreLegalSlug(slug) ? `/${slug}` : `/legal/${slug}`;
  const canonical = toCanonicalUrl(path);

  return {
    title,
    description,
    alternates: { canonical },
    ...buildSocialMetadata({ title, description, url: canonical }),
  };
}

export async function LegalDocumentPage({ slug, softFallback = false }: Props) {
  const item = await getPublishedLegalPageBySlug(slug);
  const settings = await getSettings();

  if (!item && !softFallback) {
    notFound();
  }

  const title =
    item?.title?.trim() ||
    defaultTitleForSlug(slug) ||
    "Legal";
  const html = item ? extractLegalHtml(item.content) : "";
  const fallbackHtml =
    softFallback && !html
      ? `<p>This page will show content once it is published from the admin Legal Pages section.</p>`
      : "";

  return (
    <div>
      <HomeHeader siteTitle={settings.homeDisplay.headerTitle} navigation={settings.navigation} />
      <main className="page-container" style={{ padding: "20px 0 40px" }}>
        <article className="news-detail-card legal-document-card">
          <h1>{title}</h1>
          {html || fallbackHtml ? (
            <div
              className="legal-document-body"
              dangerouslySetInnerHTML={{ __html: html || fallbackHtml }}
            />
          ) : (
            <p>No content yet.</p>
          )}
        </article>
      </main>
      <SiteFooter settings={settings} />
    </div>
  );
}
