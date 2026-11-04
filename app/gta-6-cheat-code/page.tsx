import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, DM_Sans } from "next/font/google";
import { Gta6CheatArticle } from "@/src/features/gta6Calculator/Gta6CheatArticle";
import { GTA6_CHEAT_DESCRIPTION, GTA6_CHEAT_TITLE } from "@/src/features/gta6Calculator/gta6-cheat-copy";
import { Gta6Header } from "@/src/features/gta6Calculator/Gta6Header";
import { GTA6_PATH } from "@/src/features/gta6Calculator/gta6-seo";
import "@/src/features/gta6Calculator/gta6-tw.css";
import "@/src/features/gta6Calculator/gta6Calculator.css";
import { SiteFooter } from "@/src/components/SiteFooter";
import { breadcrumbListSchema, webPageSchema } from "@/src/lib/schema";
import { buildSocialMetadata } from "@/src/lib/socialMeta";
import { toCanonicalUrl } from "@/src/lib/siteUrl";

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

const PATH = "/gta-6-cheat-code";
const canonical = toCanonicalUrl(PATH);

export const viewport: Viewport = {
  themeColor: "#0b0b10",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  title: { absolute: `${GTA6_CHEAT_TITLE} — TBA Until Launch` },
  description: GTA6_CHEAT_DESCRIPTION,
  alternates: { canonical },
  robots: { index: true, follow: true },
  ...buildSocialMetadata({
    title: GTA6_CHEAT_TITLE,
    description: GTA6_CHEAT_DESCRIPTION,
    url: canonical,
  }),
};

const jsonLd = [
  webPageSchema({
    name: GTA6_CHEAT_TITLE,
    description: GTA6_CHEAT_DESCRIPTION,
    url: canonical,
  }),
  breadcrumbListSchema([
    { name: "Home", url: toCanonicalUrl("/") },
    { name: "GTA 6", url: toCanonicalUrl(GTA6_PATH) },
    { name: GTA6_CHEAT_TITLE, url: canonical },
  ]),
].filter(Boolean);

export default function Gta6CheatCodePage() {
  return (
    <>
      <div className={`gta6-root ${display.variable} ${body.variable}`}>
        <Gta6Header path={GTA6_PATH} />
        <main id="top">
          <Gta6CheatArticle />
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
