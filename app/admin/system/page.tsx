import { getSystemHealthData } from "@/src/server/admin/getSystemHealthData";
import AdminSystemClient from "./AdminSystemClient";

export default async function AdminSystemPage() {
  const initialData = getSystemHealthData();
  return <AdminSystemClient initialData={initialData} />;
}
