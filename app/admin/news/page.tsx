import { mapAdminNewsRows } from "@/src/server/admin/mapAdminNewsRows";
import { listNews } from "@/src/server/repositories/newsRepository";
import AdminNewsClient from "./AdminNewsClient";

export default async function AdminNewsPage() {
  const result = await listNews(1, 20);
  const initialRows = mapAdminNewsRows(result.data);
  return <AdminNewsClient initialRows={initialRows} />;
}
