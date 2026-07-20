"use client";

export function AdminLogoutButton() {
  async function logout() {
    try {
      await fetch("/api/admin/auth/logout", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
      });
    } finally {
      // Hard navigation clears SPA history soft-cache of protected pages.
      window.location.replace("/admin/login");
    }
  }

  return (
    <button type="button" onClick={logout} className="admin-logout-btn">
      <span className="admin-nav-icon" aria-hidden>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 17l5-5-5-5" />
          <path d="M15 12H3" />
          <path d="M21 20V4a1 1 0 0 0-1-1h-6" />
        </svg>
      </span>
      <span>Logout</span>
    </button>
  );
}
