import {
  FreeFireComingSoonPage,
  buildFreeFireMetadata,
} from "@/src/components/FreeFireComingSoonPage";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildFreeFireMetadata("freefire");
}

export default function FreeFirePage() {
  return <FreeFireComingSoonPage variant="freefire" />;
}
