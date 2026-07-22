import { mapAdminLegalPages } from "@/src/server/admin/mapAdminLegalPages";
import { ensureCoreLegalPages } from "@/src/server/repositories/legalPagesRepository";
import { requireAdminPageAccess } from "@/src/server/rbac/requireAdminPage";
import { AdminAccessDenied } from "@/src/components/admin/AdminAccessDenied";
import AdminLegalPagesClient from "./AdminLegalPagesClient";

export const dynamic = "force-dynamic";

export default async function AdminLegalPagesPage() {
  const access = await requireAdminPageAccess("legal.view");
  if (!access.ok) return <AdminAccessDenied />;

  const pages = await ensureCoreLegalPages();
  const initialRows = mapAdminLegalPages(pages);
  return <AdminLegalPagesClient initialRows={initialRows} />;
}
