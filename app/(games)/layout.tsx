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
import { getGameFaqItems } from "@/src/server/repositories/homeFaqRepository";
import { getGameArticleHtml } from "@/src/server/repositories/gameArticlesRepository";
import { getSettings, type SiteSettings } from "@/src/server/repositories/settingsRepository";
import { listApprovedTestimonials } from "@/src/server/repositories/testimonialsRepository";

/** Always read fresh phone models / ads from DB (admin list can change anytime). */
export const dynamic = "force-dynamic";

/**
 * Shared chrome for BGMI (/) and PUBG (/pubg).
 * Hero title comes from {children} (per-page RSC) so LCP is not blocked by calculator data.
 *
 * Calculator loads first (outer Suspense). Article streams in a nested Suspense BELOW the tool
 * so it cannot paint above the calculator — without waiting on article/FAQ before showing the tool.
 * Calculator feature code is not touched here.
 */
export default async function GamesLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  return (
    <div>
      <ClientErrorBoundary label="Header">
        <HomeHeader siteTitle={settings.homeDisplay.headerTitle} navigation={settings.navigation} />
      </ClientErrorBoundary>
      {children}
      <Suspense fallback={<div className="games-main-fallback" aria-hidden />}>
        <GamesCalculatorChrome settings={settings} />
      </Suspense>
    </div>
  );
}

/** Fast path: only data needed to show the calculator + reviews. */
async function GamesCalculatorChrome({ settings }: { settings: SiteSettings }) {
  const [adPlaces, phoneModels, bgmiTestimonials, pubgTestimonials] = await Promise.all([
    getAdPlacementVisibility(),
    getCalculatorPhoneModels(),
    listApprovedTestimonials({ game: "bgmi" }),
    listApprovedTestimonials({ game: "pubg" }),
  ]);

  return (
    <>
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
      </main>
      {/* Nested: article can only appear after calculator is already in the tree (DOM order fixed). */}
      <Suspense fallback={null}>
        <GamesArticleChrome />
      </Suspense>
      <SiteFooter settings={settings} />
    </>
  );
}

async function GamesArticleChrome() {
  const [bgmiFaqItems, pubgFaqItems, bgmiArticleHtml, pubgArticleHtml] = await Promise.all([
    getGameFaqItems("bgmi"),
    getGameFaqItems("pubg"),
    getGameArticleHtml("bgmi"),
    getGameArticleHtml("pubg"),
  ]);
  const faqLd = faqSchema(bgmiFaqItems);

  return (
    <>
      {faqLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      ) : null}
      <ClientErrorBoundary label="Guide">
        <GameArticleFaq
          bgmiFaqItems={bgmiFaqItems}
          pubgFaqItems={pubgFaqItems}
          bgmiArticleHtml={bgmiArticleHtml}
          pubgArticleHtml={pubgArticleHtml}
        />
      </ClientErrorBoundary>
    </>
  );
}
