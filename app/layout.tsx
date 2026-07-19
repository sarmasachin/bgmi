import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { faqSchema, organizationSchema, softwareAppSchema, websiteSchema } from "@/src/lib/schema";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Sensitivity Settings",
    template: "%s | Sensitivity Settings",
  },
  description: "BGMI Best Sensitivity Calculator with pro presets and gaming news.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        {/* Critical above-the-fold styles so LCP title can paint before the CSS chunk */}
        <style
          dangerouslySetInnerHTML={{
            __html:
              "body{background:#0b0e14;color:#e6edf3;margin:0}" +
              ".main-title{color:#45c4b0;text-transform:uppercase;font-size:clamp(18px,4.6vw,36px);margin:24px auto 20px;text-align:center;letter-spacing:1px;line-height:1.25;width:100%;max-width:1100px;padding:0 16px;box-sizing:border-box}" +
              ".games-main-fallback{width:100%;min-height:240px}",
          }}
        />
        {children}
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema()),
          }}
        />
      </body>
    </html>
  );
}
