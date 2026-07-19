import type { Metadata } from "next";

/** Default social share image (1200×630) in /public. */
export const DEFAULT_OG_IMAGE_PATH = "/og-default.png";

type SocialShareInput = {
  title: string;
  description: string;
  /** Absolute canonical URL */
  url: string;
  image?: string | null;
  imageAlt?: string;
  type?: "website" | "article";
  locale?: string;
  /** Other languages present on the same page (not separate URLs). */
  alternateLocales?: string[];
};

/**
 * Consistent Open Graph + Twitter cards. Always includes an image
 * (falls back to /og-default.png) so shares never miss a preview.
 *
 * Note: do not invent hreflang / alternates.languages unless real
 * alternate-language URLs exist (e.g. /en and /hi).
 */
export function buildSocialMetadata({
  title,
  description,
  url,
  image,
  imageAlt,
  type = "website",
  locale = "en_US",
  alternateLocales,
}: SocialShareInput): Pick<Metadata, "openGraph" | "twitter"> {
  const imageUrl = (image && image.trim()) || DEFAULT_OG_IMAGE_PATH;
  const alt = (imageAlt && imageAlt.trim()) || title;

  return {
    openGraph: {
      title,
      description,
      url,
      siteName: "Sensitivity Settings",
      locale,
      ...(alternateLocales?.length ? { alternateLocale: alternateLocales } : {}),
      type,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}
