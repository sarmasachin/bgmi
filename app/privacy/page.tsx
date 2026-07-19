import type { Metadata } from "next";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import { buildSocialMetadata } from "@/src/lib/socialMeta";

const title = "Privacy Policy";
const description =
  "Privacy Policy for Sensitivity Settings — how we handle information on our BGMI and PUBG Mobile sensitivity calculator website.";
const canonical = toCanonicalUrl("/privacy");

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical },
  ...buildSocialMetadata({ title, description, url: canonical }),
};

export default function PrivacyPage() {
  return (
    <main className="page-container" style={{ padding: "20px 0 40px" }}>
      <div className="news-detail-card">
        <h1>Privacy Policy</h1>
        <p>This page is managed from admin in dynamic setup.</p>
      </div>
    </main>
  );
}
