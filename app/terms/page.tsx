import type { Metadata } from "next";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import { buildSocialMetadata } from "@/src/lib/socialMeta";

const title = "Terms & Conditions";
const description =
  "Terms and Conditions for using Sensitivity Settings, including our BGMI and PUBG Mobile sensitivity calculator tools.";
const canonical = toCanonicalUrl("/terms");

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical },
  ...buildSocialMetadata({ title, description, url: canonical }),
};

export default function TermsPage() {
  return (
    <main className="page-container" style={{ padding: "20px 0 40px" }}>
      <div className="news-detail-card">
        <h1>Terms & Conditions</h1>
        <p>This page is managed from admin in dynamic setup.</p>
      </div>
    </main>
  );
}
