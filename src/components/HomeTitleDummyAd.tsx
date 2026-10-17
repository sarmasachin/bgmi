import { AdSlotClient } from "@/src/components/AdSlotClient";
import { getAdPlacementVisibility } from "@/src/server/repositories/adPlacementRepository";
import { getPublicAdSlot } from "@/src/server/repositories/adsRepository";

/** Responsive ad under a page title. Game, redeem, and APK pages reuse admin boxes. */
export async function HomeTitleDummyAd({
  slotKey = "home_below_title",
}: {
  slotKey?: string;
} = {}) {
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
      <div className="ff-home-ad-banner">
        <AdSlotClient html={slot.html} slotKey={slotKey} />
      </div>
      <style>{`
        .ff-home-ad {
          width: min(1100px, 95%);
          max-width: 100%;
          margin: 0 auto 12px;
          box-sizing: border-box;
          min-width: 0;
        }
        .lite-redeem-inner .ff-home-ad,
        .ff-as-article-head .ff-home-ad {
          width: 100%;
          max-width: 100%;
          margin: 12px 0 14px;
        }
        .ff-home-ad-banner,
        .ff-home-ad .ad-slot {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0;
          height: auto !important;
          box-sizing: border-box;
          background: transparent !important;
          border: 0 !important;
          border-radius: 0 !important;
          outline: 0 !important;
          box-shadow: none !important;
          color: inherit;
          text-align: left;
          padding: 0 !important;
          margin: 0 !important;
          overflow: hidden;
        }
        .ff-home-ad .ad-slot:empty {
          display: none;
        }
        .ff-home-ad .ad-slot ins,
        .ff-home-ad .ad-slot > div {
          display: block;
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box;
        }
        .ff-home-ad .ad-slot iframe,
        .ff-home-ad .ad-slot img {
          display: block;
          width: 100% !important;
          max-width: 100% !important;
          height: auto;
        }
      `}</style>
    </div>
  );
}
