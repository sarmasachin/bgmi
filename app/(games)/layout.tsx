import { Suspense } from "react";
import { AdSlot } from "@/src/components/AdSlot";
import { ClientErrorBoundary } from "@/src/components/ClientErrorBoundary";
import { GameArticleFaq } from "@/src/components/GameArticleFaq";
import { GameTestimonialsSection } from "@/src/components/GameTestimonialsSection";
import { HomeHeader } from "@/src/components/HomeHeader";
import { SensCalculatorHost } from "@/src/components/SensCalculatorHost";
import { SiteFooter } from "@/src/components/SiteFooter";
import { faqSchema } from "@/src/lib/schema";
import { getAdPlacementVisibility } from "@/src/server/repositories/adPlacementRepository";
import { getCalculatorPhoneModels } from "@/src/server/repositories/calculatorPhoneModelsRepository";
import { getHomeFaqItems } from "@/src/server/repositories/homeFaqRepository";
import { getSettings } from "@/src/server/repositories/settingsRepository";
import { listApprovedTestimonials } from "@/src/server/repositories/testimonialsRepository";

/**
 * Shared chrome for BGMI (/) and PUBG (/pubg).
 * Hero title comes from {children} (per-page RSC) so LCP is not blocked by calculator data.
 * Layout stays mounted on game switch so the calculator updates instantly.
 */
export default async function GamesLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  return (
    <div>
      <HomeHeader siteTitle={settings.homeDisplay.headerTitle} navigation={settings.navigation} />
      {children}
      <main className="page-container">
        <Suspense fallback={<div className="games-main-fallback" aria-hidden />}>
          <GamesMainChrome />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <GamesFaqChrome />
      </Suspense>
      <SiteFooter settings={settings} />
    </div>
  );
}

async function GamesMainChrome() {
  const [adPlaces, phoneModels, bgmiTestimonials, pubgTestimonials] = await Promise.all([
    getAdPlacementVisibility(),
    getCalculatorPhoneModels(),
    listApprovedTestimonials({ game: "bgmi" }),
    listApprovedTestimonials({ game: "pubg" }),
  ]);

  return (
    <>
      {adPlaces.home.home_above_calculator ? <AdSlot slotKey="home_above_calculator" /> : null}
      <ClientErrorBoundary label="Calculator">
        <SensCalculatorHost phoneModels={phoneModels} />
      </ClientErrorBoundary>
      {adPlaces.home.home_between_tool_and_article ? (
        <AdSlot slotKey="home_between_tool_and_article" />
      ) : null}
      <ClientErrorBoundary label="Reviews">
        <GameTestimonialsSection
          bgmiTestimonials={bgmiTestimonials}
          pubgTestimonials={pubgTestimonials}
        />
      </ClientErrorBoundary>
    </>
  );
}

async function GamesFaqChrome() {
  const faqItems = await getHomeFaqItems();
  const faqLd = faqSchema(faqItems);

  return (
    <>
      {faqLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      ) : null}
      <ClientErrorBoundary label="Guide">
        <GameArticleFaq faqItems={faqItems} />
      </ClientErrorBoundary>
    </>
  );
}
