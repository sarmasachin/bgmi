"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { AdminLogoutButton } from "@/src/components/admin/AdminLogoutButton";

type SidebarIconName =
  | "dashboard"
  | "news"
  | "pages"
  | "comments"
  | "notifications"
  | "ratings"
  | "ads"
  | "media"
  | "backups"
  | "users"
  | "audit"
  | "system"
  | "settings";

/** Avoid prefix bugs e.g. /admin/notifications matching /admin/news via startsWith("news"). */
function isNavItemActive(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin" || pathname === "/admin/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

const items = [
  { label: "Dashboard", href: "/admin", icon: "dashboard" as SidebarIconName },
  { label: "News", href: "/admin/news", icon: "news" as SidebarIconName },
  { label: "Pages", href: "/admin/pages", icon: "pages" as SidebarIconName },
  { label: "Comments", href: "/admin/comments", icon: "comments" as SidebarIconName },
  { label: "Notifications", href: "/admin/notifications", icon: "notifications" as SidebarIconName },
  { label: "Ratings", href: "/admin/ratings", icon: "ratings" as SidebarIconName },
  { label: "Ads", href: "/admin/ad-placements", icon: "ads" as SidebarIconName },
  { label: "Media", href: "/admin/media", icon: "media" as SidebarIconName },
  { label: "Backups", href: "/admin/backups", icon: "backups" as SidebarIconName },
  { label: "Users", href: "/admin/users", icon: "users" as SidebarIconName },
  { label: "Audit", href: "/admin/audit", icon: "audit" as SidebarIconName },
  { label: "System", href: "/admin/system", icon: "system" as SidebarIconName },
  { label: "Settings", href: "/admin/settings", icon: "settings" as SidebarIconName },
];

function SidebarIcon({ name }: { name: SidebarIconName }) {
  const shared = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "dashboard":
      return <svg {...shared}><rect x="3" y="3" width="8" height="8" /><rect x="13" y="3" width="8" height="5" /><rect x="13" y="10" width="8" height="11" /><rect x="3" y="13" width="8" height="8" /></svg>;
    case "news":
      return <svg {...shared}><path d="M4 5h16v14H4z" /><path d="M8 9h8" /><path d="M8 13h8" /><path d="M8 17h5" /></svg>;
    case "pages":
      return <svg {...shared}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 7h8M8 11h8M8 15h6" /></svg>;
    case "comments":
      return <svg {...shared}><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.7 0-3.3-.5-4.6-1.3L3 20l1.5-4.1A8.5 8.5 0 1 1 21 11.5Z" /></svg>;
    case "notifications":
      return <svg {...shared}><path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" /><path d="M10 19a2 2 0 0 0 4 0" /></svg>;
    case "ratings":
      return <svg {...shared}><polygon points="12 3 14.9 9 21.5 9.8 16.6 14.2 17.9 20.8 12 17.4 6.1 20.8 7.4 14.2 2.5 9.8 9.1 9" /></svg>;
    case "ads":
      return <svg {...shared}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M7 9h10M7 13h6" /></svg>;
    case "media":
      return <svg {...shared}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="m21 16-5-5-8 8" /></svg>;
    case "backups":
      return <svg {...shared}><path d="M21 12a9 9 0 1 1-2.64-6.36" /><path d="M21 3v6h-6" /></svg>;
    case "users":
      return <svg {...shared}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
    case "audit":
      return <svg {...shared}><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h10" /></svg>;
    case "system":
      return <svg {...shared}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a1 1 0 0 1-1.4 1.4l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V19a1 1 0 0 1-2 0v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a1 1 0 0 1-1.4-1.4l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H5a1 1 0 0 1 0-2h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a1 1 0 0 1 1.4-1.4l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V5a1 1 0 0 1 2 0v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a1 1 0 0 1 1.4 1.4l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6H19a1 1 0 0 1 0 2h-.2a1 1 0 0 0-.9.6Z" /></svg>;
    case "settings":
      return <svg {...shared}><path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" /><circle cx="12" cy="12" r="3.5" /></svg>;
    default:
      return null;
  }
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="admin-shell">
      {isLoginPage ? (
        <main className="admin-main">{children}</main>
      ) : (
        <div className="admin-layout">
          <div className="admin-mobile-topbar">
            <button
              type="button"
              className="admin-mobile-menu-btn"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle admin menu"
              aria-expanded={mobileMenuOpen}
            >
              <span className="admin-mobile-menu-icon" aria-hidden>
                <span />
                <span />
                <span />
              </span>
            </button>
          </div>
          <button
            type="button"
            aria-label="Close menu overlay"
            hidden={!mobileMenuOpen}
            className={`admin-mobile-overlay ${mobileMenuOpen ? "is-open" : ""}`}
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className={`admin-sidebar ${mobileMenuOpen ? "is-open" : ""}`}>
            <div className="admin-sidebar-title">Admin Panel</div>
            <nav className="admin-nav">
              {items.map((item) => {
                const isActive = isNavItemActive(pathname, item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    prefetch={false}
                    className={`admin-nav-link ${isActive ? "is-active" : ""}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="admin-nav-icon"><SidebarIcon name={item.icon} /></span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="admin-sidebar-footer">
              <AdminLogoutButton />
            </div>
          </aside>
          <main className="admin-main">{children}</main>
        </div>
      )}
    </div>
  );
}
