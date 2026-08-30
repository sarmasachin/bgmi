import { AdminAccessDenied } from "@/src/components/admin/AdminAccessDenied";
import { requireAdminPageAccess } from "@/src/server/rbac/requireAdminPage";
import { getBgmiLiteStylishPageForAdmin } from "@/src/server/repositories/bgmiLiteStylishNameRepository";
import AdminBgmiLiteStylishClient from "./AdminBgmiLiteStylishClient";

export const dynamic = "force-dynamic";

export default async function AdminBgmiLiteStylishPage() {
  const access = await requireAdminPageAccess("bgmiLiteStylish.view");
  if (!access.ok) return <AdminAccessDenied />;

  const initialData = await getBgmiLiteStylishPageForAdmin();
  return <AdminBgmiLiteStylishClient initialData={initialData} />;
}
