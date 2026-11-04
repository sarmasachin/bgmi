import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, DM_Sans } from "next/font/google";
import { FaqAccordion } from "@/src/components/FaqAccordion";
import { Gta6Calculator } from "@/src/features/gta6Calculator/Gta6Calculator";
import { Gta6Header } from "@/src/features/gta6Calculator/Gta6Header";
import { Gta6DetailsSections } from "@/src/features/gta6Calculator/Gta6DetailsSections";
import { GTA6_FAQ } from "@/src/features/gta6Calculator/gta6-faq";
import {
  GTA6_PAGE_DESCRIPTION,
  GTA6_PAGE_TITLE,
  GTA6_PATH,
  gta6BreadcrumbItems,
  gta6Keywords,
  gta6StructuredData,
} from "@/src/features/gta6Calculator/gta6-seo";
import "@/src/features/gta6Calculator/gta6Calculator.css";
import "@/src/features/gta6Calculator/gta6-details.css";
import "@/src/features/gta6Calculator/gta6-map.css";
import { SiteFooter } from "@/src/components/SiteFooter";
import { breadcrumbListSchema, faqSchema, webPageSchema } from "@/src/lib/schema";
import { buildSocialMetadata } from "@/src/lib/socialMeta";
import { toCanonicalUrl } from "@/src/lib/siteUrl";

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
const canonical = toCanonicalUrl(PATH);
const keywords = gta6Keywords();

export const viewport: Viewport = {
  themeColor: "#0b0b10",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  title: { absolute: GTA6_PAGE_TITLE },
  description: GTA6_PAGE_DESCRIPTION,
  keywords: [...keywords],
  alternates: { canonical },
  robots: { index: true, follow: true },
  ...buildSocialMetadata({
    title: GTA6_PAGE_TITLE,
    description: GTA6_PAGE_DESCRIPTION,
    url: canonical,
  }),
};

const faqLd = faqSchema(GTA6_FAQ.map((item) => ({ question: item.question, answer: item.answer })));
const breadcrumbLd = breadcrumbListSchema(gta6BreadcrumbItems());
const webPageLd = webPageSchema({
  name: GTA6_PAGE_TITLE,
  description: GTA6_PAGE_DESCRIPTION,
  url: canonical,
  keywords,
  mainEntityId: `${canonical}#calculator`,
});
const extraLd = gta6StructuredData(canonical);

export default function Gta6SensitivityPage() {
  const jsonLd = [webPageLd, breadcrumbLd, faqLd, ...extraLd].filter(Boolean);

  return (
    <>
      <div className={`gta6-root ${display.variable} ${body.variable}`}>
        <Gta6Header path={PATH} />

        <main id="top">
          <section className="gta6-hero" aria-labelledby="gta6-hero-title">
            <div className="gta6-wrap gta6-hero-grid">
              <div className="gta6-hero-copy">
                <p className="gta6-eyebrow">Coming November 19, 2026 · PS5 & Xbox Series</p>
                <h1 id="gta6-hero-title">Sensitivity Settings</h1>
                <p className="gta6-lead">
                  Free controller calculator for Grand Theft Auto VI — look, aim, deadzone,
                  acceleration, and DualSense options before launch day.
                </p>
                <p className="gta6-banner">
                  Menu names follow the usual controller pattern until Rockstar shows the real
                  settings screen. Values are a starting range, not an official preset.
                </p>
                <div className="gta6-hero-actions">
                  <a className="primary" href="#calculator">
                    Open calculator
                  </a>
                  <a className="ghost" href="#specs">
                    View specs
                  </a>
                </div>
              </div>
              <div className="gta6-hero-media">
                <img
                  src="/gta6/news-city.jpg"
                  alt="Vice City style night skyline for Grand Theft Auto VI"
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
            <h2 id="gta6-calc-title">GTA 6 sensitivity calculator</h2>
            <Gta6Calculator />
          </section>

          <Gta6DetailsSections />

          <section className="gta6-band gta6-news" id="news" aria-labelledby="gta6-news-title">
            <h2 id="gta6-news-title">News</h2>
            <div className="gta6-news-grid">
              <article className="gta6-card">
                <img className="gta6-card-image" src="/gta6/news-launch.jpg" alt="" />
                <div className="gta6-card-copy">
                  <h3>November 19, 2026</h3>
                  <p>
                    Launch day on PlayStation 5 and Xbox Series X|S. Preload begins November 12,
                    2026.
                  </p>
                </div>
              </article>
              <article className="gta6-card">
                <img className="gta6-card-image" src="/gta6/news-city.jpg" alt="" />
                <div className="gta6-card-copy">
                  <h3>Vice City, Leonida</h3>
                  <p>Single-player at launch. Jason and Lucia. Settings menu not public yet.</p>
                </div>
              </article>
              <article className="gta6-card">
                <img className="gta6-card-image" src="/gta6/news-ps5.jpg" alt="" />
                <div className="gta6-card-copy">
                  <h3>Plays best on PS5</h3>
                  <p>Haptic feedback, adaptive triggers, and controller speaker called out by Sony.</p>
                </div>
              </article>
            </div>
          </section>

          <section className="gta6-band gta6-faq" id="faq" aria-label="Frequently Asked Questions">
            <div className="gta6-faq-panel">
              <FaqAccordion
                title="Frequently Asked Questions"
                items={GTA6_FAQ.map((item, index) => ({
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
