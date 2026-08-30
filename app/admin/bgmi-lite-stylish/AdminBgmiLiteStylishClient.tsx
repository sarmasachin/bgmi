"use client";

import { FormEvent, useState } from "react";
import { useAdminFlash } from "@/src/components/admin/AdminToast";
import {
  BGMI_LITE_STYLISH_NAME_PATH,
  type BgmiLiteStylishNamePageContent,
} from "@/src/lib/bgmiLiteStylishNamePage";
import { readApiError } from "@/src/lib/userFacingError";
import {
  AdminBgmiLiteStylishForm,
  type StylishAdminSectionId,
} from "./AdminBgmiLiteStylishForm";

type InitialData = {
  page: BgmiLiteStylishNamePageContent;
  usingDefault: boolean;
};

type Props = { initialData: InitialData };

export default function AdminBgmiLiteStylishClient({ initialData }: Props) {
  const [page, setPage] = useState(initialData.page);
  const [usingDefault, setUsingDefault] = useState(initialData.usingDefault);
  const [openIds, setOpenIds] = useState<Set<StylishAdminSectionId>>(
    () => new Set(["seo", "copy", "article", "faq"]),
  );
  const [saving, setSaving] = useState(false);
  const setMessage = useAdminFlash();

  function toggle(id: StylishAdminSectionId) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function patchPage(
    updater: (prev: BgmiLiteStylishNamePageContent) => BgmiLiteStylishNamePageContent,
  ) {
    setPage((prev) => updater(prev));
  }

  async function onSave(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/bgmi-lite-stylish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "save", page }),
      });
      if (!res.ok) {
        setMessage(await readApiError(res, "Could not save stylish name page."));
        return;
      }
      const json = (await res.json()) as {
        page?: BgmiLiteStylishNamePageContent;
        usingDefault?: boolean;
      };
      if (json.page) setPage(json.page);
      setUsingDefault(Boolean(json.usingDefault));
      setMessage("BGMI Lite stylish name page saved.");
    } catch {
      setMessage("Network error. Please retry.");
    } finally {
      setSaving(false);
    }
  }

  async function onReset() {
    if (!window.confirm("Reset stylish name page to built-in defaults?")) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/bgmi-lite-stylish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "reset" }),
      });
      if (!res.ok) {
        setMessage(await readApiError(res, "Could not reset stylish name page."));
        return;
      }
      const json = (await res.json()) as {
        page?: BgmiLiteStylishNamePageContent;
        usingDefault?: boolean;
      };
      if (json.page) setPage(json.page);
      setUsingDefault(Boolean(json.usingDefault));
      setMessage("Reverted to built-in stylish name defaults.");
    } catch {
      setMessage("Network error. Please retry.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-section">
      <div className="admin-comments-head">
        <h1>BGMI Lite Stylish Name</h1>
        <a
          className="admin-news-btn admin-news-btn-edit"
          href={BGMI_LITE_STYLISH_NAME_PATH}
          target="_blank"
          rel="noreferrer"
        >
          Preview page
        </a>
      </div>

      <p style={{ color: "#94a3b8", marginBottom: 16 }}>
        {usingDefault
          ? "Using built-in defaults (not saved in DB yet). Edit title, article, FAQ — then Save."
          : "Showing saved DB content for /bgmi-lite-stylish-name. Name generator stays code-based."}
      </p>

      <form onSubmit={onSave}>
        <AdminBgmiLiteStylishForm
          page={page}
          openIds={openIds}
          onToggle={toggle}
          onPatch={patchPage}
        />
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
          <button type="submit" className="admin-news-btn" disabled={saving}>
            {saving ? "Saving…" : "Save page"}
          </button>
          <button
            type="button"
            className="admin-news-btn admin-news-btn-edit"
            onClick={onReset}
            disabled={saving}
          >
            Reset to defaults
          </button>
        </div>
      </form>
    </section>
  );
}
