import { getGameArticlesForAdmin } from "@/src/server/repositories/gameArticlesRepository";
import { requireAdminPageAccess } from "@/src/server/rbac/requireAdminPage";
import { AdminAccessDenied } from "@/src/components/admin/AdminAccessDenied";
import AdminGameArticlesClient from "./AdminGameArticlesClient";

export const dynamic = "force-dynamic";

export default async function AdminGameArticlesPage() {
  const access = await requireAdminPageAccess("gameArticles.view");
  if (!access.ok) return <AdminAccessDenied />;

  const initialData = await getGameArticlesForAdmin();
  return <AdminGameArticlesClient initialData={initialData} />;
}
