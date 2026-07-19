import Script from "next/script";
import { getHeadSnippets } from "@/src/server/repositories/settingsRepository";
import { normalizeInlineScript } from "@/src/lib/headSnippets";

/**
 * Optional analytics / ads scripts from admin Head Snippets.
 * Google verification meta is handled via generateMetadata (proper <head> tag).
 */
export async function PublicSiteScripts() {
  const snippets = await getHeadSnippets();
  const analytics = normalizeInlineScript(snippets.analyticsScript);
  const adsense = normalizeInlineScript(snippets.adsenseScript);

  return (
    <>
      {analytics ? (
        <Script
          id="site-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: analytics }}
        />
      ) : null}
      {adsense ? (
        <Script
          id="site-adsense"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: adsense }}
        />
      ) : null}
    </>
  );
}
