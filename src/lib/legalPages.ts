/** Shared legal-page helpers safe for client + server. */

export const CORE_LEGAL_SLUGS = ["privacy", "terms", "disclaimer", "dmca", "about-us"] as const;
export type CoreLegalSlug = (typeof CORE_LEGAL_SLUGS)[number];

export function isCoreLegalSlug(slug: string): slug is CoreLegalSlug {
  return (CORE_LEGAL_SLUGS as readonly string[]).includes(slug);
}

export function normalizeLegalSlug(slug: string) {
  return slug
    .trim()
    .toLowerCase()
    .replace(/^\/+/, "")
    .replace(/\/+$/, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function defaultTitleForSlug(slug: string) {
  if (slug === "privacy") return "Privacy Policy";
  if (slug === "terms") return "Terms & Conditions";
  if (slug === "disclaimer") return "Disclaimer";
  if (slug === "dmca") return "DMCA Policy";
  if (slug === "about-us") return "About Us";
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function defaultSeoForSlug(slug: string) {
  if (slug === "privacy") {
    return {
      seoTitle: "Privacy Policy",
      seoDescription:
        "Privacy Policy for Sensitivity Settings — how our fan-made calculator site handles contact forms, optional emails, cookies, ads, and notifications.",
    };
  }
  if (slug === "terms") {
    return {
      seoTitle: "Terms & Conditions",
      seoDescription:
        "Terms & Conditions for Sensitivity Settings — rules for using our fan-made Free Fire, BGMI, and PUBG Mobile sensitivity calculator website.",
    };
  }
  if (slug === "disclaimer") {
    return {
      seoTitle: "Disclaimer",
      seoDescription:
        "Disclaimer for Sensitivity Settings — a fan-made calculator site, not affiliated with Garena Free Fire, PUBG Mobile, BGMI, or Krafton.",
    };
  }
  if (slug === "dmca") {
    return {
      seoTitle: "DMCA Policy | Copyright Takedown",
      seoDescription:
        "DMCA Policy for Sensitivity Settings — how to submit a copyright takedown notice, counter-notification, and repeat infringer policy.",
    };
  }
  if (slug === "about-us") {
    return {
      seoTitle: "About Us | Sensitivity Settings",
      seoDescription:
        "About Sensitivity Settings — a fan-made Free Fire, BGMI, and PUBG Mobile sensitivity calculator built by gamers for gamers.",
    };
  }
  return { seoTitle: defaultTitleForSlug(slug), seoDescription: "" };
}

export { defaultHtmlForSlug } from "@/src/lib/legalPageDefaultHtml";

export function legalPublicPath(slug: string) {
  if (isCoreLegalSlug(slug)) return `/${slug}`;
  return `/legal/${slug}`;
}

/** Slugs that must not be used for custom legal pages (app routes). */
export { RESERVED_PUBLIC_SLUGS as RESERVED_APP_SLUGS } from "@/src/lib/reservedPublicSlugs";

