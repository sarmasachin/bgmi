export function AdminAccessDenied({
  title = "Access denied",
  message = "You do not have permission to open this page. Ask a superadmin to update your access.",
}: {
  title?: string;
  message?: string;
}) {
  return (
    <section className="admin-section">
      <h1>{title}</h1>
      <p className="admin-dashboard-subtitle">{message}</p>
    </section>
  );
}
