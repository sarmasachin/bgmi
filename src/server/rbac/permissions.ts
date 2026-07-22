/**
 * RBAC Phase 1 — permission catalog + pure helpers.
 * Enforcement on routes/sidebar comes in later phases.
 */

export const ADMIN_ROLES = ["superadmin", "subadmin"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

/** Legacy DB value `"admin"` is treated as superadmin. */
export function normalizeAdminRole(role: unknown): AdminRole {
  const raw = typeof role === "string" ? role.trim().toLowerCase() : "";
  if (raw === "subadmin") return "subadmin";
  // "admin", "superadmin", empty, unknown → superadmin (safe default for Phase 1)
  return "superadmin";
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

/**
 * Effective permissions for a user.
 * Superadmin always gets the full catalog (DB list ignored).
 * Subadmin gets only stored checkboxes (never users/backups/system).
 */
export function resolvePermissions(role: unknown, stored: unknown): AdminPermission[] {
  if (isSuperAdminRole(role)) {
    return [...ALL_ADMIN_PERMISSIONS];
  }
  const superOnly = new Set<string>([
    "users.manage",
    "backups.download",
    "backups.restore",
    "system.view",
  ]);
  return normalizePermissionList(stored).filter((p) => !superOnly.has(p));
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

/** Modules shown as checkbox groups in Phase 2 UI. */
export const ADMIN_PERMISSION_MODULES: ReadonlyArray<{
  id: string;
  label: string;
  permissions: readonly AdminPermission[];
  superadminOnly?: boolean;
}> = [
  { id: "dashboard", label: "Dashboard", permissions: ["dashboard.view"] },
  { id: "news", label: "News", permissions: ["news.view", "news.edit", "news.delete"] },
  { id: "pages", label: "Pages", permissions: ["pages.view", "pages.edit"] },
  {
    id: "gameArticles",
    label: "Game Articles",
    permissions: ["gameArticles.view", "gameArticles.edit"],
  },
  { id: "gameFaqs", label: "Game FAQs", permissions: ["gameFaqs.view", "gameFaqs.edit"] },
  { id: "legal", label: "Legal Pages", permissions: ["legal.view", "legal.edit"] },
  {
    id: "comments",
    label: "Comments",
    permissions: ["comments.view", "comments.moderate"],
  },
  {
    id: "contact",
    label: "Contact",
    permissions: ["contact.view", "contact.reply", "contact.delete"],
  },
  {
    id: "testimonials",
    label: "Testimonials",
    permissions: ["testimonials.view", "testimonials.edit"],
  },
  {
    id: "notifications",
    label: "Notifications",
    permissions: ["notifications.view", "notifications.edit"],
  },
  { id: "ratings", label: "Ratings", permissions: ["ratings.view", "ratings.edit"] },
  { id: "ads", label: "Ads", permissions: ["ads.view", "ads.edit"] },
  {
    id: "media",
    label: "Media",
    permissions: ["media.view", "media.upload", "media.delete"],
  },
  { id: "settings", label: "Settings", permissions: ["settings.view", "settings.edit"] },
  { id: "audit", label: "Audit", permissions: ["audit.view"] },
  {
    id: "users",
    label: "Users & RBAC",
    permissions: ["users.manage"],
    superadminOnly: true,
  },
  {
    id: "backups",
    label: "Backups",
    permissions: ["backups.download", "backups.restore"],
    superadminOnly: true,
  },
  { id: "system", label: "System", permissions: ["system.view"], superadminOnly: true },
];

/** Permissions that must never be granted to subadmin. */
export const SUPERADMIN_ONLY_PERMISSIONS: readonly AdminPermission[] = [
  "users.manage",
  "backups.download",
  "backups.restore",
  "system.view",
];

const SUPERADMIN_ONLY_SET = new Set<string>(SUPERADMIN_ONLY_PERMISSIONS);

/** Strip users/backups/system from a subadmin checkbox list. */
export function sanitizeSubadminPermissions(raw: unknown): AdminPermission[] {
  return normalizePermissionList(raw).filter((p) => !SUPERADMIN_ONLY_SET.has(p));
}

/** One-click presets for the Phase 2 checkbox UI. */
export const ADMIN_PERMISSION_PRESETS: ReadonlyArray<{
  id: string;
  label: string;
  permissions: readonly AdminPermission[];
}> = [
  {
    id: "content",
    label: "Content editor",
    permissions: [
      "dashboard.view",
      "news.view",
      "news.edit",
      "news.delete",
      "pages.view",
      "pages.edit",
      "gameArticles.view",
      "gameArticles.edit",
      "gameFaqs.view",
      "gameFaqs.edit",
      "legal.view",
      "legal.edit",
      "media.view",
      "media.upload",
      "media.delete",
    ],
  },
  {
    id: "support",
    label: "Support agent",
    permissions: [
      "dashboard.view",
      "contact.view",
      "contact.reply",
      "contact.delete",
      "comments.view",
      "comments.moderate",
    ],
  },
  {
    id: "ads",
    label: "Ads manager",
    permissions: ["dashboard.view", "ads.view", "ads.edit", "media.view", "media.upload"],
  },
];

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