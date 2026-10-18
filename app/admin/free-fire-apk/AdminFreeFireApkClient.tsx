"use client";

import { FormEvent, useState } from "react";
import { useAdminFlash } from "@/src/components/admin/AdminToast";
import { ClientErrorBoundary } from "@/src/components/ClientErrorBoundary";
import {
  FREE_FIRE_APK_PATH,
  type FreeFireApkPageContent,
  type FreeFireApkPageSectionId,
} from "@/src/lib/freeFireApkPage";
import { readApiError } from "@/src/lib/userFacingError";
import { AdminFreeFireApkForm } from "./AdminFreeFireApkForm";

type InitialData = {
  page: FreeFireApkPageContent;
  usingDefault: boolean;
};

export default function AdminFreeFireApkClient({ initialData }: { initialData: InitialData }) {
  const [page, setPage] = useState(initialData.page);
  const [openIds, setOpenIds] = useState<Set<FreeFireApkPageSectionId>>(
    () => new Set(),
  );
  const [saving, setSaving] = useState(false);
  const setMessage = useAdminFlash();

  function toggle(id: FreeFireApkPageSectionId) {
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
      const res = await fetch("/api/admin/free-fire-apk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "save", page }),
      });
      if (!res.ok) {
        setMessage(await readApiError(res, "Could not save FF Apk page."));
        return;
      }
      const json = (await res.json()) as {
        page?: FreeFireApkPageContent;
      };
      if (json.page) setPage(json.page);
      setMessage("FF Apk page saved.");
    } catch {
      setMessage("Network error. Please retry.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ClientErrorBoundary label="FF Apk admin">
    <section className="admin-section">
      <div className="admin-comments-head">
        <h1>FF Apk</h1>
        <a
          className="admin-news-btn admin-news-btn-edit"
          href={FREE_FIRE_APK_PATH}
          target="_blank"
          rel="noreferrer"
        >
          Preview page
        </a>
      </div>

      <form onSubmit={onSave}>
        <AdminFreeFireApkForm
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
    </ClientErrorBoundary>
  );
}
