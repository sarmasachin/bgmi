import { LegalDocumentPage, buildLegalMetadata } from "@/src/components/LegalDocumentPage";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildLegalMetadata("dmca");
}

export default function DmcaPage() {
  return <LegalDocumentPage slug="dmca" softFallback />;
}
