"use client";

import type { BgmiApkPageContent, BgmiApkPageSectionId } from "@/src/lib/bgmiApkPage";
import { AdminBgmiApkFormArticle } from "./AdminBgmiApkFormArticle";
import { AdminBgmiApkFormCards } from "./AdminBgmiApkFormCards";
import { AdminBgmiApkFormInfo } from "./AdminBgmiApkFormInfo";
import { AdminBgmiApkFormTop } from "./AdminBgmiApkFormTop";

type Props = {
  page: BgmiApkPageContent;
  openIds: Set<BgmiApkPageSectionId>;
  onToggle: (id: BgmiApkPageSectionId) => void;
  onPatch: (updater: (prev: BgmiApkPageContent) => BgmiApkPageContent) => void;
};

export function AdminBgmiApkForm(props: Props) {
  return (
    <>
      <AdminBgmiApkFormTop {...props} />
      <AdminBgmiApkFormCards {...props} />
      <AdminBgmiApkFormInfo {...props} />
      <AdminBgmiApkFormArticle {...props} />
    </>
  );
}
