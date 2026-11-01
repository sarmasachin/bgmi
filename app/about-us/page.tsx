import { LegalDocumentPage, buildLegalMetadata } from "@/src/components/LegalDocumentPage";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildLegalMetadata("about-us");
}

export default function AboutUsPage() {
  return <LegalDocumentPage slug="about-us" softFallback />;
}
