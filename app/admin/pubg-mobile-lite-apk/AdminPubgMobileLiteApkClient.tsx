"use client";

import { FormEvent, useState } from "react";
import { useAdminFlash } from "@/src/components/admin/AdminToast";
import {
  PUBG_MOBILE_LITE_APK_PATH,
  type PubgMobileLiteApkPageContent,
  type PubgMobileLiteApkPageSectionId,
} from "@/src/lib/pubgMobileLiteApkPage";
import { readApiError } from "@/src/lib/userFacingError";
import { AdminPubgMobileLiteApkFormInfo } from "./AdminPubgMobileLiteApkFormInfo";
import { AdminPubgMobileLiteApkFormTop } from "./AdminPubgMobileLiteApkFormTop";

type InitialData = {
  page: PubgMobileLiteApkPageContent;
  usingDefault: boolean;
};

export default function AdminPubgMobileLiteApkClient({
  initialData,
}: {
  initialData: InitialData;
}) {
  const [page, setPage] = useState(initialData.page);
  const [openIds, setOpenIds] = useState<Set<PubgMobileLiteApkPageSectionId>>(() => new Set());
  const [saving, setSaving] = useState(false);
  const setMessage = useAdminFlash();

  function toggle(id: PubgMobileLiteApkPageSectionId) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function onSave(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/pubg-mobile-lite-apk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "save", page }),
      });
      if (!res.ok) {
        setMessage(await readApiError(res, "Could not save PUBG Mobile Flash APK page."));
        return;
      }
      const json = (await res.json()) as { page?: PubgMobileLiteApkPageContent };
      if (json.page) setPage(json.page);
      setMessage("PUBG Mobile Flash APK page saved.");
    } catch {
      setMessage("Network error. Please retry.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-section">
      <div className="admin-comments-head">
        <h1>PUBG Mobile Flash APK</h1>
        <a
          className="admin-news-btn admin-news-btn-edit"
          href={PUBG_MOBILE_LITE_APK_PATH}
          target="_blank"
          rel="noreferrer"
        >
          Preview page
        </a>
      </div>

      <form onSubmit={onSave}>
        <AdminPubgMobileLiteApkFormTop
          page={page}
          openIds={openIds}
          onToggle={toggle}
          onPatch={(updater) => setPage(updater)}
        />
        <AdminPubgMobileLiteApkFormInfo
          page={page}
          openIds={openIds}
          onToggle={toggle}
          onPatch={(updater) => setPage(updater)}
        />

        <div
          style={{
            position: "sticky",
            bottom: 0,
            marginTop: 20,
            padding: "14px 0",
            background: "linear-gradient(180deg, transparent, #0b0e14 30%)",
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            zIndex: 2,
          }}
        >
          <button type="submit" className="admin-news-btn admin-news-btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save all"}
          </button>
        </div>
      </form>
    </section>
  );
}
