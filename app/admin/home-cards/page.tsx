import { getDefaultPageCards } from "@/src/lib/homeCardsDefaults";
import { getFfPageCardsForAdmin } from "@/src/server/repositories/homeCardsRepository";
import { requireAdminPageAccess } from "@/src/server/rbac/requireAdminPage";
import { AdminAccessDenied } from "@/src/components/admin/AdminAccessDenied";
import type { PageCardsVariant } from "@/src/lib/homeCardsTypes";
import AdminHomeCardsClient from "./AdminHomeCardsClient";

export const dynamic = "force-dynamic";

async function loadVariant(variant: PageCardsVariant) {
  try {
    return await getFfPageCardsForAdmin(variant);
  } catch {
    return { cards: getDefaultPageCards(variant), usingDefault: true };
  }
}

export default async function AdminHomeCardsPage() {
  const access = await requireAdminPageAccess("homeCards.view");
  if (!access.ok) return <AdminAccessDenied />;

  const [freefire, freefireMax, bgmi, pubg, pubgMobileCodes] = await Promise.all([
    loadVariant("freefire"),
    loadVariant("freefire-max"),
    loadVariant("bgmi"),
    loadVariant("pubg"),
    loadVariant("pubg-mobile-codes"),
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
