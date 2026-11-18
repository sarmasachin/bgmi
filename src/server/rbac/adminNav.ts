import type { AdminPermission } from "@/src/server/rbac/permissions";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: string;
  anyOf: readonly AdminPermission[];
  /** Game folder in the sidebar. Items without this stay top-level links. */
  menuGroup?: string;
  /** Short label shown under the game folder. */
  menuLabel?: string;
};

export const ADMIN_MENU_GROUPS: ReadonlyArray<{ id: string; label: string }> = [
  { id: "ff-india", label: "Free Fire India" },
  { id: "ff", label: "Free Fire" },
  { id: "ff-max", label: "Free Fire Max" },
  { id: "pubg", label: "PUBG Mobile" },
  { id: "pubg-flash", label: "PUBG Flash" },
  { id: "bgmi", label: "BGMI" },
  { id: "bgmi-air", label: "BGMI Air" },
  { id: "gta6", label: "GTA 6" },
];

function game(
  group: string,
  menuLabel: string,
  item: Omit<AdminNavItem, "menuGroup" | "menuLabel">,
): AdminNavItem {
  return { ...item, menuGroup: group, menuLabel };
}

/** Sidebar + page access: need ANY of these to see the module. */
export const ADMIN_NAV_ACCESS: readonly AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: "dashboard", anyOf: ["dashboard.view"] },
  { label: "News", href: "/admin/news", icon: "news", anyOf: ["news.view"] },
  { label: "News Categories", href: "/admin/news-categories", icon: "news", anyOf: ["news.view"] },
  { label: "Pages", href: "/admin/pages", icon: "pages", anyOf: ["pages.view"] },
  { label: "Game Articles", href: "/admin/game-articles", icon: "gameArticles", anyOf: ["gameArticles.view"] },
  { label: "Page Cards", href: "/admin/home-cards", icon: "homeCards", anyOf: ["homeCards.view"] },
  game("ff-india", "APK", {
    label: "FF India Apk",
    href: "/admin/free-fire-india-apk",
    icon: "freeFireApk",
    anyOf: ["freeFireIndiaApk.view"],
  }),
  game("ff-india", "Redeem", {
    label: "FF India Redeem",
    href: "/admin/free-fire-india-redeem",
    icon: "freeFireRedeem",
    anyOf: ["freeFireIndiaRedeem.view"],
  }),
  game("ff-india", "Names", {
    label: "FF India Names",
    href: "/admin/free-fire-india-stylish",
    icon: "freeFireStylish",
    anyOf: ["freeFireIndiaStylish.view"],
  }),
  game("ff", "APK", {
    label: "FF Apk",
    href: "/admin/free-fire-apk",
    icon: "freeFireApk",
    anyOf: ["freeFireApk.view"],
  }),
  game("ff", "Redeem", {
    label: "FF Redeem",
    href: "/admin/free-fire-redeem",
    icon: "freeFireRedeem",
    anyOf: ["freeFireRedeem.view"],
  }),
  game("ff", "Names", {
    label: "FF Names",
    href: "/admin/free-fire-stylish",
    icon: "freeFireStylish",
    anyOf: ["freeFireStylish.view"],
  }),
  game("ff", "Advance Server", {
    label: "Advance Server",
    href: "/admin/advance-server",
    icon: "advanceServer",
    anyOf: ["advanceServer.view"],
  }),
  game("ff-max", "APK", {
    label: "FF Max Apk",
    href: "/admin/free-fire-max-apk",
    icon: "freeFireMaxApk",
    anyOf: ["freeFireMaxApk.view"],
  }),
  game("ff-max", "Redeem", {
    label: "FF Max Redeem",
    href: "/admin/free-fire-max-redeem",
    icon: "freeFireMaxRedeem",
    anyOf: ["freeFireMaxRedeem.view"],
  }),
  game("ff-max", "Names", {
    label: "FF Max Names",
    href: "/admin/free-fire-max-stylish",
    icon: "freeFireMaxStylish",
    anyOf: ["freeFireMaxStylish.view"],
  }),
  game("pubg", "APK", {
    label: "PUBG APK",
    href: "/admin/pubg-apk",
    icon: "pubgApk",
    anyOf: ["pubgApk.view"],
  }),
  game("pubg", "Redeem", {
    label: "PUBG Redeem",
    href: "/admin/pubg-redeem",
    icon: "pubgRedeem",
    anyOf: ["pubgRedeem.view"],
  }),
  game("pubg-flash", "APK", {
    label: "PUBG Flash APK",
    href: "/admin/pubg-mobile-lite-apk",
    icon: "pubgApk",
    anyOf: ["pubgApk.view"],
  }),
  game("pubg-flash", "Redeem", {
    label: "PUBG Flash Redeem",
    href: "/admin/pubg-mobile-lite-redeem",
    icon: "pubgMobileLiteRedeem",
    anyOf: ["pubgMobileLiteRedeem.view"],
  }),
  game("pubg-flash", "Name", {
    label: "PUBG Flash Name",
    href: "/admin/pubg-mobile-lite-name",
    icon: "pubgMobileLiteName",
    anyOf: ["pubgMobileLiteName.view"],
  }),
  game("bgmi", "APK", {
    label: "BGMI APK",
    href: "/admin/bgmi-apk",
    icon: "bgmiApk",
    anyOf: ["bgmiApk.view"],
  }),
  game("bgmi", "Redeem", {
    label: "BGMI Redeem",
    href: "/admin/bgmi-redeem",
    icon: "bgmiRedeem",
    anyOf: ["bgmiRedeem.view"],
  }),
  game("bgmi-air", "APK", {
    label: "BGMI Air APK",
    href: "/admin/bgmi-lite-apk",
    icon: "bgmiLiteApk",
    anyOf: ["bgmiLiteApk.view"],
  }),
  game("bgmi-air", "Redeem", {
    label: "BGMI Air Redeem",
    href: "/admin/bgmi-lite-redeem",
    icon: "bgmiLiteRedeem",
    anyOf: ["bgmiLiteRedeem.view"],
  }),
  game("bgmi-air", "Stylish Name", {
    label: "BGMI Air Stylish Name",
    href: "/admin/bgmi-lite-stylish",
    icon: "bgmiLiteStylish",
    anyOf: ["bgmiLiteStylish.view"],
  }),
  game("gta6", "Calculator", {
    label: "GTA 6 Calculator",
    href: "/admin/gta-6?tab=home",
    icon: "pages",
    anyOf: ["gta6.view"],
  }),
  game("gta6", "Details", {
    label: "GTA 6 Details",
    href: "/admin/gta-6?tab=details",
    icon: "pages",
    anyOf: ["gta6.view"],
  }),
  game("gta6", "Map", {
    label: "GTA 6 Map",
    href: "/admin/gta-6?tab=map",
    icon: "pages",
    anyOf: ["gta6.view"],
  }),
  game("gta6", "Cheats", {
    label: "GTA 6 Cheats",
    href: "/admin/gta-6?tab=cheats",
    icon: "pages",
    anyOf: ["gta6.view"],
  }),
  game("gta6", "GT6 APK", {
    label: "GTA 6 APK",
    href: "/admin/gta-6?tab=apk",
    icon: "pages",
    anyOf: ["gta6.view"],
  }),
  { label: "Game FAQs", href: "/admin/game-faqs", icon: "gameFaqs", anyOf: ["gameFaqs.view"] },
  { label: "Legal Pages", href: "/admin/legal-pages", icon: "legal", anyOf: ["legal.view"] },
  { label: "Comments", href: "/admin/comments", icon: "comments", anyOf: ["comments.view"] },
  { label: "Contact", href: "/admin/contact", icon: "contact", anyOf: ["contact.view"] },
  { label: "Testimonials", href: "/admin/testimonials", icon: "testimonials", anyOf: ["testimonials.view"] },
  { label: "Notifications", href: "/admin/notifications", icon: "notifications", anyOf: ["notifications.view"] },
  { label: "Auto Notify", href: "/admin/auto-notify", icon: "notifications", anyOf: ["notifications.view"] },
  { label: "Ratings", href: "/admin/ratings", icon: "ratings", anyOf: ["ratings.view"] },
  { label: "Ads", href: "/admin/ad-placements", icon: "ads", anyOf: ["ads.view"] },
  { label: "Media", href: "/admin/media", icon: "media", anyOf: ["media.view"] },
  { label: "Backups", href: "/admin/backups", icon: "backups", anyOf: ["backups.download", "backups.restore"] },
  { label: "Users", href: "/admin/users", icon: "users", anyOf: ["users.manage"] },
  { label: "Roles & Permissions", href: "/admin/roles", icon: "users", anyOf: ["users.manage"] },
  { label: "Audit", href: "/admin/audit", icon: "audit", anyOf: ["audit.view"] },
  { label: "System", href: "/admin/system", icon: "system", anyOf: ["system.view"] },
  { label: "Settings", href: "/admin/settings", icon: "settings", anyOf: ["settings.view"] },
];
