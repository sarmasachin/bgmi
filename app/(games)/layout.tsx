import { AdSlot } from "@/src/components/AdSlot";
import { ClientErrorBoundary } from "@/src/components/ClientErrorBoundary";
import { GameArticleFaq } from "@/src/components/GameArticleFaq";
import { GameHeroTitle } from "@/src/components/GameHeroTitle";
import { GameTestimonialsSection } from "@/src/components/GameTestimonialsSection";
import { HomeHeader } from "@/src/components/HomeHeader";
import { SensCalculatorHost } from "@/src/components/SensCalculatorHost";
import { SiteFooter } from "@/src/components/SiteFooter";
import { getAdPlacementVisibility } from "@/src/server/repositories/adPlacementRepository";
import { getCalculatorPhoneModels } from "@/src/server/repositories/calculatorPhoneModelsRepository";
import { getHomeFaqItems } from "@/src/server/repositories/homeFaqRepository";
import { getSettings } from "@/src/server/repositories/settingsRepository";
import { listApprovedTestimonials } from "@/src/server/repositories/testimonialsRepository";

/**
 * Shared chrome for BGMI (/) and PUBG (/pubg).
 * Layout stays mounted on game switch so the calculator updates instantly.
 */
export default async function GamesLayout({ children }: { children: React.ReactNode }) {
  const [adPlaces, settings, phoneModels, faqItems, bgmiTestimonials, pubgTestimonials] =
    await Promise.all([
      getAdPlacementVisibility(),
      getSettings(),
      getCalculatorPhoneModels(),
      getHomeFaqItems(),
      listApprovedTestimonials({ game: "bgmi" }),
      listApprovedTestimonials({ game: "pubg" }),
    ]);

  return (
    <div>
      <HomeHeader siteTitle={settings.homeDisplay.headerTitle} navigation={settings.navigation} />
      <GameHeroTitle bgmiTitle={settings.homeDisplay.heroTitle} />
      <main className="page-container">
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
        {children}
      </main>
      <ClientErrorBoundary label="Guide">
        <GameArticleFaq faqItems={faqItems} />
      </ClientErrorBoundary>
      <SiteFooter settings={settings} />
    </div>
  );
}
