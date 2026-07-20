import { getAllGameFaqsForAdmin } from "@/src/server/repositories/homeFaqRepository";
import AdminGameFaqsClient from "./AdminGameFaqsClient";

export const dynamic = "force-dynamic";

export default async function AdminGameFaqsPage() {
  const initialData = await getAllGameFaqsForAdmin();
  return <AdminGameFaqsClient initialData={initialData} />;
}
