import type { AdminPermission } from "@/src/server/rbac/permissions";

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
  {
    id: "gta6",
    label: "GTA 6",
    permissions: ["gta6.view", "gta6.edit"],
  },
  {
    id: "homeCards",
    label: "Page Cards",
    permissions: ["homeCards.view", "homeCards.edit"],
  },
  {
    id: "advanceServer",
    label: "Advance Server",
    permissions: ["advanceServer.view", "advanceServer.edit"],
  },
  {
    id: "bgmiLiteRedeem",
    label: "BGMI Air Redeem",
    permissions: ["bgmiLiteRedeem.view", "bgmiLiteRedeem.edit"],
  },
  {
    id: "pubgMobileLiteRedeem",
    label: "PUBG Mobile Flash Redeem",
    permissions: ["pubgMobileLiteRedeem.view", "pubgMobileLiteRedeem.edit"],
  },
  {
    id: "freeFireRedeem",
    label: "Free Fire Redeem",
    permissions: ["freeFireRedeem.view", "freeFireRedeem.edit"],
  },
  {
    id: "freeFireIndiaRedeem",
    label: "FF India Redeem",
    permissions: ["freeFireIndiaRedeem.view", "freeFireIndiaRedeem.edit"],
  },
  {
    id: "freeFireMaxRedeem",
    label: "Free Fire Max Redeem",
    permissions: ["freeFireMaxRedeem.view", "freeFireMaxRedeem.edit"],
  },
  {
    id: "bgmiLiteStylish",
    label: "BGMI Air Stylish Name",
    permissions: ["bgmiLiteStylish.view", "bgmiLiteStylish.edit"],
  },
  {
    id: "bgmiLiteApk",
    label: "BGMI Air APK",
    permissions: ["bgmiLiteApk.view", "bgmiLiteApk.edit"],
  },
  {
    id: "bgmiApk",
    label: "BGMI APK",
    permissions: ["bgmiApk.view", "bgmiApk.edit"],
  },
  {
    id: "pubgApk",
    label: "PUBG APK",
    permissions: ["pubgApk.view", "pubgApk.edit"],
  },
  {
    id: "freeFireApk",
    label: "FF Apk",
    permissions: ["freeFireApk.view", "freeFireApk.edit"],
  },
  {
    id: "freeFireIndiaApk",
    label: "FF India Apk",
    permissions: ["freeFireIndiaApk.view", "freeFireIndiaApk.edit"],
  },
  {
    id: "freeFireMaxApk",
    label: "FF Max Apk",
    permissions: ["freeFireMaxApk.view", "freeFireMaxApk.edit"],
  },
  {
    id: "bgmiRedeem",
    label: "BGMI Redeem",
    permissions: ["bgmiRedeem.view", "bgmiRedeem.edit"],
  },
  {
    id: "pubgRedeem",
    label: "PUBG Redeem",
    permissions: ["pubgRedeem.view", "pubgRedeem.edit"],
  },
  {
    id: "pubgMobileLiteName",
    label: "PUBG Mobile Flash Name",
    permissions: ["pubgMobileLiteName.view", "pubgMobileLiteName.edit"],
  },
  {
    id: "freeFireStylish",
    label: "Free Fire Stylish Name",
    permissions: ["freeFireStylish.view", "freeFireStylish.edit"],
  },
  {
    id: "freeFireIndiaStylish",
    label: "FF India Names",
    permissions: ["freeFireIndiaStylish.view", "freeFireIndiaStylish.edit"],
  },
  {
    id: "freeFireMaxStylish",
    label: "Free Fire Max Stylish Name",
    permissions: ["freeFireMaxStylish.view", "freeFireMaxStylish.edit"],
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
  {
    id: "audit",
    label: "Audit",
    permissions: ["audit.view", "audit.delete"],
    superadminOnly: true,
  },
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