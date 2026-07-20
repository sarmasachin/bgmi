import { LegalDocumentPage, buildLegalMetadata } from "@/src/components/LegalDocumentPage";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildLegalMetadata("disclaimer");
}

export default function DisclaimerPage() {
  return <LegalDocumentPage slug="disclaimer" softFallback />;
}
