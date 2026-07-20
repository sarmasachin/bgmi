import { LegalDocumentPage, buildLegalMetadata } from "@/src/components/LegalDocumentPage";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildLegalMetadata("privacy");
}

export default function PrivacyPage() {
  return <LegalDocumentPage slug="privacy" softFallback />;
}
