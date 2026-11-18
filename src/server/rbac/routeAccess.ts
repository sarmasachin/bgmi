import type { AdminPermission } from "@/src/server/rbac/permissions";
import { ADMIN_NAV_ACCESS } from "@/src/server/rbac/adminNav";

export type AdminNavPermission = AdminPermission | readonly AdminPermission[];
export { ADMIN_NAV_ACCESS };
function navHrefPath(href: string): string {
  const path = href.split("?")[0] ?? href;
  return path.replace(/\/$/, "") || "/admin";
}

export function pagePermissionForPath(pathname: string): readonly AdminPermission[] | null {
  const path = pathname.replace(/\/$/, "") || "/admin";
  if (path === "/admin/login") return null;
  const exact = ADMIN_NAV_ACCESS.find((item) => navHrefPath(item.href) === path);
  if (exact) return exact.anyOf;
  // Nested admin paths (rare) — match longest prefix.
  const nested = [...ADMIN_NAV_ACCESS]
    .filter((item) => {
      const href = navHrefPath(item.href);
      return href !== "/admin" && path.startsWith(`${href}/`);
    })
    .sort((a, b) => navHrefPath(b.href).length - navHrefPath(a.href).length)[0];
  return nested?.anyOf ?? ["dashboard.view"];
}

export type AdminApiPermissionResult =
  | { type: "auth-only" }
  | { type: "permission"; permission: AdminPermission }
  | { type: "any"; permissions: readonly AdminPermission[] }
  | { type: "deny" };

/**
 * Resolve required permission for an admin API path + HTTP method.
 * Unknown admin APIs deny by default (fail closed).
 */
