import { getAllGameFaqsForAdmin } from "@/src/server/repositories/homeFaqRepository";
import { requireAdminPageAccess } from "@/src/server/rbac/requireAdminPage";
import { AdminAccessDenied } from "@/src/components/admin/AdminAccessDenied";
import AdminGameFaqsClient from "./AdminGameFaqsClient";

export const dynamic = "force-dynamic";

export default async function AdminGameFaqsPage() {
  const access = await requireAdminPageAccess("gameFaqs.view");
  if (!access.ok) return <AdminAccessDenied />;

  const initialData = await getAllGameFaqsForAdmin();
  return <AdminGameFaqsClient initialData={initialData} />;
}
