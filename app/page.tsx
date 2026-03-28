import { ArticleFaq } from "@/src/components/ArticleFaq";
import { AdSlot } from "@/src/components/AdSlot";
import { HomeHeader } from "@/src/components/HomeHeader";
import { RatingWidget } from "@/src/components/RatingWidget";
import { ratingWidgetRemountKey } from "@/src/lib/ratingWidgetKey";
import { ShareRail } from "@/src/components/ShareRail";
import { SiteFooter } from "@/src/components/SiteFooter";
import { SensCalculator } from "@/src/features/sensCalculator/SensCalculator";
import { getCalculatorPhoneModels } from "@/src/server/repositories/calculatorPhoneModelsRepository";
import { getAdPlacementVisibility } from "@/src/server/repositories/adPlacementRepository";
import { getSettings, isShareRailEnabled } from "@/src/server/repositories/settingsRepository";

export default async function Home() {
  const [adPlaces, settings, phoneModels] = await Promise.all([
    getAdPlacementVisibility(),
    getSettings(),
    getCalculatorPhoneModels(),
  ]);
  const showShareRail = isShareRailEnabled(settings.integrations);
  return (
    <div>
      <HomeHeader siteTitle={settings.homeDisplay.headerTitle} navigation={settings.navigation} />
      {showShareRail ? <ShareRail /> : null}
      <h1 className="main-title">{settings.homeDisplay.heroTitle}</h1>
      <main className="page-container">
        {adPlaces.home.home_above_calculator ? <AdSlot slotKey="home_above_calculator" /> : null}
        <SensCalculator phoneModels={phoneModels} />
        {adPlaces.home.home_between_tool_and_article ? (
          <AdSlot slotKey="home_between_tool_and_article" />
        ) : null}
        <RatingWidget
          key={ratingWidgetRemountKey("home")}
          title="Rate this homepage experience"
          targetType="home"
        />
      </main>
      <ArticleFaq wrapperClassName="light-content--after-home-calculator" />
      <SiteFooter />
    </div>
  );
}
