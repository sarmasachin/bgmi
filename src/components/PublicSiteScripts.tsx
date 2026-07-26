import Script from "next/script";
import { getHeadSnippets } from "@/src/server/repositories/settingsRepository";
import { normalizeInlineScript } from "@/src/lib/headSnippets";

/**
 * Optional AdSense (and similar) scripts from admin Head Snippets.
 * Google Analytics is injected in app/layout.tsx <head> (Google install guide).
 * Google verification meta is handled via generateMetadata.
 */
export async function PublicSiteScripts() {
  const snippets = await getHeadSnippets();
  const adsense = normalizeInlineScript(snippets.adsenseScript);

  if (!adsense) return null;

  return (
    <Script
      id="site-adsense"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: adsense }}
    />
  );
}
