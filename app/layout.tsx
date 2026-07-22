import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { PublicSiteScripts } from "@/src/components/PublicSiteScripts";
import { organizationSchema, softwareAppSchema, websiteSchema } from "@/src/lib/schema";
import { parseGoogleSiteVerification } from "@/src/lib/headSnippets";
import { getSiteUrl } from "@/src/lib/siteUrl";
import { DEFAULT_OG_IMAGE_PATH } from "@/src/lib/socialMeta";
import { getHeadSnippets } from "@/src/server/repositories/settingsRepository";
import "./globals.css";

/* Geist Mono was unused; keep variable Sans only (one file, weights used in CSS) */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#45c4b0",
  colorScheme: "dark",
};

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = getSiteUrl();
  const snippets = await getHeadSnippets();
  const googleFromAdmin = parseGoogleSiteVerification(snippets.googleVerificationMeta);
  const googleFromEnv = parseGoogleSiteVerification(process.env.GOOGLE_SITE_VERIFICATION);
  const google = googleFromAdmin || googleFromEnv;

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: "BGMI Sensitivity Calculator | Sensitivity Settings",
      template: "%s | Sensitivity Settings",
    },
    description:
      "Free BGMI and PUBG Mobile sensitivity calculator with custom no-recoil settings, pro presets, and gaming news.",
    applicationName: "Sensitivity Settings",
    keywords: [
      "BGMI sensitivity calculator",
      "BGMI no recoil",
      "PUBG Mobile sensitivity",
      "gyroscope settings",
      "ADS sensitivity",
    ],
    authors: [{ name: "Sensitivity Settings", url: baseUrl }],
    creator: "Sensitivity Settings",
    publisher: "Sensitivity Settings",
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
      siteName: "Sensitivity Settings",
      locale: "en_US",
      images: [
        {
          url: DEFAULT_OG_IMAGE_PATH,
          width: 1200,
          height: 630,
          alt: "BGMI Sensitivity Calculator",
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

  return (
    <html lang="en" className={geistSans.variable}>
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
        <PublicSiteScripts />
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(softwareAppSchema(baseUrl)),
          }}
        />
      </body>
    </html>
  );
}
