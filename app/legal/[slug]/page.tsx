import { LegalDocumentPage, buildLegalMetadata } from "@/src/components/LegalDocumentPage";
import { isCoreLegalSlug, normalizeLegalSlug } from "@/src/lib/legalPages";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: raw } = await params;
  const slug = normalizeLegalSlug(raw);
  if (!slug || isCoreLegalSlug(slug)) {
    return { title: "Not Found" };
  }
  return buildLegalMetadata(slug);
}

export default async function CustomLegalPage({ params }: Props) {
  const { slug: raw } = await params;
  const slug = normalizeLegalSlug(raw);
  if (!slug || isCoreLegalSlug(slug)) notFound();
  return <LegalDocumentPage slug={slug} />;
}
