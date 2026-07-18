import { getAdminRatingRows } from "@/src/server/repositories/adminRatingsRepository";
import AdminRatingsClient from "./AdminRatingsClient";

export default async function AdminRatingsPage() {
  const initialRows = await getAdminRatingRows();
  return <AdminRatingsClient initialRows={initialRows} />;
}
