import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, DM_Sans } from "next/font/google";
import { FaqAccordion } from "@/src/components/FaqAccordion";
import { HomeHeader } from "@/src/components/HomeHeader";
import { SiteFooter } from "@/src/components/SiteFooter";
import { Gta6Calculator } from "@/src/features/gta6Calculator/Gta6Calculator";
import { Gta6DetailsSections } from "@/src/features/gta6Calculator/Gta6DetailsSections";
import { Gta6Header } from "@/src/features/gta6Calculator/Gta6Header";
import {
  GTA6_PATH,
  gta6BreadcrumbItems,
  gta6StructuredData,
} from "@/src/features/gta6Calculator/gta6-seo";
import "@/src/features/gta6Calculator/gta6Calculator.css";
import "@/src/features/gta6Calculator/gta6-details.css";
import "@/src/features/gta6Calculator/gta6-map.css";
import { breadcrumbListSchema, faqSchema, webPageSchema } from "@/src/lib/schema";
import { buildSocialMetadata } from "@/src/lib/socialMeta";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import { getGta6Page } from "@/src/server/repositories/gta6PageRepository";
import { getSettings } from "@/src/server/repositories/settingsRepository";

const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
  variable: "--gta6-display",
});

const body = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--gta6-body",
});

const PATH = GTA6_PATH;

export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  themeColor: "#0b0b10",
  colorScheme: "dark",
};

export async function generateMetadata(): Promise<Metadata> {
  const page = await getGta6Page();
  const canonical = toCanonicalUrl(PATH);
  return {
    title: { absolute: page.home.seoTitle },
    description: page.home.seoDescription,
    keywords: page.home.keywords,
    alternates: { canonical },
    robots: { index: true, follow: true },
    ...buildSocialMetadata({
      title: page.home.seoTitle,
      description: page.home.seoDescription,
      url: canonical,
    }),
  };
}

export default async function Gta6SensitivityPage() {
  const settings = await getSettings();
  const page = await getGta6Page();
  const canonical = toCanonicalUrl(PATH);
  const jsonLd = [
    webPageSchema({
      name: page.home.seoTitle,
      description: page.home.seoDescription,
      url: canonical,
      keywords: page.home.keywords,
      mainEntityId: `${canonical}#calculator`,
    }),
    breadcrumbListSchema(gta6BreadcrumbItems()),
    faqSchema(page.faq.map((item) => ({ question: item.question, answer: item.answer }))),
    ...gta6StructuredData(canonical),
  ].filter(Boolean);

  return (
    <>
      <HomeHeader
        siteTitle={settings.homeDisplay.headerTitle}
        navigation={settings.navigation}
        chipNav={<Gta6Header path={PATH} />}
      />
      <div className={`gta6-root ${display.variable} ${body.variable}`}>
        <main id="top">
          <section className="gta6-hero" aria-labelledby="gta6-hero-title">
            <div className="gta6-wrap gta6-hero-grid">
              <div className="gta6-hero-copy">
                <p className="gta6-eyebrow">{page.home.eyebrow}</p>
                <h1 id="gta6-hero-title">{page.home.title}</h1>
                <p className="gta6-lead">{page.home.lead}</p>
                <p className="gta6-banner">{page.home.banner}</p>
                <div className="gta6-hero-actions">
                  <a className="primary" href="#calculator">
                    {page.home.primaryLabel}
                  </a>
                  <a className="ghost" href="#specs">
                    {page.home.secondaryLabel}
                  </a>
                </div>
              </div>
              <div className="gta6-hero-media">
                <img
                  src={page.home.imageSrc}
                  alt={page.home.imageAlt}
                  width={720}
                  height={480}
                />
              </div>
            </div>
          </section>

          <section
            id="calculator"
            className="gta6-band gta6-band-calc"
            aria-labelledby="gta6-calc-title"
          >
            <h2 id="gta6-calc-title">{page.home.calculatorTitle}</h2>
            <Gta6Calculator />
          </section>

          <Gta6DetailsSections page={page} />

          <section className="gta6-band gta6-faq" id="faq" aria-label="Frequently Asked Questions">
            <div className="gta6-faq-panel">
              <FaqAccordion
                title="Frequently Asked Questions"
                items={page.faq.map((item, index) => ({
                  id: `gta6-faq-${index + 1}`,
                  question: item.question,
                  answer: item.answer,
                }))}
              />
            </div>
          </section>
        </main>

        {jsonLd.map((block, i) => (
          <script
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
          />
        ))}
      </div>
      <SiteFooter bottomOnly />
    </>
  );
}
