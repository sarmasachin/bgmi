/** Free Fire / Free Fire Max coming-soon game pages. */

export const FREE_FIRE_SLUG = "free-fire-sensitivity-settings-calculator";
export const FREE_FIRE_MAX_SLUG = "free-fire-max-sensitivity-settings-calculator";

export const FREE_FIRE_PATH = `/${FREE_FIRE_SLUG}`;
export const FREE_FIRE_MAX_PATH = `/${FREE_FIRE_MAX_SLUG}`;

export const FREE_FIRE_NAV = [
  { label: "Free Fire", href: FREE_FIRE_PATH },
  { label: "Free Fire Max", href: FREE_FIRE_MAX_PATH },
] as const;

export type FreeFireVariant = "freefire" | "freefire-max";

export function freeFireConfig(variant: FreeFireVariant) {
  if (variant === "freefire-max") {
    return {
      slug: FREE_FIRE_MAX_SLUG,
      path: FREE_FIRE_MAX_PATH,
      navLabel: "Free Fire Max",
      title: "Free Fire Max Sensitivity Settings calculator",
      soonMessage: "Free Fire Max Sensitivity Settings calculator — Update Soon",
      seoDescription:
        "Free Fire Max sensitivity settings calculator — coming soon on Sensitivity Settings. Guides and tips while the tool is in development.",
      defaultArticleHtml: `<p>Free Fire Max sensitivity settings guide and tips will appear here. The calculator is coming soon — check back for updates.</p>
<p>Meanwhile, explore our BGMI and PUBG Mobile sensitivity calculators from the menu above.</p>`,
    };
  }
  return {
    slug: FREE_FIRE_SLUG,
    path: FREE_FIRE_PATH,
    navLabel: "Free Fire",
    title: "Free Fire Sensitivity Settings calculator",
    soonMessage: "Free Fire Sensitivity Settings calculator — Update Soon",
    seoDescription:
      "Free Fire sensitivity settings calculator — coming soon on Sensitivity Settings. Guides and tips while the tool is in development.",
    defaultArticleHtml: `<p>Free Fire sensitivity settings guide and tips will appear here. The calculator is coming soon — check back for updates.</p>
<p>Meanwhile, explore our BGMI and PUBG Mobile sensitivity calculators from the menu above.</p>`,
  };
}

export function isFreeFirePath(pathname: string) {
  return (
    pathname === FREE_FIRE_PATH ||
    pathname.startsWith(`${FREE_FIRE_PATH}/`) ||
    pathname === FREE_FIRE_MAX_PATH ||
    pathname.startsWith(`${FREE_FIRE_MAX_PATH}/`)
  );
}

/** Merge Free Fire nav links if missing from saved settings. */
export function ensureFreeFireNavigation(
  links: Array<{ label: string; href: string }>,
): Array<{ label: string; href: string }> {
  const out = [...links];
  for (const item of FREE_FIRE_NAV) {
    const has = out.some(
      (row) =>
        row.href === item.href ||
        row.href === item.href.replace(/^\//, "") ||
        new RegExp(item.label.replace(/\s+/g, "\\s*"), "i").test(row.label),
    );
    if (!has) out.push({ label: item.label, href: item.href });
  }
  return out;
}
