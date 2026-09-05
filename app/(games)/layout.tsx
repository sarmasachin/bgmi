import { AdSlot } from "@/src/components/AdSlot";
import { ClientErrorBoundary } from "@/src/components/ClientErrorBoundary";
import { GameArticleFaq } from "@/src/components/GameArticleFaq";
import { GamePathJsonLd } from "@/src/components/GamePathJsonLd";
import { GameTestimonialsSection } from "@/src/components/GameTestimonialsSection";
import { HomeHeader } from "@/src/components/HomeHeader";
import { HowItWorksSection } from "@/src/components/HowItWorksSection";
import { FfComparisonTables } from "@/src/components/FfComparisonTables";
import { FfExploreCards } from "@/src/components/FfExploreCards";
import { FfPatchStrip } from "@/src/components/FfPatchStrip";
import { FfPlayModeChips } from "@/src/components/FfPlayModeChips";
import { FfRoleTips } from "@/src/components/FfRoleTips";
import { FfSeasonBanner } from "@/src/components/FfSeasonBanner";
import { FfProTips } from "@/src/components/FfProTips";
import { FfNewsHub } from "@/src/components/FfNewsHub";
import { SensCalculatorHost } from "@/src/components/SensCalculatorHost";
import { SiteFooter } from "@/src/components/SiteFooter";
import { freeFireConfig } from "@/src/lib/freeFirePages";
import {
  BGMI_LITE_NEWS_CATEGORY,
  PUBG_MOBILE_LITE_NEWS_CATEGORY,
  coerceNewsCategory,
  newsArticlePath,
  newsCategoryLabel,
} from "@/src/lib/newsCategories";
import { formatNewsPublishedAtIst, latestNewsDateValue } from "@/src/lib/formatNewsPublishedAt";
import { faqSchema, toolAppReviewSchema } from "@/src/lib/schema";
import { getSiteUrl, toCanonicalUrl } from "@/src/lib/siteUrl";
import { getAdPlacementVisibility } from "@/src/server/repositories/adPlacementRepository";
import { getCalculatorPhoneModels } from "@/src/server/repositories/calculatorPhoneModelsRepository";
import { getGameFaqItems } from "@/src/server/repositories/homeFaqRepository";
import { getGameArticleHtml } from "@/src/server/repositories/gameArticlesRepository";
import { getFfHomeCards, getFfPageCards } from "@/src/server/repositories/homeCardsRepository";
import { listPublishedNews, listPublishedNewsByCategory } from "@/src/server/repositories/newsRepository";
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
    bgmiLiteTestimonials,
    pubgTestimonials,
    pubgMobileLiteTestimonials,
    freefireTestimonials,
    bgmiFaqItems,
    bgmiLiteFaqItems,
    pubgFaqItems,
    pubgMobileLiteFaqItems,
    freefireFaqItems,
    bgmiArticleHtml,
    bgmiLiteArticleHtml,
    pubgArticleHtml,
    pubgMobileLiteArticleHtml,
    freefireArticleHtml,
    homeNews,
    liteNews,
    pubgMobileLiteNews,
    homeCards,
    bgmiCards,
    bgmiLiteCards,
    pubgMobileLiteCards,
    pubgCards,
  ] = await Promise.all([
    getSettings(),
    getAdPlacementVisibility(),
    getCalculatorPhoneModels(),
    listApprovedTestimonials({ game: "bgmi" }),
    listApprovedTestimonials({ game: "bgmi-lite" }),
    listApprovedTestimonials({ game: "pubg" }),
    listApprovedTestimonials({ game: "pubg-mobile-lite" }),
    listApprovedTestimonials({ game: "freefire" }),
    getGameFaqItems("bgmi"),
    getGameFaqItems("bgmi-lite"),
    getGameFaqItems("pubg"),
    getGameFaqItems("pubg-mobile-lite"),
    getGameFaqItems("freefire"),
    getGameArticleHtml("bgmi"),
    getGameArticleHtml("bgmi-lite"),
    getGameArticleHtml("pubg"),
    getGameArticleHtml("pubg-mobile-lite"),
    getGameArticleHtml("freefire"),
    listPublishedNews(1, 5),
    listPublishedNewsByCategory(BGMI_LITE_NEWS_CATEGORY, 1, 5),
    listPublishedNewsByCategory(PUBG_MOBILE_LITE_NEWS_CATEGORY, 1, 5),
    getFfHomeCards(),
    getFfPageCards("bgmi"),
    getFfPageCards("bgmi-lite"),
    getFfPageCards("pubg-mobile-lite"),
    getFfPageCards("pubg"),
  ]);
  const mapNewsItems = (rows: typeof homeNews.data) =>
    (rows ?? []).map((item) => {
      const rawDate = latestNewsDateValue(item);
      const date = rawDate ? new Date(rawDate) : null;
      const excerpt = (item.excerpt ?? "").trim();
      const primary = coerceNewsCategory(
        (item as { primaryCategory?: string | null }).primaryCategory,
      );
      return {
        id: item.id,
        slug: item.slug ?? item.id,
        href: newsArticlePath(primary, item.slug ?? item.id),
        title: item.title,
        excerpt: excerpt.length > 120 ? `${excerpt.slice(0, 117).trimEnd()}…` : excerpt,
        dateLabel: formatNewsPublishedAtIst(rawDate),
        dateIso: date && !Number.isNaN(date.getTime()) ? date.toISOString().slice(0, 10) : "",
        categoryLabel: newsCategoryLabel(primary),
        featureImage: (item.featureImage ?? "").trim(),
      };
    });
  const homeNewsItems = mapNewsItems(homeNews.data);
  const liteNewsItems = mapNewsItems(liteNews.data);
  const pubgMobileLiteNewsItems = mapNewsItems(pubgMobileLiteNews.data);
  const baseUrl = getSiteUrl();
  const mapReviews = (items: typeof bgmiTestimonials) =>
    items.map((t) => ({ name: t.name, rating: t.rating, message: t.message }));
  const bgmiFaqLd = faqSchema(bgmiFaqItems);
  const bgmiLiteFaqLd = faqSchema(bgmiLiteFaqItems);
  const pubgFaqLd = faqSchema(pubgFaqItems);
  const pubgMobileLiteFaqLd = faqSchema(pubgMobileLiteFaqItems);
  const freefireFaqLd = faqSchema(freefireFaqItems);
  const bgmiToolLd = toolAppReviewSchema({
    baseUrl,
    name: bgmiCards.hero.title.trim() || "BGMI Sensitivity Calculator",
    description:
      bgmiCards.seo.description.trim() ||
      "Free BGMI sensitivity calculator for camera, ADS, and gyroscope. Generate custom settings for your phone, FPS mode, and play style.",
    url: toCanonicalUrl("/bgmi"),
    reviews: mapReviews(bgmiTestimonials),
  });
  const bgmiLiteToolLd = toolAppReviewSchema({
    baseUrl,
    name: bgmiLiteCards.hero.title.trim() || "BGMI Lite Sensitivity Calculator",
    description:
      bgmiLiteCards.seo.description.trim() ||
      "Free BGMI Lite sensitivity calculator for 2GB–4GB phones. Camera, ADS, and Gyroscope settings for 30–60 FPS devices.",
    url: toCanonicalUrl("/bgmi-lite"),
    reviews: mapReviews(bgmiLiteTestimonials),
  });
  const pubgToolLd = toolAppReviewSchema({
    baseUrl,
    name: pubgCards.hero.title.trim() || "PUBG Mobile Sensitivity Calculator",
    description:
      pubgCards.seo.description.trim() ||
      "Free PUBG Mobile sensitivity calculator for camera, ADS, and gyroscope. Get custom presets matched to your device and play style.",
    url: toCanonicalUrl("/pubg"),
    reviews: mapReviews(pubgTestimonials),
  });
  const pubgMobileLiteToolLd = toolAppReviewSchema({
    baseUrl,
    name: pubgMobileLiteCards.hero.title.trim() || "PUBG Mobile Lite Sensitivity Calculator",
    description:
      pubgMobileLiteCards.seo.description.trim() ||
      "Free PUBG Mobile Lite sensitivity calculator for 2GB–4GB phones. Camera, ADS, and Gyroscope settings for 30–60 FPS devices.",
    url: toCanonicalUrl("/pubg-mobile-lite"),
    reviews: mapReviews(pubgMobileLiteTestimonials),
  });
  const freefireToolLd = toolAppReviewSchema({
    baseUrl,
    name: homeCards.hero.title.trim() || ffCfg.title,
    description: homeCards.seo.description.trim() || ffCfg.seoDescription,
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
        <ClientErrorBoundary label="Patch strip">
          <FfPatchStrip
            homeContent={homeCards.patchStrip}
            liteContent={bgmiLiteCards.patchStrip}
            pubgLiteContent={pubgMobileLiteCards.patchStrip}
          />
        </ClientErrorBoundary>
        <ClientErrorBoundary label="Play modes">
          <FfPlayModeChips
            homeContent={homeCards.playModes}
            liteContent={bgmiLiteCards.playModes}
            pubgLiteContent={pubgMobileLiteCards.playModes}
          />
        </ClientErrorBoundary>
        {adPlaces.home.home_above_calculator ? <AdSlot slotKey="home_above_calculator" /> : null}
        <ClientErrorBoundary label="Calculator">
          <SensCalculatorHost
            phoneModels={phoneModels}
            ffTrustBar={settings.ffTrustBar}
            bgmiLiteBanner={bgmiLiteCards.calcBanner}
            pubgLiteBanner={pubgMobileLiteCards.calcBanner}
          />
        </ClientErrorBoundary>
        {adPlaces.home.home_between_tool_and_article ? (
          <AdSlot slotKey="home_between_tool_and_article" />
        ) : null}
        <ClientErrorBoundary label="Reviews">
          <GameTestimonialsSection
            bgmiTestimonials={bgmiTestimonials}
            bgmiLiteTestimonials={bgmiLiteTestimonials}
            pubgTestimonials={pubgTestimonials}
            pubgMobileLiteTestimonials={pubgMobileLiteTestimonials}
            freefireTestimonials={freefireTestimonials}
          />
        </ClientErrorBoundary>
        <ClientErrorBoundary label="Role tips">
          <FfRoleTips
            homeContent={homeCards.roleTips}
            liteContent={bgmiLiteCards.roleTips}
            pubgLiteContent={pubgMobileLiteCards.roleTips}
          />
        </ClientErrorBoundary>
        <ClientErrorBoundary label="Season event">
          <FfSeasonBanner
            homeContent={homeCards.season}
            liteContent={bgmiLiteCards.season}
            pubgLiteContent={pubgMobileLiteCards.season}
          />
        </ClientErrorBoundary>
        <ClientErrorBoundary label="Pro tips">
          <FfProTips
            homeContent={homeCards.proTips}
            liteContent={bgmiLiteCards.proTips}
            pubgLiteContent={pubgMobileLiteCards.proTips}
          />
        </ClientErrorBoundary>
        <ClientErrorBoundary label="News hub">
          <FfNewsHub
            items={homeNewsItems}
            total={homeNews.total}
            liteItems={liteNewsItems}
            liteTotal={liteNews.total}
            pubgMobileLiteItems={pubgMobileLiteNewsItems}
            pubgMobileLiteTotal={pubgMobileLiteNews.total}
          />
        </ClientErrorBoundary>
        <ClientErrorBoundary label="How it works">
          <HowItWorksSection
            homeContent={homeCards.howItWorks}
            liteContent={bgmiLiteCards.howItWorks}
            pubgLiteContent={pubgMobileLiteCards.howItWorks}
          />
        </ClientErrorBoundary>
        <ClientErrorBoundary label="Comparison tables">
          <FfComparisonTables
            homeContent={homeCards.comparison}
            liteContent={bgmiLiteCards.comparison}
            pubgLiteContent={pubgMobileLiteCards.comparison}
          />
        </ClientErrorBoundary>
        <ClientErrorBoundary label="Explore calculators">
          <FfExploreCards
            homeContent={homeCards.explore}
            liteContent={bgmiLiteCards.explore}
            pubgLiteContent={pubgMobileLiteCards.explore}
          />
        </ClientErrorBoundary>
      </main>
      <GamePathJsonLd
        bgmiFaqSchema={bgmiFaqLd}
        bgmiLiteFaqSchema={bgmiLiteFaqLd}
        pubgFaqSchema={pubgFaqLd}
        pubgMobileLiteFaqSchema={pubgMobileLiteFaqLd}
        freefireFaqSchema={freefireFaqLd}
        bgmiToolSchema={bgmiToolLd}
        bgmiLiteToolSchema={bgmiLiteToolLd}
        pubgToolSchema={pubgToolLd}
        pubgMobileLiteToolSchema={pubgMobileLiteToolLd}
        freefireToolSchema={freefireToolLd}
      />
      <ClientErrorBoundary label="Guide">
        <GameArticleFaq
          bgmiFaqItems={bgmiFaqItems}
          bgmiLiteFaqItems={bgmiLiteFaqItems}
          pubgFaqItems={pubgFaqItems}
          pubgMobileLiteFaqItems={pubgMobileLiteFaqItems}
          freefireFaqItems={freefireFaqItems}
          bgmiArticleHtml={bgmiArticleHtml}
          bgmiLiteArticleHtml={bgmiLiteArticleHtml}
          pubgArticleHtml={pubgArticleHtml}
          pubgMobileLiteArticleHtml={pubgMobileLiteArticleHtml}
          freefireArticleHtml={freefireArticleHtml ?? ffCfg.defaultArticleHtml}
        />
      </ClientErrorBoundary>
      <SiteFooter settings={settings} />
    </div>
  );
}
