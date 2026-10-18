"use client";

import type { FreeFireApkPageContent, FreeFireApkPageSectionId } from "@/src/lib/freeFireApkPage";
import { AdminFreeFireApkFormArticle } from "./AdminFreeFireApkFormArticle";
import { AdminFreeFireApkFormCards } from "./AdminFreeFireApkFormCards";
import { AdminFreeFireApkFormInfo } from "./AdminFreeFireApkFormInfo";
import { AdminFreeFireApkFormTop } from "./AdminFreeFireApkFormTop";

type Props = {
  page: FreeFireApkPageContent;
  openIds: Set<FreeFireApkPageSectionId>;
  onToggle: (id: FreeFireApkPageSectionId) => void;
  onPatch: (updater: (prev: FreeFireApkPageContent) => FreeFireApkPageContent) => void;
};

export function AdminFreeFireApkForm(props: Props) {
  return (
    <>
      <AdminFreeFireApkFormTop {...props} />
      <AdminFreeFireApkFormCards {...props} />
      <AdminFreeFireApkFormInfo {...props} />
      <AdminFreeFireApkFormArticle {...props} />
    </>
  );
}
