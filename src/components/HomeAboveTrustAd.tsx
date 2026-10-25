import { AdSlot } from "@/src/components/AdSlot";
import { MobileOnlyAd } from "@/src/components/MobileOnlyAd";
import { isAdminAdsHidden } from "@/src/server/adminNoAds";
import { getAdPlacementVisibility } from "@/src/server/repositories/adPlacementRepository";
import { getPublicAdSlot } from "@/src/server/repositories/adsRepository";

/** Mobile ad above the trust text, or under a game calculator that has no trust text. */
export async function HomeAboveTrustAd() {
  if (await isAdminAdsHidden()) return null;
  const [places, slot] = await Promise.all([
    getAdPlacementVisibility(),
    getPublicAdSlot("home_above_trust"),
  ]);
  if (!places.home.home_above_trust || !slot) return null;

  return (
    <MobileOnlyAd>
      <AdSlot slotKey="home_above_trust" />
    </MobileOnlyAd>
  );
}
