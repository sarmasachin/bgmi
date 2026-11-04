import { GTA6_CALC_GUIDE, GTA6_SEO_KEYWORDS } from "@/src/features/gta6Calculator/gta6-details";
import { toCanonicalUrl } from "@/src/lib/siteUrl";

export const GTA6_PATH = "/gta-6-sensitivity-settings-calculator";

export const GTA6_PAGE_TITLE =
  "GTA 6 Sensitivity Calculator — PS5 & Xbox Series Controller Settings";

export const GTA6_PAGE_DESCRIPTION =
  "Free GTA 6 / GTA VI sensitivity calculator for PS5 and Xbox Series X|S. Prep look, aim, deadzone, acceleration, and DualSense options before the November 19, 2026 launch. Includes game specs, platforms, and FAQ.";

export function gta6Keywords(): string[] {
  return [...GTA6_SEO_KEYWORDS];
}

/** VideoGame + WebApplication + HowTo JSON-LD for the calculator page. */
export function gta6StructuredData(canonicalUrl: string) {
  const videoGame = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: "Grand Theft Auto VI",
    alternateName: ["GTA 6", "GTA VI", "Grand Theft Auto 6"],
    description:
      "Single-player open-world action adventure from Rockstar Games set in Leonida, launching November 19, 2026 on PlayStation 5 and Xbox Series X|S.",
    url: "https://www.rockstargames.com/VI",
    genre: ["Action", "Adventure", "Open world"],
    gamePlatform: ["PlayStation 5", "Xbox Series X", "Xbox Series S"],
    author: { "@type": "Organization", name: "Rockstar Games" },
    publisher: { "@type": "Organization", name: "Rockstar Games" },
    datePublished: "2026-11-19",
    offers: {
      "@type": "Offer",
      price: "79.99",
      priceCurrency: "USD",
      availability: "https://schema.org/PreOrder",
    },
  };

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": `${canonicalUrl}#calculator`,
    name: GTA6_PAGE_TITLE,
    url: canonicalUrl,
    description: GTA6_PAGE_DESCRIPTION,
    applicationCategory: "GameApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
    about: { "@type": "VideoGame", name: "Grand Theft Auto VI" },
  };

  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: GTA6_CALC_GUIDE.title,
    description: GTA6_PAGE_DESCRIPTION,
    step: GTA6_CALC_GUIDE.steps.map((text, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      text,
    })),
  };

  return [videoGame, webApp, howTo];
}

export function gta6BreadcrumbItems() {
  return [
    { name: "Home", url: toCanonicalUrl("/") },
    { name: "GTA 6 Sensitivity Calculator", url: toCanonicalUrl(GTA6_PATH) },
  ];
}
