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
      logo: absoluteAsset(baseUrl, "/icon.png"),
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

type ReviewInput = {
  name: string;
  rating: number;
  message: string;
};

/**
 * Page-level WebApplication schema for a tool URL.
 * AggregateRating / Review only when real approved reviews exist (never invent stars).
 * Always returns the app entity so root layout need not emit a global WebApplication.
 */
export function toolAppReviewSchema(options: {
  baseUrl: string;
  name: string;
  description: string;
  url: string;
  reviews: ReviewInput[];
  dateModified?: string;
}) {
  const reviews = options.reviews
    .map((r) => ({
      name: r.name?.trim() || "Player",
      rating: Math.min(5, Math.max(1, Math.round(Number(r.rating) || 0))),
      message: r.message?.trim() ?? "",
    }))
    .filter((r) => r.rating >= 1 && r.rating <= 5 && r.message.length > 0);

  const base: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: options.name,
    applicationCategory: "GameApplication",
    operatingSystem: "Android, iOS",
    url: options.url,
    description: options.description,
    image: absoluteAsset(options.baseUrl, DEFAULT_OG_IMAGE_PATH),
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
  };

  if (options.dateModified) {
    base.dateModified = options.dateModified;
  }

  if (reviews.length === 0) return base;

  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const ratingValue = Math.round((sum / reviews.length) * 10) / 10;

  return {
    ...base,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: String(ratingValue),
      bestRating: "5",
      worstRating: "1",
      ratingCount: String(reviews.length),
      reviewCount: String(reviews.length),
    },
    review: reviews.slice(0, 20).map((r) => ({
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: String(r.rating),
        bestRating: "5",
        worstRating: "1",
      },
      author: {
        "@type": "Person",
        name: r.name,
      },
      reviewBody: r.message,
    })),
  };
}

/**
 * News Article aggregateRating from real RatingWidget summary only.
 * Returns null when count is 0 (never invent stars).
 */
export function newsArticleRatingFields(summary: {
  average: number | null;
  count: number;
} | null) {
  if (!summary || !summary.count || summary.count < 1 || summary.average == null) {
    return null;
  }
  const ratingValue = Math.round(Number(summary.average) * 10) / 10;
  if (!Number.isFinite(ratingValue) || ratingValue < 1) return null;
  return {
    aggregateRating: {
      "@type": "AggregateRating" as const,
      ratingValue: String(ratingValue),
      bestRating: "5",
      worstRating: "1",
      ratingCount: String(summary.count),
    },
  };
}

/** Hardened Article JSON-LD for news detail pages. */
export function newsArticleSchema(options: {
  baseUrl: string;
  headline: string;
  description?: string;
  datePublished?: string | Date | null;
  dateModified?: string | Date | null;
  image?: string | null;
  mainEntityOfPage: string;
  ratingSummary?: { average: number | null; count: number } | null;
}) {
  const ratingFields = newsArticleRatingFields(options.ratingSummary ?? null);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: options.headline,
    description: options.description || undefined,
    datePublished: options.datePublished ?? undefined,
    dateModified: options.dateModified ?? options.datePublished ?? undefined,
    author: {
      "@type": "Organization",
      name: "Sensitivity Settings",
      url: options.baseUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "Sensitivity Settings",
      url: options.baseUrl,
      logo: {
        "@type": "ImageObject",
        url: absoluteAsset(options.baseUrl, "/icon.png"),
      },
    },
    image: options.image || absoluteAsset(options.baseUrl, DEFAULT_OG_IMAGE_PATH),
    mainEntityOfPage: options.mainEntityOfPage,
    ...(ratingFields ?? {}),
  };
}
