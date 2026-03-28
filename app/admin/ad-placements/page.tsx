import { listAdSlots } from "@/src/server/repositories/adsRepository";
import { getAdPlacementVisibility } from "@/src/server/repositories/adPlacementRepository";
import { AdminAdsForm } from "./AdminAdsForm";

export default async function AdminAdPlacementsPage() {
  const [rows, placements] = await Promise.all([listAdSlots(), getAdPlacementVisibility()]);

  const initialRows = rows.map((r) => ({
    id: r.id,
    slotKey: r.slotKey,
    title: r.title,
    code: r.code,
    isEnabled: r.isEnabled,
    updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : String(r.updatedAt),
  }));

  const formKey = initialRows.map((r) => `${r.id}:${r.updatedAt}`).join("|");

  return <AdminAdsForm key={formKey} initialRows={initialRows} initialPlacements={placements} />;
}
