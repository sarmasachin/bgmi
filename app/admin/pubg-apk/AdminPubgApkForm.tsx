"use client";

import type { PubgApkPageContent, PubgApkPageSectionId } from "@/src/lib/pubgApkPage";
import { AdminPubgApkFormArticle } from "./AdminPubgApkFormArticle";
import { AdminPubgApkFormCards } from "./AdminPubgApkFormCards";
import { AdminPubgApkFormInfo } from "./AdminPubgApkFormInfo";
import { AdminPubgApkFormTop } from "./AdminPubgApkFormTop";

type Props = {
  page: PubgApkPageContent;
  openIds: Set<PubgApkPageSectionId>;
  onToggle: (id: PubgApkPageSectionId) => void;
  onPatch: (updater: (prev: PubgApkPageContent) => PubgApkPageContent) => void;
};

export function AdminPubgApkForm(props: Props) {
  return (
    <>
      <AdminPubgApkFormTop {...props} />
      <AdminPubgApkFormCards {...props} />
      <AdminPubgApkFormInfo {...props} />
      <AdminPubgApkFormArticle {...props} />
    </>
  );
}
