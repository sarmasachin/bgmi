import { getPublicAdSlot } from "@/src/server/repositories/adsRepository";
import { AdSlotClient } from "@/src/components/AdSlotClient";

type Props = {
  slotKey: string;
};

/** Server: loads enabled ad code from DB (or mock) by placement key; client injects HTML + scripts. */
export async function AdSlot({ slotKey }: Props) {
  const slot = await getPublicAdSlot(slotKey);
  if (!slot) return null;
  return (
    <div className="ff-public-ad">
      <AdSlotClient html={slot.html} slotKey={slotKey} />
      <style>{`
        .ff-public-ad {
          width: 100%;
          max-width: 100%;
          margin: 12px 0;
          box-sizing: border-box;
          min-width: 0;
        }
        .ff-public-ad .ad-slot {
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
        .ff-public-ad .ad-slot:empty {
          display: none;
        }
        .ff-public-ad .ad-slot ins,
        .ff-public-ad .ad-slot > div {
          display: block;
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box;
        }
        .ff-public-ad .ad-slot iframe,
        .ff-public-ad .ad-slot img {
          display: block;
          width: 100% !important;
          max-width: 100% !important;
          height: auto;
        }
      `}</style>
    </div>
  );
}
