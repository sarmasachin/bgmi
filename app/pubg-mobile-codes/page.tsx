import type { Metadata } from "next";
import { ClientErrorBoundary } from "@/src/components/ClientErrorBoundary";
import { HomeHeader } from "@/src/components/HomeHeader";
import { PubgMobileCodesArticle } from "@/src/components/PubgMobileCodesArticle";
import { PubgMobileCodesPanel } from "@/src/components/PubgMobileCodesPanel";
import { SiteFooter } from "@/src/components/SiteFooter";
import { TestimonialForm } from "@/src/components/TestimonialForm";
import { TestimonialsMarquee } from "@/src/components/TestimonialsMarquee";
import {
  PUBG_MOBILE_CODES_PAGE_TITLE,
  PUBG_MOBILE_CODES_PATH,
  pubgMobileCodesDateModifiedIso,
  pubgMobileCodesUpdatedLabel,
} from "@/src/lib/pubgMobileCodes";
import { faqSchema, toolAppReviewSchema } from "@/src/lib/schema";
import { getSiteUrl, toCanonicalUrl } from "@/src/lib/siteUrl";
import { buildSocialMetadata } from "@/src/lib/socialMeta";
import { getCalculatorPhoneModels } from "@/src/server/repositories/calculatorPhoneModelsRepository";
import { getGameFaqItems } from "@/src/server/repositories/homeFaqRepository";
import { getSettings } from "@/src/server/repositories/settingsRepository";
import { listApprovedTestimonials } from "@/src/server/repositories/testimonialsRepository";

const description =
  "PUBG Mobile Sensitivity Settings Code — calculate sensitivity, copy codes for Android, and view camera / ADS settings for your device.";
const canonical = toCanonicalUrl(PUBG_MOBILE_CODES_PATH);
const pageTitle = PUBG_MOBILE_CODES_PAGE_TITLE;

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: pageTitle,
  description,
  alternates: { canonical },
  ...buildSocialMetadata({
    title: pageTitle,
    description,
    url: canonical,
  }),
};

export default async function PubgMobileCodesPage() {
  const updatedLabel = pubgMobileCodesUpdatedLabel();
  const [settings, phoneModels, testimonials, faqItems] = await Promise.all([
    getSettings(),
    getCalculatorPhoneModels(),
    listApprovedTestimonials({ game: "pubg" }),
    getGameFaqItems("pubg"),
  ]);

  const faqLd = faqSchema(faqItems);
  const toolLd = toolAppReviewSchema({
    baseUrl: getSiteUrl(),
    name: pageTitle,
    description,
    url: canonical,
    dateModified: pubgMobileCodesDateModifiedIso(),
    reviews: testimonials.map((t) => ({
      name: t.name,
      rating: t.rating,
      message: t.message,
    })),
  });

  return (
    <div>
      <HomeHeader siteTitle={settings.homeDisplay.headerTitle} navigation={settings.navigation} />
      <main className="page-container">
        <h1 className="main-title">{pageTitle}</h1>
        <p className="pmc-updated">{updatedLabel}</p>
        <PubgMobileCodesPanel phoneModels={phoneModels} />
        <ClientErrorBoundary label="Reviews">
          <TestimonialsMarquee game="pubg" initialItems={testimonials} />
          <TestimonialForm game="pubg" />
        </ClientErrorBoundary>
      </main>
      <ClientErrorBoundary label="Guide">
        <PubgMobileCodesArticle faqItems={faqItems} />
      </ClientErrorBoundary>
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
