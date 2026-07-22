import { getAdminRatingRows } from "@/src/server/repositories/adminRatingsRepository";
import { requireAdminPageAccess } from "@/src/server/rbac/requireAdminPage";
import { AdminAccessDenied } from "@/src/components/admin/AdminAccessDenied";
import AdminRatingsClient from "./AdminRatingsClient";

export default async function AdminRatingsPage() {
  const access = await requireAdminPageAccess("ratings.view");
  if (!access.ok) return <AdminAccessDenied />;

  const initialRows = await getAdminRatingRows();
  return <AdminRatingsClient initialRows={initialRows} />;
}
