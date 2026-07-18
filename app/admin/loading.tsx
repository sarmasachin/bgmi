export default function AdminLoading() {
  return (
    <div className="admin-section admin-loading-shell" aria-busy="true" aria-live="polite">
      <div className="admin-loading-bar" />
      <p>Loading admin page…</p>
    </div>
  );
}
