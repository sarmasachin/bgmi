"use client";

import { FormEvent, useState } from "react";
import { useAdminFlash } from "@/src/components/admin/AdminToast";
import { ClientErrorBoundary } from "@/src/components/ClientErrorBoundary";
import {
  BGMI_APK_PATH,
  type BgmiApkPageContent,
  type BgmiApkPageSectionId,
} from "@/src/lib/bgmiApkPage";
import { readApiError } from "@/src/lib/userFacingError";
import { AdminBgmiApkForm } from "./AdminBgmiApkForm";

type InitialData = {
  page: BgmiApkPageContent;
  usingDefault: boolean;
};

export default function AdminBgmiApkClient({ initialData }: { initialData: InitialData }) {
  const [page, setPage] = useState(initialData.page);
  const [usingDefault, setUsingDefault] = useState(initialData.usingDefault);
  const [openIds, setOpenIds] = useState<Set<BgmiApkPageSectionId>>(
    () => new Set(["seo", "hero", "heroButtons", "countdown"]),
  );
  const [saving, setSaving] = useState(false);
  const setMessage = useAdminFlash();

  function toggle(id: BgmiApkPageSectionId) {
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
      const res = await fetch("/api/admin/bgmi-apk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "save", page }),
      });
      if (!res.ok) {
        setMessage(await readApiError(res, "Could not save BGMI APK page."));
        return;
      }
      const json = (await res.json()) as {
        page?: BgmiApkPageContent;
        usingDefault?: boolean;
      };
      if (json.page) setPage(json.page);
      setUsingDefault(Boolean(json.usingDefault));
      setMessage("BGMI APK page saved.");
    } catch {
      setMessage("Network error. Please retry.");
    } finally {
      setSaving(false);
    }
  }

  async function onReset() {
    if (!window.confirm("Reset BGMI APK page to built-in defaults?")) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/bgmi-apk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "reset" }),
      });
      if (!res.ok) {
        setMessage(await readApiError(res, "Could not reset BGMI APK page."));
        return;
      }
      const json = (await res.json()) as {
        page?: BgmiApkPageContent;
        usingDefault?: boolean;
      };
      if (json.page) setPage(json.page);
      setUsingDefault(Boolean(json.usingDefault));
      setMessage("Reverted to built-in BGMI APK defaults.");
    } catch {
      setMessage("Network error. Please retry.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ClientErrorBoundary label="BGMI APK admin">
    <section className="admin-section">
      <div className="admin-comments-head">
        <h1>BGMI APK</h1>
        <a
          className="admin-news-btn admin-news-btn-edit"
          href={BGMI_APK_PATH}
          target="_blank"
          rel="noreferrer"
        >
          Preview page
        </a>
      </div>

      <form onSubmit={onSave}>
        <AdminBgmiApkForm
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
          <button
            type="button"
            className="admin-news-btn admin-news-btn-edit"
            disabled={saving || usingDefault}
            onClick={() => void onReset()}
          >
            Reset to defaults
          </button>
        </div>
      </form>
    </section>
    </ClientErrorBoundary>
  );
}
