import { DEFAULT_OG_IMAGE_PATH } from "@/src/lib/socialMeta";

type FaqInput = { question: string; answer: string };

function absoluteAsset(baseUrl: string, path: string) {
  const base = baseUrl.replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

export function organizationSchema(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Sensitivity Settings",
    url: baseUrl,
    logo: absoluteAsset(baseUrl, "/icon.png"),
  };
}

export function websiteSchema(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Sensitivity Settings",
    url: baseUrl,
    publisher: {
      "@type": "Organization",
      name: "Sensitivity Settings",
      url: baseUrl,
    },
  };
}

/** Free web calculator — no fabricated ratings (Google policy). */
export function softwareAppSchema(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "BGMI Sensitivity Calculator",
    applicationCategory: "GameApplication",
    operatingSystem: "Android, iOS",
    url: baseUrl,
    description:
      "Free BGMI and PUBG Mobile sensitivity calculator for camera, ADS, and gyroscope settings.",
    image: absoluteAsset(baseUrl, DEFAULT_OG_IMAGE_PATH),
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
  };
}

/**
 * FAQPage schema from on-page FAQ items only.
 * Returns null when empty so callers skip the script tag.
 */
export function faqSchema(items: FaqInput[]) {
  const mainEntity = items
    .map((item) => ({
      question: item.question?.trim() ?? "",
      answer: item.answer?.trim() ?? "",
    }))
    .filter((item) => item.question && item.answer)
    .map((item) => ({
      "@type": "Question" as const,
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer" as const,
        text: item.answer,
      },
    }));

  if (mainEntity.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity,
  };
}
