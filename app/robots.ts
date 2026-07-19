import { MetadataRoute } from "next";
import { getSiteUrl } from "@/src/lib/siteUrl";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin"],
      },
    ],
    sitemap: [`${baseUrl}/sitemap.xml`],
  };
}
