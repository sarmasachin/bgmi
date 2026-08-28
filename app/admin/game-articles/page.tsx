import { getGameArticlesForAdmin } from "@/src/server/repositories/gameArticlesRepository";
import { requireAdminPageAccess } from "@/src/server/rbac/requireAdminPage";
import { AdminAccessDenied } from "@/src/components/admin/AdminAccessDenied";
import AdminGameArticlesClient from "./AdminGameArticlesClient";

export const dynamic = "force-dynamic";

export default async function AdminGameArticlesPage() {
  const access = await requireAdminPageAccess("gameArticles.view");
  if (!access.ok) return <AdminAccessDenied />;

  let initialData: Awaited<ReturnType<typeof getGameArticlesForAdmin>> | undefined;
  try {
    initialData = await getGameArticlesForAdmin();
  } catch {
    // Client will refetch via /api/admin/game-articles (long timeout). Avoid painting
    // built-in defaults as if they were the live custom article.
    initialData = undefined;
  }
  return <AdminGameArticlesClient initialData={initialData} />;
}
