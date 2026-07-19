import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PUBG Mobile Sensitivity Calculator",
  description: "PUBG Mobile sensitivity calculator with camera and ADS presets.",
};

export default function PubgPage() {
  // Shared UI lives in (games)/layout — title is RSC so LCP paints without client JS.
  return <h1 className="main-title">PUBG Mobile Sensitivity Settings calculator</h1>;
}
