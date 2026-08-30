"use client";

import { FormEvent, useState } from "react";
import { useAdminFlash } from "@/src/components/admin/AdminToast";
import {
  PUBG_MOBILE_LITE_NAME_PATH,
  type PubgMobileLiteNamePageContent,
} from "@/src/lib/pubgMobileLiteNamePage";
import { readApiError } from "@/src/lib/userFacingError";
import {
  AdminPubgMobileLiteNameForm,
  type NameAdminSectionId,
} from "./AdminPubgMobileLiteNameForm";

type InitialData = {
  page: PubgMobileLiteNamePageContent;
  usingDefault: boolean;
};

type Props = { initialData: InitialData };

export default function AdminPubgMobileLiteNameClient({ initialData }: Props) {
  const [page, setPage] = useState(initialData.page);
  const [usingDefault, setUsingDefault] = useState(initialData.usingDefault);
  const [openIds, setOpenIds] = useState<Set<NameAdminSectionId>>(
    () => new Set(["seo", "copy", "article", "faq"]),
  );
  const [saving, setSaving] = useState(false);
  const setMessage = useAdminFlash();

  function toggle(id: NameAdminSectionId) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function patchPage(
    updater: (prev: PubgMobileLiteNamePageContent) => PubgMobileLiteNamePageContent,
  ) {
    setPage((prev) => updater(prev));
  }

  async function onSave(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/pubg-mobile-lite-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "save", page }),
      });
      if (!res.ok) {
        setMessage(await readApiError(res, "Could not save name page."));
        return;
      }
      const json = (await res.json()) as {
        page?: PubgMobileLiteNamePageContent;
        usingDefault?: boolean;
      };
      if (json.page) setPage(json.page);
      setUsingDefault(Boolean(json.usingDefault));
      setMessage("PUBG Mobile Lite name page saved.");
    } catch {
      setMessage("Network error. Please retry.");
    } finally {
      setSaving(false);
    }
  }

  async function onReset() {
    if (!window.confirm("Reset name page to built-in defaults?")) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/pubg-mobile-lite-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "reset" }),
      });
      if (!res.ok) {
        setMessage(await readApiError(res, "Could not reset name page."));
        return;
      }
      const json = (await res.json()) as {
        page?: PubgMobileLiteNamePageContent;
        usingDefault?: boolean;
      };
      if (json.page) setPage(json.page);
      setUsingDefault(Boolean(json.usingDefault));
      setMessage("Reverted to built-in name page defaults.");
    } catch {
      setMessage("Network error. Please retry.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-section">
      <div className="admin-comments-head">
        <h1>PUBG Mobile Lite Name</h1>
        <a
          className="admin-news-btn admin-news-btn-edit"
          href={PUBG_MOBILE_LITE_NAME_PATH}
          target="_blank"
          rel="noreferrer"
        >
          Preview page
        </a>
      </div>

      <p style={{ color: "#94a3b8", marginBottom: 16 }}>
        {usingDefault
          ? "Using built-in defaults (not saved in DB yet). Edit title, article, FAQ — then Save."
          : "Showing saved DB content for /pubg-mobile-lite-name. Name generator stays code-based."}
      </p>

      <form onSubmit={onSave}>
        <AdminPubgMobileLiteNameForm
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
