"use client";

import type { BgmiLiteApkPageSectionId, BgmiLiteBetaApkPageContent } from "@/src/lib/bgmiLiteBetaApkPage";
import { AdminBgmiLiteApkFormArticle } from "./AdminBgmiLiteApkFormArticle";
import { AdminBgmiLiteApkFormCards } from "./AdminBgmiLiteApkFormCards";
import { AdminBgmiLiteApkFormInfo } from "./AdminBgmiLiteApkFormInfo";
import { AdminBgmiLiteApkFormTop } from "./AdminBgmiLiteApkFormTop";

type Props = {
  page: BgmiLiteBetaApkPageContent;
  openIds: Set<BgmiLiteApkPageSectionId>;
  onToggle: (id: BgmiLiteApkPageSectionId) => void;
  onPatch: (updater: (prev: BgmiLiteBetaApkPageContent) => BgmiLiteBetaApkPageContent) => void;
};

export function AdminBgmiLiteApkForm(props: Props) {
  return (
    <>
      <AdminBgmiLiteApkFormTop {...props} />
      <AdminBgmiLiteApkFormCards {...props} />
      <AdminBgmiLiteApkFormInfo {...props} />
      <AdminBgmiLiteApkFormArticle {...props} />
    </>
  );
}
