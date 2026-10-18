import { AdSlotClient } from "@/src/components/AdSlotClient";
import { isAdminAdsHidden } from "@/src/server/adminNoAds";
import { getAdPlacementVisibility } from "@/src/server/repositories/adPlacementRepository";
import { getPublicAdSlot } from "@/src/server/repositories/adsRepository";

/** Responsive title ad — outer wrap only as tall as the creative. */
export async function HomeTitleDummyAd({
  slotKey = "home_below_title",
}: {
  slotKey?: string;
} = {}) {
  if (await isAdminAdsHidden()) return null;
  const [places, slot] = await Promise.all([
    getAdPlacementVisibility(),
    getPublicAdSlot(slotKey),
  ]);
  const visible =
    slotKey === "free_fire_redeem_below_title"
      ? places.home.free_fire_redeem_below_title
      : slotKey === "apk_below_title"
        ? places.home.apk_below_title
        : slotKey === "apk_below_actions"
          ? places.home.apk_below_actions
          : places.home.home_below_title;
  if (!visible || !slot) return null;

  return (
    <div className="ff-home-ad">
      <AdSlotClient html={slot.html} slotKey={slotKey} />
      <style>{`
        .ff-home-ad {
          display: block;
          width: min(1100px, 95%);
          max-width: 100%;
          min-height: 0;
          height: auto;
          margin: 0 auto 12px;
          padding: 0;
          box-sizing: border-box;
          background: transparent;
          border: 0;
          overflow: hidden;
        }
        .lite-redeem-inner .ff-home-ad,
        .ff-as-article-head .ff-home-ad {
          width: 100%;
          max-width: 100%;
          margin: 12px 0 14px;
        }
      `}</style>
    </div>
  );
}
