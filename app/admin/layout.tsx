import type { Metadata } from "next";
import type { ReactNode } from "react";
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

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
