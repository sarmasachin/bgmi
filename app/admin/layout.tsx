import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ensureFreeFireIndiaPagesOnce } from "@/src/server/repositories/ensureFreeFireIndiaPages";
import AdminLayoutClient from "./AdminLayoutClient";

/** Keep admin out of Search Console / Google indexing (header noindex already set in middleware). */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noarchive: true,
    },
  },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await ensureFreeFireIndiaPagesOnce();
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
