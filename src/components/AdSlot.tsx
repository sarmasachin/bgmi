import { getPublicAdSlot } from "@/src/server/repositories/adsRepository";
import { AdSlotClient } from "@/src/components/AdSlotClient";

type Props = {
  slotKey: string;
};

/** Server: loads enabled ad code from DB (or mock) by placement key; client injects HTML + scripts. */
export async function AdSlot({ slotKey }: Props) {
  const slot = await getPublicAdSlot(slotKey);
  if (!slot) return null;
  return <AdSlotClient html={slot.html} slotKey={slotKey} />;
}
