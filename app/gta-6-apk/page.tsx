import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, DM_Sans } from "next/font/google";
import { HomeHeader } from "@/src/components/HomeHeader";
import { SiteFooter } from "@/src/components/SiteFooter";
import { Gta6ApkArticle } from "@/src/features/gta6Calculator/Gta6ApkArticle";
import { GTA6_APK_PATH } from "@/src/features/gta6Calculator/gta6-apk-copy";
import { Gta6Header } from "@/src/features/gta6Calculator/Gta6Header";
import { GTA6_PATH } from "@/src/features/gta6Calculator/gta6-seo";
import "@/src/features/gta6Calculator/gta6Calculator.css";
import { breadcrumbListSchema, webPageSchema } from "@/src/lib/schema";
import { buildSocialMetadata } from "@/src/lib/socialMeta";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import { getGta6Page } from "@/src/server/repositories/gta6PageRepository";
import { getSettings } from "@/src/server/repositories/settingsRepository";

const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
  variable: "--gta6-display",
});

const body = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--gta6-body",
});

export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  themeColor: "#0b0b10",
  colorScheme: "dark",
};

function shareImageUrl(raw: string) {
  const value = raw.trim();
  return value ? toCanonicalUrl(value) : "";
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getGta6Page();
  const canonical = toCanonicalUrl(page.apk.canonicalUrl || GTA6_APK_PATH);
  const featureImage = shareImageUrl(page.apk.featureImage);
  const keywords = page.apk.keywords.map((item) => item.trim()).filter(Boolean);
  return {
    title: { absolute: page.apk.seoTitle },
    description: page.apk.seoDescription,
    keywords,
    alternates: { canonical },
    robots: { index: true, follow: true },
    ...buildSocialMetadata({
      title: page.apk.seoTitle,
      description: page.apk.seoDescription,
      url: canonical,
      image: featureImage || undefined,
      imageAlt: page.apk.featureImageAlt.trim() || page.apk.seoTitle,
      type: "article",
    }),
  };
}

export default async function Gta6ApkPage() {
  const settings = await getSettings();
  const page = await getGta6Page();
  const canonical = toCanonicalUrl(page.apk.canonicalUrl || GTA6_APK_PATH);
  const featureImage = shareImageUrl(page.apk.featureImage);
  const keywords = page.apk.keywords.map((item) => item.trim()).filter(Boolean);
  const jsonLd = [
    webPageSchema({
      name: page.apk.seoTitle,
      description: page.apk.seoDescription,
      url: canonical,
      image: featureImage || undefined,
      keywords,
    }),
    breadcrumbListSchema([
      { name: "Home", url: toCanonicalUrl("/") },
      { name: "GTA 6", url: toCanonicalUrl(GTA6_PATH) },
      { name: page.apk.title, url: canonical },
    ]),
  ].filter(Boolean);

  return (
    <>
      <HomeHeader
        siteTitle={settings.homeDisplay.headerTitle}
        navigation={settings.navigation}
        chipNav={<Gta6Header path={GTA6_PATH} />}
      />
      <div className={`gta6-root ${display.variable} ${body.variable}`}>
        <main id="top">
          <Gta6ApkArticle apk={page.apk} />
        </main>
        {jsonLd.map((block, index) => (
          <script
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
          />
        ))}
      </div>
      <SiteFooter bottomOnly />
    </>
  );
}
