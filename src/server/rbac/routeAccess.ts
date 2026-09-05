import type { AdminPermission } from "@/src/server/rbac/permissions";

export type AdminNavPermission = AdminPermission | readonly AdminPermission[];

/** Sidebar + page access: need ANY of these to see the module. */
export const ADMIN_NAV_ACCESS: ReadonlyArray<{
  label: string;
  href: string;
  icon: string;
  anyOf: readonly AdminPermission[];
}> = [
  { label: "Dashboard", href: "/admin", icon: "dashboard", anyOf: ["dashboard.view"] },
  { label: "News", href: "/admin/news", icon: "news", anyOf: ["news.view"] },
  {
    label: "News Categories",
    href: "/admin/news-categories",
    icon: "news",
    anyOf: ["news.view"],
  },
  { label: "Pages", href: "/admin/pages", icon: "pages", anyOf: ["pages.view"] },
  {
    label: "Game Articles",
    href: "/admin/game-articles",
    icon: "gameArticles",
    anyOf: ["gameArticles.view"],
  },
  {
    label: "Page Cards",
    href: "/admin/home-cards",
    icon: "homeCards",
    anyOf: ["homeCards.view"],
  },
  {
    label: "Advance Server",
    href: "/admin/advance-server",
    icon: "advanceServer",
    anyOf: ["advanceServer.view"],
  },
  {
    label: "BGMI Lite Redeem",
    href: "/admin/bgmi-lite-redeem",
    icon: "bgmiLiteRedeem",
    anyOf: ["bgmiLiteRedeem.view"],
  },
  {
    label: "BGMI Lite APK",
    href: "/admin/bgmi-lite-apk",
    icon: "bgmiLiteApk",
    anyOf: ["bgmiLiteApk.view"],
  },
  {
    label: "PUBG Lite Redeem",
    href: "/admin/pubg-mobile-lite-redeem",
    icon: "pubgMobileLiteRedeem",
    anyOf: ["pubgMobileLiteRedeem.view"],
  },
  {
    label: "FF Redeem",
    href: "/admin/free-fire-redeem",
    icon: "freeFireRedeem",
    anyOf: ["freeFireRedeem.view"],
  },
  {
    label: "FF Max Redeem",
    href: "/admin/free-fire-max-redeem",
    icon: "freeFireMaxRedeem",
    anyOf: ["freeFireMaxRedeem.view"],
  },
  {
    label: "BGMI Lite Stylish Name",
    href: "/admin/bgmi-lite-stylish",
    icon: "bgmiLiteStylish",
    anyOf: ["bgmiLiteStylish.view"],
  },
  {
    label: "PUBG Lite Name",
    href: "/admin/pubg-mobile-lite-name",
    icon: "pubgMobileLiteName",
    anyOf: ["pubgMobileLiteName.view"],
  },
  {
    label: "FF Names",
    href: "/admin/free-fire-stylish",
    icon: "freeFireStylish",
    anyOf: ["freeFireStylish.view"],
  },
  {
    label: "FF Max Names",
    href: "/admin/free-fire-max-stylish",
    icon: "freeFireMaxStylish",
    anyOf: ["freeFireMaxStylish.view"],
  },
  { label: "Game FAQs", href: "/admin/game-faqs", icon: "gameFaqs", anyOf: ["gameFaqs.view"] },
  { label: "Legal Pages", href: "/admin/legal-pages", icon: "legal", anyOf: ["legal.view"] },
  { label: "Comments", href: "/admin/comments", icon: "comments", anyOf: ["comments.view"] },
  { label: "Contact", href: "/admin/contact", icon: "contact", anyOf: ["contact.view"] },
  {
    label: "Testimonials",
    href: "/admin/testimonials",
    icon: "testimonials",
    anyOf: ["testimonials.view"],
  },
  {
    label: "Notifications",
    href: "/admin/notifications",
    icon: "notifications",
    anyOf: ["notifications.view"],
  },
  {
    label: "Auto Notify",
    href: "/admin/auto-notify",
    icon: "notifications",
    anyOf: ["notifications.view"],
  },
  { label: "Ratings", href: "/admin/ratings", icon: "ratings", anyOf: ["ratings.view"] },
  { label: "Ads", href: "/admin/ad-placements", icon: "ads", anyOf: ["ads.view"] },
  { label: "Media", href: "/admin/media", icon: "media", anyOf: ["media.view"] },
  {
    label: "Backups",
    href: "/admin/backups",
    icon: "backups",
    anyOf: ["backups.download", "backups.restore"],
  },
  { label: "Users", href: "/admin/users", icon: "users", anyOf: ["users.manage"] },
  {
    label: "Roles & Permissions",
    href: "/admin/roles",
    icon: "users",
    anyOf: ["users.manage"],
  },
  { label: "Audit", href: "/admin/audit", icon: "audit", anyOf: ["audit.view"] },
  { label: "System", href: "/admin/system", icon: "system", anyOf: ["system.view"] },
  { label: "Settings", href: "/admin/settings", icon: "settings", anyOf: ["settings.view"] },
];

export function pagePermissionForPath(pathname: string): readonly AdminPermission[] | null {
  const path = pathname.replace(/\/$/, "") || "/admin";
  if (path === "/admin/login") return null;
  const exact = ADMIN_NAV_ACCESS.find((item) => item.href === path);
  if (exact) return exact.anyOf;
  // Nested admin paths (rare) — match longest prefix.
  const nested = [...ADMIN_NAV_ACCESS]
    .filter((item) => item.href !== "/admin" && path.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];
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

  if (path.startsWith("/api/admin/pubg-mobile-lite-redeem")) {
    if (isRead) return { type: "permission", permission: "pubgMobileLiteRedeem.view" };
    return { type: "permission", permission: "pubgMobileLiteRedeem.edit" };
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

  if (path.startsWith("/api/admin/media")) {
    if (isRead) return { type: "permission", permission: "media.view" };
    if (isDelete) return { type: "permission", permission: "media.delete" };
    if (path.includes("/upload") || path.includes("/convert")) {
      return { type: "permission", permission: "media.upload" };
    }
    // defaults / other writes
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

  // Fail closed for anything else under /api/admin (except auth allowlist handled in middleware).
  return { type: "deny" };
}
