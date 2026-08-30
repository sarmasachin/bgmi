import { AdminAccessDenied } from "@/src/components/admin/AdminAccessDenied";
import { requireAdminPageAccess } from "@/src/server/rbac/requireAdminPage";
import { getFreeFireStylishNamePageForAdmin } from "@/src/server/repositories/freeFireStylishNameRepository";
import AdminFreeFireStylishClient from "./AdminFreeFireStylishClient";

export const dynamic = "force-dynamic";

export default async function AdminFreeFireStylishPage() {
  const access = await requireAdminPageAccess("freeFireStylish.view");
  if (!access.ok) return <AdminAccessDenied />;

  const initialData = await getFreeFireStylishNamePageForAdmin();
  return <AdminFreeFireStylishClient initialData={initialData} />;
}
