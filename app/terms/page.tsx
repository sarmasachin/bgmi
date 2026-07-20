import { LegalDocumentPage, buildLegalMetadata } from "@/src/components/LegalDocumentPage";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildLegalMetadata("terms");
}

export default function TermsPage() {
  return <LegalDocumentPage slug="terms" softFallback />;
}
