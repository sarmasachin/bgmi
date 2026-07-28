import { getFfPageCardsForAdmin } from "@/src/server/repositories/homeCardsRepository";
import { requireAdminPageAccess } from "@/src/server/rbac/requireAdminPage";
import { AdminAccessDenied } from "@/src/components/admin/AdminAccessDenied";
import AdminHomeCardsClient from "./AdminHomeCardsClient";

export const dynamic = "force-dynamic";

export default async function AdminHomeCardsPage() {
  const access = await requireAdminPageAccess("homeCards.view");
  if (!access.ok) return <AdminAccessDenied />;

  const [freefire, freefireMax, bgmi, pubg, pubgMobileCodes] = await Promise.all([
    getFfPageCardsForAdmin("freefire"),
    getFfPageCardsForAdmin("freefire-max"),
    getFfPageCardsForAdmin("bgmi"),
    getFfPageCardsForAdmin("pubg"),
    getFfPageCardsForAdmin("pubg-mobile-codes"),
  ]);

  return (
    <AdminHomeCardsClient
      initialByVariant={{
        freefire,
        "freefire-max": freefireMax,
        bgmi,
        pubg,
        "pubg-mobile-codes": pubgMobileCodes,
      }}
    />
  );
}
