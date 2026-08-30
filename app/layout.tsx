import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { DeferredMarketingScripts } from "@/src/components/DeferredMarketingScripts";
import { PushSoftPrompt } from "@/src/components/PushSoftPrompt";
import { FA_CSS, FA_SOLID_WOFF2 } from "@/src/lib/fontAwesome";
import { organizationSchema, websiteSchema } from "@/src/lib/schema";
import {
  parseAdsenseSnippet,
  parseAnalyticsSnippet,
  parseGoogleSiteVerification,
} from "@/src/lib/headSnippets";
import { getSiteUrl } from "@/src/lib/siteUrl";
import { DEFAULT_OG_IMAGE_PATH } from "@/src/lib/socialMeta";
import { defaultSeoSettings } from "@/src/lib/siteSettings";
import { getHeadSnippets, getSettings } from "@/src/server/repositories/settingsRepository";
import "./globals.css";

/* Limit downloaded axis pressure; swap keeps text visible for LCP */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#45c4b0",
  colorScheme: "dark",
};

function seoString(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
}

function seoKeywords(value: unknown): string[] {
  if (!Array.isArray(value)) return defaultSeoSettings.keywords;
  const list = value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
  return list.length ? list : defaultSeoSettings.keywords;
}

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = getSiteUrl();
  const [snippets, settings] = await Promise.all([getHeadSnippets(), getSettings()]);
  const googleFromAdmin = parseGoogleSiteVerification(snippets.googleVerificationMeta);
  const googleFromEnv = parseGoogleSiteVerification(process.env.GOOGLE_SITE_VERIFICATION);
  const google = googleFromAdmin || googleFromEnv;
  const seo = settings.seo ?? {};
  const siteTitle = seoString(seo.siteTitle, defaultSeoSettings.siteTitle);
  const defaultTitle = seoString(seo.defaultTitle, defaultSeoSettings.defaultTitle);
  const titleTemplate = seoString(seo.titleTemplate, defaultSeoSettings.titleTemplate);
  const description = seoString(seo.metaDescription, defaultSeoSettings.metaDescription);
  const keywords = seoKeywords(seo.keywords);

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: defaultTitle,
      template: titleTemplate,
    },
    description,
    applicationName: siteTitle,
    keywords,
    authors: [{ name: siteTitle, url: baseUrl }],
    creator: siteTitle,
    publisher: siteTitle,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    icons: {
      icon: [
        { url: "/favicon.ico?v=3", sizes: "48x48", type: "image/x-icon" },
        { url: "/icon.png?v=3", type: "image/png" },
      ],
      apple: [{ url: "/apple-icon.png?v=3", sizes: "180x180", type: "image/png" }],
    },
    manifest: "/manifest.webmanifest",
    openGraph: {
      type: "website",
      siteName: siteTitle,
      locale: "en_US",
      images: [
        {
          url: DEFAULT_OG_IMAGE_PATH,
          width: 1200,
          height: 630,
          alt: defaultTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      images: [DEFAULT_OG_IMAGE_PATH],
    },
    ...(google
      ? {
          verification: {
            google,
          },
        }
      : {}),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const baseUrl = getSiteUrl();
  const snippets = await getHeadSnippets();
  const analytics = parseAnalyticsSnippet(snippets.analyticsScript);
  const adsense = parseAdsenseSnippet(snippets.adsenseScript);

  return (
    <html lang="en" className={geistSans.variable} data-scroll-behavior="smooth">
      <head>
        {/* AdSense soon after open; GA a bit later — never on first click (INP). */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
        {/* Preload FA font; CSS uses media=print→all so it does not block first paint (FCP). */}
        <link
          rel="preload"
          href={FA_SOLID_WOFF2}
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {FA_CSS.map((href) => (
          <link
            key={href}
            rel="stylesheet"
            href={href}
            media="print"
            data-fa-css=""
            // Inline script flips media to "all" after load — ignore that for hydration.
            suppressHydrationWarning
          />
        ))}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){function a(l){l.media='all'}document.querySelectorAll('link[data-fa-css]').forEach(function(l){if(l.sheet)a(l);else l.addEventListener('load',function(){a(l)})})})();",
          }}
        />
      </head>
      <body>
        {/* Critical above-the-fold styles so LCP title can paint before the CSS chunk */}
        <style
          dangerouslySetInnerHTML={{
            __html:
              "body{background:#0b0e14;color:#e6edf3;margin:0}" +
              ".main-title{color:#45c4b0;text-transform:uppercase;font-size:clamp(18px,4.6vw,36px);margin:24px auto 20px;text-align:center;letter-spacing:1px;line-height:1.25;width:100%;max-width:1100px;padding:0 16px;box-sizing:border-box}" +
              "h1.main-title.ff-gradient-title{background:linear-gradient(90deg,#ef4444 0%,#f97316 20%,#facc15 40%,#8bc34a 60%,#4dd0a1 80%,#4fc3f7 100%);-webkit-background-clip:text;background-clip:text;color:transparent;font-weight:900}" +
              ".home-header-spacer{width:100%;display:block;height:108px}" +
              "@media (min-width:851px){.home-header-spacer{height:64px}}",
          }}
        />
        {children}
        <PushSoftPrompt />
        <DeferredMarketingScripts
          analytics={
            analytics
              ? {
                  id: "site-analytics",
                  externalSrc: analytics.externalSrc,
                  inlineJs: analytics.inlineJs,
                }
              : null
          }
          adsense={
            adsense
              ? {
                  id: "site-adsense",
                  externalSrc: adsense.externalSrc,
                  inlineJs: adsense.inlineJs,
                  crossOrigin: adsense.crossOrigin,
                }
              : null
          }
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema(baseUrl)),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema(baseUrl)),
          }}
        />
      </body>
    </html>
  );
}
