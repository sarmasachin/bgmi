/** Shared legal-page helpers safe for client + server. */

export const CORE_LEGAL_SLUGS = ["privacy", "terms", "disclaimer"] as const;
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
        "Privacy Policy for Sensitivity Settings — how we handle information on our BGMI and PUBG Mobile sensitivity calculator website.",
    };
  }
  if (slug === "terms") {
    return {
      seoTitle: "Terms & Conditions",
      seoDescription:
        "Terms and Conditions for using Sensitivity Settings, including our BGMI and PUBG Mobile sensitivity calculator tools.",
    };
  }
  if (slug === "disclaimer") {
    return {
      seoTitle: "Disclaimer",
      seoDescription:
        "Disclaimer for Sensitivity Settings — calculator results are guidance only and not affiliated with Krafton or official game publishers.",
    };
  }
  return { seoTitle: defaultTitleForSlug(slug), seoDescription: "" };
}

export function defaultHtmlForSlug(slug: string) {
  if (slug === "privacy") {
    return `<p>This Privacy Policy explains how Sensitivity Settings collects, uses, and protects information when you use our BGMI and PUBG Mobile sensitivity calculator website.</p>
<p>We may collect technical data such as browser type, device information, and usage analytics to improve the site. We do not sell your personal information.</p>
<p>If you contact us or submit a rating with your email, we use that information only to respond and operate our services.</p>
<p>For questions about this policy, email <a href="mailto:support@sensitivitysettings.com">support@sensitivitysettings.com</a>.</p>`;
  }
  if (slug === "terms") {
    return `<p>By using Sensitivity Settings, you agree to these Terms &amp; Conditions.</p>
<p>Our calculators and tools provide configuration guidance only. Results may vary by device, game version, and play style. You use the site at your own discretion.</p>
<p>Content on this website is for informational purposes. You may not copy, scrape, or redistribute our tools or content without permission.</p>
<p>We may update these terms at any time. Continued use of the site means you accept the updated terms.</p>`;
  }
  if (slug === "disclaimer") {
    return `<p>Sensitivity Settings is an independent fan resource. We are not affiliated with, endorsed by, or sponsored by Krafton, PUBG Corporation, or any official game publisher.</p>
<p>Calculator outputs are estimates and guidance only — not guarantees of in-game performance. Always follow official game rules and fair-play policies.</p>
<p>We are not responsible for any loss, account action, or gameplay outcome related to settings you choose to apply.</p>`;
  }
  return `<p>Edit this page content from the admin panel.</p>`;
}

export function legalPublicPath(slug: string) {
  if (isCoreLegalSlug(slug)) return `/${slug}`;
  return `/legal/${slug}`;
}

/** Slugs that must not be used for custom legal pages (app routes). */
export const RESERVED_APP_SLUGS = new Set([
  "admin",
  "api",
  "contact",
  "news",
  "pubg",
  "privacy",
  "terms",
  "disclaimer",
  "legal",
  "sitemap",
  "robots",
  "manifest",
  "favicon",
  "free-fire-sensitivity-settings-calculator",
  "free-fire-max-sensitivity-settings-calculator",
]);

