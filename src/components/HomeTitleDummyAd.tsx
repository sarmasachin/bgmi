import { AdSlotClient } from "@/src/components/AdSlotClient";
import { getAdPlacementVisibility } from "@/src/server/repositories/adPlacementRepository";
import { getPublicAdSlot } from "@/src/server/repositories/adsRepository";

const SLOT_KEY = "home_below_title";

/** Free Fire homepage, under the title. Shows only when admin enables this slot and pastes code. */
export async function HomeTitleDummyAd() {
  const [places, slot] = await Promise.all([
    getAdPlacementVisibility(),
    getPublicAdSlot(SLOT_KEY),
  ]);
  if (!places.home.home_below_title || !slot) return null;

  return (
    <div className="ff-home-ad">
      <div className="ff-home-ad-banner">
        <AdSlotClient html={slot.html} slotKey={SLOT_KEY} />
      </div>
      <style>{`
        .ff-home-ad {
          width: 95%;
          max-width: 1100px;
          margin: 0 auto 12px;
          box-sizing: border-box;
        }
        .ff-home-ad-banner {
          width: 100%;
          height: auto;
          box-sizing: border-box;
          background: #0b0e14;
          border: 1px solid #30363d;
          border-radius: 14px;
          padding: 14px 16px;
        }
        .ff-home-ad .ad-slot {
          width: 100%;
          max-width: none;
          margin: 0;
          padding: 0;
          border: 0;
          border-radius: 0;
          background: transparent;
          color: inherit;
          text-align: center;
        }
        .ff-home-ad .ad-slot:empty {
          display: none;
        }
        .ff-home-ad .ad-slot iframe,
        .ff-home-ad .ad-slot img,
        .ff-home-ad .ad-slot ins {
          max-width: 100%;
        }
      `}</style>
    </div>
  );
}
