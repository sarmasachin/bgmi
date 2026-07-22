import AdminContactClient from "./AdminContactClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** List is client-fetched only — avoids SSR/bfcache flash of deleted rows on refresh. */
export default function AdminContactPage() {
  return <AdminContactClient />;
}