export function resolveAdminApiPermission(
  pathname: string,
  method: string,
): AdminApiPermissionResult {
  const path = pathname.replace(/\/$/, "") || pathname;
  const m = method.toUpperCase();
  const isRead = m === "GET" || m === "HEAD";
  const isDelete = m === "DELETE";

  // Session probe endpoints — any logged-in admin.
  if (path === "/api/admin/me" || path === "/api/admin/system/health") {
    return { type: "auth-only" };
  }

  if (path === "/api/admin/users" || path.startsWith("/api/admin/users/")) {
    return { type: "permission", permission: "users.manage" };
  }

  if (path === "/api/admin/roles" || path.startsWith("/api/admin/roles/")) {
    return { type: "permission", permission: "users.manage" };
  }

  if (path === "/api/admin/backup/download") {
    return { type: "permission", permission: "backups.download" };
  }
  if (path === "/api/admin/backup/restore") {
    return { type: "permission", permission: "backups.restore" };
  }

  if (path === "/api/admin/audit" || path.startsWith("/api/admin/audit/")) {
    if (isDelete) return { type: "permission", permission: "audit.delete" };
    return { type: "permission", permission: "audit.view" };
  }

  if (path.startsWith("/api/admin/news")) {
    if (isRead) return { type: "permission", permission: "news.view" };
    if (isDelete) return { type: "permission", permission: "news.delete" };
    return { type: "permission", permission: "news.edit" };
  }

  if (path.startsWith("/api/admin/pages")) {
    if (isRead) return { type: "permission", permission: "pages.view" };
    return { type: "permission", permission: "pages.edit" };
  }

  if (path.startsWith("/api/admin/game-articles")) {
    if (isRead) return { type: "permission", permission: "gameArticles.view" };
    return { type: "permission", permission: "gameArticles.edit" };
  }

  if (path.startsWith("/api/admin/gta-6")) {
    if (isRead) return { type: "permission", permission: "gta6.view" };
    return { type: "permission", permission: "gta6.edit" };
  }

  if (path.startsWith("/api/admin/home-cards")) {
    if (isRead) return { type: "permission", permission: "homeCards.view" };
    return { type: "permission", permission: "homeCards.edit" };
  }
  if (path.startsWith("/api/admin/advance-server")) {
    if (isRead) return { type: "permission", permission: "advanceServer.view" };
    return { type: "permission", permission: "advanceServer.edit" };
  }
  if (path.startsWith("/api/admin/bgmi-lite-redeem")) {
    if (isRead) return { type: "permission", permission: "bgmiLiteRedeem.view" };
    return { type: "permission", permission: "bgmiLiteRedeem.edit" };
  }
  if (path.startsWith("/api/admin/bgmi-lite-apk")) {
    if (isRead) return { type: "permission", permission: "bgmiLiteApk.view" };
    return { type: "permission", permission: "bgmiLiteApk.edit" };
  }
  if (path.startsWith("/api/admin/bgmi-apk")) {
    if (isRead) return { type: "permission", permission: "bgmiApk.view" };
    return { type: "permission", permission: "bgmiApk.edit" };
  }
  if (path.startsWith("/api/admin/pubg-mobile-lite-apk")) {
    if (isRead) return { type: "permission", permission: "pubgApk.view" };
    return { type: "permission", permission: "pubgApk.edit" };
  }
  if (path.startsWith("/api/admin/pubg-apk")) {
    if (isRead) return { type: "permission", permission: "pubgApk.view" };
    return { type: "permission", permission: "pubgApk.edit" };
  }

  if (path.startsWith("/api/admin/free-fire-india-apk")) {
    if (isRead) return { type: "permission", permission: "freeFireIndiaApk.view" };
    return { type: "permission", permission: "freeFireIndiaApk.edit" };
  }

  if (path.startsWith("/api/admin/free-fire-apk")) {
    if (isRead) return { type: "permission", permission: "freeFireApk.view" };
    return { type: "permission", permission: "freeFireApk.edit" };
  }

  if (path.startsWith("/api/admin/free-fire-max-apk")) {
    if (isRead) return { type: "permission", permission: "freeFireMaxApk.view" };
    return { type: "permission", permission: "freeFireMaxApk.edit" };
  }

  if (path.startsWith("/api/admin/bgmi-redeem")) {
    if (isRead) return { type: "permission", permission: "bgmiRedeem.view" };
    return { type: "permission", permission: "bgmiRedeem.edit" };
  }

  if (path.startsWith("/api/admin/pubg-redeem")) {
    if (isRead) return { type: "permission", permission: "pubgRedeem.view" };
    return { type: "permission", permission: "pubgRedeem.edit" };
  }

  if (path.startsWith("/api/admin/pubg-mobile-lite-redeem")) {
    if (isRead) return { type: "permission", permission: "pubgMobileLiteRedeem.view" };
    return { type: "permission", permission: "pubgMobileLiteRedeem.edit" };
  }

  if (path.startsWith("/api/admin/free-fire-india-redeem")) {
    if (isRead) return { type: "permission", permission: "freeFireIndiaRedeem.view" };
    return { type: "permission", permission: "freeFireIndiaRedeem.edit" };
  }

  if (path.startsWith("/api/admin/free-fire-max-redeem")) {
    if (isRead) return { type: "permission", permission: "freeFireMaxRedeem.view" };
    return { type: "permission", permission: "freeFireMaxRedeem.edit" };
  }

  if (path.startsWith("/api/admin/free-fire-redeem")) {
    if (isRead) return { type: "permission", permission: "freeFireRedeem.view" };
    return { type: "permission", permission: "freeFireRedeem.edit" };
  }

  if (path.startsWith("/api/admin/bgmi-lite-stylish")) {
    if (isRead) return { type: "permission", permission: "bgmiLiteStylish.view" };
    return { type: "permission", permission: "bgmiLiteStylish.edit" };
  }

  if (path.startsWith("/api/admin/pubg-mobile-lite-name")) {
    if (isRead) return { type: "permission", permission: "pubgMobileLiteName.view" };
    return { type: "permission", permission: "pubgMobileLiteName.edit" };
  }

  if (path.startsWith("/api/admin/free-fire-india-stylish")) {
    if (isRead) return { type: "permission", permission: "freeFireIndiaStylish.view" };
    return { type: "permission", permission: "freeFireIndiaStylish.edit" };
  }

  if (path.startsWith("/api/admin/free-fire-max-stylish")) {
    if (isRead) return { type: "permission", permission: "freeFireMaxStylish.view" };
    return { type: "permission", permission: "freeFireMaxStylish.edit" };
  }

  if (path.startsWith("/api/admin/free-fire-stylish")) {
    if (isRead) return { type: "permission", permission: "freeFireStylish.view" };
    return { type: "permission", permission: "freeFireStylish.edit" };
  }

  if (path.startsWith("/api/admin/game-faqs") || path === "/api/admin/faq") {
    if (isRead) return { type: "permission", permission: "gameFaqs.view" };
    return { type: "permission", permission: "gameFaqs.edit" };
  }

  if (path.startsWith("/api/admin/legal-pages")) {
    if (isRead) return { type: "permission", permission: "legal.view" };
    return { type: "permission", permission: "legal.edit" };
  }

  if (path.startsWith("/api/admin/comments")) {
    if (isRead) return { type: "permission", permission: "comments.view" };
    return { type: "permission", permission: "comments.moderate" };
  }

  if (path.startsWith("/api/admin/contact")) {
    if (isRead) return { type: "permission", permission: "contact.view" };
    if (isDelete) return { type: "permission", permission: "contact.delete" };
    return { type: "permission", permission: "contact.reply" };
  }

  if (path.startsWith("/api/admin/testimonials")) {
    if (isRead) return { type: "permission", permission: "testimonials.view" };
    return { type: "permission", permission: "testimonials.edit" };
  }

  if (path.startsWith("/api/admin/notifications") || path.startsWith("/api/admin/auto-notify") || path.startsWith("/api/admin/email-campaign-settings")) {
    if (isRead) return { type: "permission", permission: "notifications.view" };
    return { type: "permission", permission: "notifications.edit" };
  }

  if (path.startsWith("/api/admin/ratings")) {
    if (isRead) return { type: "permission", permission: "ratings.view" };
    return { type: "permission", permission: "ratings.edit" };
  }

  if (path.startsWith("/api/admin/ad-units")) {
    if (isRead) return { type: "permission", permission: "ads.view" };
    return { type: "permission", permission: "ads.edit" };
  }

  if (path.startsWith("/api/admin/apk-file")) {
    return {
      type: "any",
      permissions: ["freeFireApk.edit", "freeFireIndiaApk.edit", "freeFireMaxApk.edit"],
    };
  }

  if (path.startsWith("/api/admin/media")) {
    if (isRead) return { type: "permission", permission: "media.view" };
    if (isDelete) return { type: "permission", permission: "media.delete" };
    if (path.includes("/upload") || path.includes("/convert")) {
      return { type: "permission", permission: "media.upload" };
    }
    return { type: "any", permissions: ["media.upload", "media.delete"] };
  }

  if (
    path.startsWith("/api/admin/settings") ||
    path.startsWith("/api/admin/head-snippets") ||
    path.startsWith("/api/admin/calculator-phone-models")
  ) {
    if (isRead) return { type: "permission", permission: "settings.view" };
    return { type: "permission", permission: "settings.edit" };
  }

  // Fail closed for anything else under /api/admin.
  return { type: "deny" };
}
