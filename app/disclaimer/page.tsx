import type { Metadata } from "next";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import { buildSocialMetadata } from "@/src/lib/socialMeta";

const title = "Disclaimer";
const description =
  "Disclaimer for Sensitivity Settings — calculator results are guidance only and not affiliated with Krafton or official game publishers.";
const canonical = toCanonicalUrl("/disclaimer");

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical },
  ...buildSocialMetadata({ title, description, url: canonical }),
};

export default function DisclaimerPage() {
  return (
    <main className="page-container" style={{ padding: "20px 0 40px" }}>
      <div className="news-detail-card">
        <h1>Disclaimer</h1>
        <p>This tool provides configuration guidance only.</p>
      </div>
    </main>
  );
}
