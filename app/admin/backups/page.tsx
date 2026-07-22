import AdminBackupsClient from "./AdminBackupsClient";

/** Static shell SSR — no admin/loading.tsx flash on refresh. */
export default function AdminBackupsPage() {
  return <AdminBackupsClient />;
}
