import { getGameArticlesForAdmin } from "@/src/server/repositories/gameArticlesRepository";
import AdminGameArticlesClient from "./AdminGameArticlesClient";

export const dynamic = "force-dynamic";

export default async function AdminGameArticlesPage() {
  const initialData = await getGameArticlesForAdmin();
  return <AdminGameArticlesClient initialData={initialData} />;
}
