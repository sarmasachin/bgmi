import { AdSlot } from "@/src/components/AdSlot";
import { ClientErrorBoundary } from "@/src/components/ClientErrorBoundary";
import { GameArticleFaq } from "@/src/components/GameArticleFaq";
import { GamePathJsonLd } from "@/src/components/GamePathJsonLd";
import { GameTestimonialsSection } from "@/src/components/GameTestimonialsSection";
import { HomeHeader } from "@/src/components/HomeHeader";
import { HowItWorksSection } from "@/src/components/HowItWorksSection";
import { FfComparisonTables } from "@/src/components/FfComparisonTables";
import { FfExploreCards } from "@/src/components/FfExploreCards";
import { FfOfficialPatchStrip } from "@/src/components/FfOfficialPatchStrip";
import { FfPlayModeChips } from "@/src/components/FfPlayModeChips";
import { FfRoleTips } from "@/src/components/FfRoleTips";
import { FfSeasonBanner } from "@/src/components/FfSeasonBanner";
import { FfProTips } from "@/src/components/FfProTips";
import { FfNewsHub } from "@/src/components/FfNewsHub";
import { SensCalculatorHost } from "@/src/components/SensCalculatorHost";
import { SiteFooter } from "@/src/components/SiteFooter";
import { freeFireConfig } from "@/src/lib/freeFirePages";
import { faqSchema, toolAppReviewSchema } from "@/src/lib/schema";
import { getSiteUrl, toCanonicalUrl } from "@/src/lib/siteUrl";
import { getAdPlacementVisibility } from "@/src/server/repositories/adPlacementRepository";
import { getCalculatorPhoneModels } from "@/src/server/repositories/calculatorPhoneModelsRepository";
import { getGameFaqItems } from "@/src/server/repositories/homeFaqRepository";
import { getGameArticleHtml } from "@/src/server/repositories/gameArticlesRepository";
import { listPublishedNews } from "@/src/server/repositories/newsRepository";
import { getSettings } from "@/src/server/repositories/settingsRepository";
import { listApprovedTestimonials } from "@/src/server/repositories/testimonialsRepository";

/** Always read fresh phone models / ads from DB (admin list can change anytime). */
export const dynamic = "force-dynamic";

/**
 * Shared chrome for Free Fire (/), BGMI (/bgmi), and PUBG (/pubg).
 * Await all home chrome data first, then render one stable tree (no Suspense streaming).
 * Calculator feature/math code is not modified here.
 */
