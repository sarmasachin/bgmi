import { getPublicAdSlot } from "@/src/server/repositories/adsRepository";
import { isAdminAdsHidden } from "@/src/server/adminNoAds";
import { AdSlotClient } from "@/src/components/AdSlotClient";

type Props = {
  slotKey: string;
};

/** Server: loads enabled ad code from DB; client injects HTML + scripts. */
export async function AdSlot({ slotKey }: Props) {
  if (await isAdminAdsHidden()) return null;
  const slot = await getPublicAdSlot(slotKey);
  if (!slot) return null;
  return (
    <div className="ff-public-ad">
      <AdSlotClient html={slot.html} slotKey={slotKey} />
      <style>{`
        .ff-public-ad {
          display: block;
          width: 100%;
          max-width: 100%;
          /* Stable floor before creative loads (Core Web Vitals CLS). */
          min-height: 90px;
          height: auto;
          margin: 12px 0;
          padding: 0;
          box-sizing: border-box;
          background: transparent;
          border: 0;
          overflow: hidden;
          contain: layout;
        }
      `}</style>
    </div>
  );
}
