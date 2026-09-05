"use client";

import { FormEvent, useState } from "react";
import { useAdminFlash } from "@/src/components/admin/AdminToast";
import {
  BGMI_LITE_APK_PATH,
  type BgmiLiteApkPageSectionId,
  type BgmiLiteBetaApkPageContent,
} from "@/src/lib/bgmiLiteBetaApkPage";
import { readApiError } from "@/src/lib/userFacingError";
import { AdminBgmiLiteApkForm } from "./AdminBgmiLiteApkForm";

type InitialData = {
  page: BgmiLiteBetaApkPageContent;
  usingDefault: boolean;
};

export default function AdminBgmiLiteApkClient({ initialData }: { initialData: InitialData }) {
  const [page, setPage] = useState(initialData.page);
  const [usingDefault, setUsingDefault] = useState(initialData.usingDefault);
  const [openIds, setOpenIds] = useState<Set<BgmiLiteApkPageSectionId>>(
    () => new Set(["seo", "hero", "countdown"]),
  );
  const [saving, setSaving] = useState(false);
  const setMessage = useAdminFlash();

  function toggle(id: BgmiLiteApkPageSectionId) {
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
      const res = await fetch("/api/admin/bgmi-lite-apk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "save", page }),
      });
      if (!res.ok) {
        setMessage(await readApiError(res, "Could not save BGMI Lite APK page."));
        return;
      }
      const json = (await res.json()) as {
        page?: BgmiLiteBetaApkPageContent;
        usingDefault?: boolean;
      };
      if (json.page) setPage(json.page);
      setUsingDefault(Boolean(json.usingDefault));
      setMessage("BGMI Lite APK page saved.");
    } catch {
      setMessage("Network error. Please retry.");
    } finally {
      setSaving(false);
    }
  }

  async function onReset() {
    if (!window.confirm("Reset BGMI Lite APK page to built-in defaults?")) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/bgmi-lite-apk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "reset" }),
      });
      if (!res.ok) {
        setMessage(await readApiError(res, "Could not reset BGMI Lite APK page."));
        return;
      }
      const json = (await res.json()) as {
        page?: BgmiLiteBetaApkPageContent;
        usingDefault?: boolean;
      };
      if (json.page) setPage(json.page);
      setUsingDefault(Boolean(json.usingDefault));
      setMessage("Reverted to built-in BGMI Lite APK defaults.");
    } catch {
      setMessage("Network error. Please retry.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-section">
      <div className="admin-comments-head">
        <h1>BGMI Lite APK</h1>
        <a
          className="admin-news-btn admin-news-btn-edit"
          href={BGMI_LITE_APK_PATH}
          target="_blank"
          rel="noreferrer"
        >
          Preview page
        </a>
      </div>

      <form onSubmit={onSave}>
        <AdminBgmiLiteApkForm
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
  );
}
