"use client";

import type { FreeFireMaxApkPageContent, FreeFireMaxApkPageSectionId } from "@/src/lib/freeFireMaxApkPage";
import { AdminFreeFireMaxApkFormArticle } from "./AdminFreeFireMaxApkFormArticle";
import { AdminFreeFireMaxApkFormCards } from "./AdminFreeFireMaxApkFormCards";
import { AdminFreeFireMaxApkFormInfo } from "./AdminFreeFireMaxApkFormInfo";
import { AdminFreeFireMaxApkFormTop } from "./AdminFreeFireMaxApkFormTop";

type Props = {
  page: FreeFireMaxApkPageContent;
  openIds: Set<FreeFireMaxApkPageSectionId>;
  onToggle: (id: FreeFireMaxApkPageSectionId) => void;
  onPatch: (updater: (prev: FreeFireMaxApkPageContent) => FreeFireMaxApkPageContent) => void;
};

export function AdminFreeFireMaxApkForm(props: Props) {
  return (
    <>
      <AdminFreeFireMaxApkFormTop {...props} />
      <AdminFreeFireMaxApkFormCards {...props} />
      <AdminFreeFireMaxApkFormInfo {...props} />
      <AdminFreeFireMaxApkFormArticle {...props} />
    </>
  );
}
