import Link from "next/link";

export default function NotFound() {
  return (
    <main className="user-error-page">
      <div className="user-error-panel user-error-panel--page" role="status">
        <p className="user-error-panel-code">404</p>
        <h1 className="user-error-panel-title">Page not found</h1>
        <p className="user-error-panel-message">
          This link doesn’t exist or may have moved. Check the URL, or head back to the calculator.
        </p>
        <div className="user-error-panel-actions">
          <Link href="/" className="user-error-panel-btn user-error-panel-btn--primary">
            BGMI calculator
          </Link>
          <Link href="/pubg" className="user-error-panel-btn user-error-panel-btn--ghost">
            PUBG Mobile
          </Link>
        </div>
      </div>
    </main>
  );
}
