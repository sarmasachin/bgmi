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
          width: 100%;
          max-width: 100%;
          min-width: 0;
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
        }
        .ff-public-ad .ad-slot:empty {
          display: none;
        }
      `}</style>
    </div>
  );
}