export default async function GamesLayout({ children }: { children: React.ReactNode }) {
  const ffCfg = freeFireConfig("freefire");
  const [
    settings,
    adPlaces,
    phoneModels,
    bgmiTestimonials,
    pubgTestimonials,
    freefireTestimonials,
    bgmiFaqItems,
    pubgFaqItems,
    freefireFaqItems,
    bgmiArticleHtml,
    pubgArticleHtml,
    homeNews,
  ] = await Promise.all([
    getSettings(),
    getAdPlacementVisibility(),
    getCalculatorPhoneModels(),
    listApprovedTestimonials({ game: "bgmi" }),
    listApprovedTestimonials({ game: "pubg" }),
    listApprovedTestimonials({ game: "freefire" }),
    getGameFaqItems("bgmi"),
    getGameFaqItems("pubg"),
    getGameFaqItems("freefire"),
    getGameArticleHtml("bgmi"),
    getGameArticleHtml("pubg"),
    listPublishedNews(1, 10),
  ]);
  const homeNewsItems = (homeNews.data ?? []).map((item) => {
    const rawDate = item.publishedAt ?? item.createdAt ?? null;
    const date = rawDate ? new Date(rawDate) : null;
    const excerpt = (item.excerpt ?? "").trim();
    return {
      id: item.id,
      slug: item.slug ?? item.id,
      title: item.title,
      excerpt: excerpt.length > 120 ? `${excerpt.slice(0, 117).trimEnd()}…` : excerpt,
      dateLabel: date
        ? date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "—",
      dateIso: date && !Number.isNaN(date.getTime()) ? date.toISOString().slice(0, 10) : "",
    };
  });
  const baseUrl = getSiteUrl();
  const mapReviews = (items: typeof bgmiTestimonials) =>
    items.map((t) => ({ name: t.name, rating: t.rating, message: t.message }));
  const bgmiFaqLd = faqSchema(bgmiFaqItems);
  const pubgFaqLd = faqSchema(pubgFaqItems);
  const freefireFaqLd = faqSchema(freefireFaqItems);
  const bgmiToolLd = toolAppReviewSchema({
    baseUrl,
    name: "BGMI Sensitivity Calculator | Free No Recoil Settings 2026",
    description:
      "Free BGMI sensitivity calculator for camera, ADS, and gyroscope. Generate custom no-recoil settings for your phone, FPS mode, and play style.",
    url: toCanonicalUrl("/bgmi"),
    reviews: mapReviews(bgmiTestimonials),
  });
  const pubgToolLd = toolAppReviewSchema({
    baseUrl,
    name: "PUBG Mobile Sensitivity Calculator | Free No Recoil Settings 2026",
    description:
      "Free PUBG Mobile sensitivity calculator for camera, ADS, and gyroscope. Get custom no-recoil presets matched to your device and play style.",
    url: toCanonicalUrl("/pubg"),
    reviews: mapReviews(pubgTestimonials),
  });
  const freefireToolLd = toolAppReviewSchema({
    baseUrl,
    name: ffCfg.title,
    description: ffCfg.seoDescription,
    url: toCanonicalUrl("/"),
    reviews: mapReviews(freefireTestimonials),
  });

  return (
    <div>
      <ClientErrorBoundary label="Header">
        <HomeHeader siteTitle={settings.homeDisplay.headerTitle} navigation={settings.navigation} />
      </ClientErrorBoundary>
      {children}
      <main className="page-container">
        <ClientErrorBoundary label="Official patch">
          <FfOfficialPatchStrip />
        </ClientErrorBoundary>
        <ClientErrorBoundary label="Play modes">
          <FfPlayModeChips />
        </ClientErrorBoundary>
        {adPlaces.home.home_above_calculator ? <AdSlot slotKey="home_above_calculator" /> : null}
        <ClientErrorBoundary label="Calculator">
          <SensCalculatorHost phoneModels={phoneModels} ffTrustBar={settings.ffTrustBar} />
        </ClientErrorBoundary>
        {adPlaces.home.home_between_tool_and_article ? (
          <AdSlot slotKey="home_between_tool_and_article" />
        ) : null}
        <ClientErrorBoundary label="Reviews">
          <GameTestimonialsSection
            bgmiTestimonials={bgmiTestimonials}
            pubgTestimonials={pubgTestimonials}
            freefireTestimonials={freefireTestimonials}
          />
        </ClientErrorBoundary>
        <ClientErrorBoundary label="Role tips">
          <FfRoleTips />
        </ClientErrorBoundary>
        <ClientErrorBoundary label="Season event">
          <FfSeasonBanner />
        </ClientErrorBoundary>
        <ClientErrorBoundary label="Pro tips">
          <FfProTips />
        </ClientErrorBoundary>
        <ClientErrorBoundary label="News hub">
          <FfNewsHub items={homeNewsItems} total={homeNews.total} />
        </ClientErrorBoundary>
        <ClientErrorBoundary label="How it works">
          <HowItWorksSection />
        </ClientErrorBoundary>
        <ClientErrorBoundary label="Comparison tables">
          <FfComparisonTables />
        </ClientErrorBoundary>
        <ClientErrorBoundary label="Explore calculators">
          <FfExploreCards />
        </ClientErrorBoundary>
      </main>
      <GamePathJsonLd
        bgmiFaqSchema={bgmiFaqLd}
        pubgFaqSchema={pubgFaqLd}
        freefireFaqSchema={freefireFaqLd}
        bgmiToolSchema={bgmiToolLd}
        pubgToolSchema={pubgToolLd}
        freefireToolSchema={freefireToolLd}
      />
      <ClientErrorBoundary label="Guide">
        <GameArticleFaq
          bgmiFaqItems={bgmiFaqItems}
          pubgFaqItems={pubgFaqItems}
          freefireFaqItems={freefireFaqItems}
          bgmiArticleHtml={bgmiArticleHtml}
          pubgArticleHtml={pubgArticleHtml}
          freefireArticleHtml={ffCfg.defaultArticleHtml}
        />
      </ClientErrorBoundary>
      <SiteFooter settings={settings} />
    </div>
  );
}
