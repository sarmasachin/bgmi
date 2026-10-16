import { AdSlotClient } from "@/src/components/AdSlotClient";
import { getAdPlacementVisibility } from "@/src/server/repositories/adPlacementRepository";
import { getPublicAdSlot } from "@/src/server/repositories/adsRepository";

/** Responsive ad under a page title. Each slotKey has its own admin code. */
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
      : slotKey === "free_fire_max_redeem_below_title"
        ? places.home.free_fire_max_redeem_below_title
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
        .lite-redeem-inner .ff-home-ad {
          width: 100%;
          max-width: 100%;
          margin: 12px 0 14px;
        }
        .ff-home-ad-banner,
        .ff-home-ad .ad-slot {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          height: auto;
          box-sizing: border-box;
          background: transparent;
          border: 0;
          padding: 0;
          margin: 0;
          overflow: hidden;
        }
        .ff-home-ad .ad-slot:empty {
          display: none;
        }
        .ff-home-ad .ad-slot ins {
          display: block;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }
        .ff-home-ad .ad-slot iframe,
        .ff-home-ad .ad-slot img {
          display: block;
          max-width: 100%;
        }
      `}</style>
    </div>
  );
}
