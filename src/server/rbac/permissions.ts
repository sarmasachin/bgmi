/**
 * RBAC Phase 1 — permission catalog + pure helpers.
 * Enforcement on routes/sidebar comes in later phases.
 */
export const ADMIN_ROLES = ["superadmin", "subadmin"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];
/**
 * Normalize role strings. Fail closed: unknown/empty → subadmin (least privilege).
 * Legacy DB value `"admin"` is treated as superadmin.
 */
export function normalizeAdminRole(role: unknown): AdminRole {
  const raw = typeof role === "string" ? role.trim().toLowerCase() : "";
  if (raw === "superadmin" || raw === "admin") return "superadmin";
  if (raw === "subadmin") return "subadmin";
  return "subadmin";
}
export function isSuperAdminRole(role: unknown): boolean {
  return normalizeAdminRole(role) === "superadmin";
}
export const ADMIN_PERMISSIONS = [
  "dashboard.view",
  "news.view",
  "news.edit",
  "news.delete",
  "pages.view",
  "pages.edit",
  "gameArticles.view",
  "gameArticles.edit",
  "gta6.view",
  "gta6.edit",
  "homeCards.view",
  "homeCards.edit",
  "advanceServer.view",
  "advanceServer.edit",
  "bgmiLiteRedeem.view",
  "bgmiLiteRedeem.edit",
  "pubgMobileLiteRedeem.view",
  "pubgMobileLiteRedeem.edit",
  "freeFireRedeem.view",
  "freeFireRedeem.edit",
  "freeFireIndiaRedeem.view",
  "freeFireIndiaRedeem.edit",
  "freeFireMaxRedeem.view",
  "freeFireMaxRedeem.edit",
  "bgmiLiteStylish.view",
  "bgmiLiteStylish.edit",
  "bgmiLiteApk.view",
  "bgmiLiteApk.edit",
  "bgmiApk.view",
  "bgmiApk.edit",
  "pubgApk.view",
  "pubgApk.edit",
  "freeFireApk.view",
  "freeFireApk.edit",
  "freeFireIndiaApk.view",
  "freeFireIndiaApk.edit",
  "freeFireMaxApk.view",
  "freeFireMaxApk.edit",
  "bgmiRedeem.view",
  "bgmiRedeem.edit",
  "pubgRedeem.view",
  "pubgRedeem.edit",
  "pubgMobileLiteName.view",
  "pubgMobileLiteName.edit",
  "freeFireStylish.view",
  "freeFireStylish.edit",
  "freeFireIndiaStylish.view",
  "freeFireIndiaStylish.edit",
  "freeFireMaxStylish.view",
  "freeFireMaxStylish.edit",
  "gameFaqs.view",
  "gameFaqs.edit",
  "legal.view",
  "legal.edit",
  "comments.view",
  "comments.moderate",
  "contact.view",
  "contact.reply",
  "contact.delete",
  "testimonials.view",
  "testimonials.edit",
  "notifications.view",
  "notifications.edit",
  "ratings.view",
  "ratings.edit",
  "ads.view",
  "ads.edit",
  "media.view",
  "media.upload",
  "media.delete",
  "settings.view",
  "settings.edit",
  "audit.view",
  "audit.delete",
  "users.manage",
  "backups.download",
  "backups.restore",
  "system.view",
] as const;
export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number];
export const ALL_ADMIN_PERMISSIONS: readonly AdminPermission[] = ADMIN_PERMISSIONS;
const PERMISSION_SET = new Set<string>(ADMIN_PERMISSIONS);
export function isAdminPermission(value: unknown): value is AdminPermission {
  return typeof value === "string" && PERMISSION_SET.has(value);
}
/** Keep only known permission strings; drop junk / typos. */
export function normalizePermissionList(raw: unknown): AdminPermission[] {
  if (!Array.isArray(raw)) return [];
  const out: AdminPermission[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    if (!isAdminPermission(item) || seen.has(item)) continue;
    seen.add(item);
    out.push(item);
  }
  return out;
}
/** Permissions that must never be granted to subadmin. */
export const SUPERADMIN_ONLY_PERMISSIONS: readonly AdminPermission[] = [
  "audit.delete",
  "users.manage",
  "backups.download",
  "backups.restore",
  "system.view",
];
const SUPERADMIN_ONLY_SET = new Set<string>(SUPERADMIN_ONLY_PERMISSIONS);
/**
 * Effective permissions for a user.
 * Superadmin always gets the full catalog (DB list ignored).
 * Subadmin gets only stored checkboxes (never users/backups/system).
 */
export function resolvePermissions(role: unknown, stored: unknown): AdminPermission[] {
  if (isSuperAdminRole(role)) {
    return [...ALL_ADMIN_PERMISSIONS];
  }
  return normalizePermissionList(stored).filter((p) => !SUPERADMIN_ONLY_SET.has(p));
}
export type AdminAuthSubject = {
  role: AdminRole;
  permissions: readonly AdminPermission[];
};
export function can(subject: AdminAuthSubject | null | undefined, permission: AdminPermission): boolean {
  if (!subject) return false;
  if (isSuperAdminRole(subject.role)) return true;
  return subject.permissions.includes(permission);
}
export function canAny(
  subject: AdminAuthSubject | null | undefined,
  permissions: readonly AdminPermission[],
): boolean {
  return permissions.some((p) => can(subject, p));
}
export function canAll(
  subject: AdminAuthSubject | null | undefined,
  permissions: readonly AdminPermission[],
): boolean {
  return permissions.every((p) => can(subject, p));
}

export {
  ADMIN_PERMISSION_MODULES,
  ADMIN_PERMISSION_PRESETS,
  sanitizeSubadminPermissions,
} from "@/src/server/rbac/adminPermissionCatalog";

export function permissionActionLabel(permission: AdminPermission): string {
  const action = permission.split(".")[1] ?? permission;
  if (action === "view") return "View";
  if (action === "edit") return "Edit";
  if (action === "delete") return "Delete";
  if (action === "moderate") return "Moderate";
  if (action === "reply") return "Reply";
  if (action === "upload") return "Upload";
  if (action === "manage") return "Manage";
  if (action === "download") return "Download";
  if (action === "restore") return "Restore";
  return action;
}