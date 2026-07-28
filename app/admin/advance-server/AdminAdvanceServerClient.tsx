"use client";

import { FormEvent, useState } from "react";
import { useAdminFlash } from "@/src/components/admin/AdminToast";
import { FREE_FIRE_ADVANCE_SERVER_PATH } from "@/src/lib/ffAdvanceServerPage";
import type {
  AdvanceServerPageSectionId,
  FfAdvanceServerPageContent,
} from "@/src/lib/advanceServerPageTypes";
import { readApiError } from "@/src/lib/userFacingError";
import { AdminAdvanceServerForm } from "./AdminAdvanceServerForm";

type InitialData = {
  page: FfAdvanceServerPageContent;
  usingDefault: boolean;
};

type Props = {
  initialData: InitialData;
};

export default function AdminAdvanceServerClient({ initialData }: Props) {
  const [page, setPage] = useState(initialData.page);
  const [usingDefault, setUsingDefault] = useState(initialData.usingDefault);
  const [openIds, setOpenIds] = useState<Set<AdvanceServerPageSectionId>>(
    () => new Set(["seo", "hero"]),
  );
  const [saving, setSaving] = useState(false);
  const setMessage = useAdminFlash();

  function toggle(id: AdvanceServerPageSectionId) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function patchPage(updater: (prev: FfAdvanceServerPageContent) => FfAdvanceServerPageContent) {
    setPage((prev) => updater(prev));
  }

  async function onSave(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/advance-server", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "save", page }),
      });
      if (!res.ok) {
        setMessage(await readApiError(res, "Could not save Advance Server page."));
        return;
      }
      const json = (await res.json()) as {
        page?: FfAdvanceServerPageContent;
        usingDefault?: boolean;
      };
      if (json.page) setPage(json.page);
      setUsingDefault(Boolean(json.usingDefault));
      setMessage("Advance Server page saved.");
    } catch {
      setMessage("Network error. Please retry.");
    } finally {
      setSaving(false);
    }
  }

  async function onReset() {
    if (!window.confirm("Reset Advance Server page to built-in defaults?")) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/advance-server", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "reset" }),
      });
      if (!res.ok) {
        setMessage(await readApiError(res, "Could not reset Advance Server page."));
        return;
      }
      const json = (await res.json()) as {
        page?: FfAdvanceServerPageContent;
        usingDefault?: boolean;
      };
      if (json.page) setPage(json.page);
      setUsingDefault(Boolean(json.usingDefault));
      setMessage("Reverted to built-in Advance Server defaults.");
    } catch {
      setMessage("Network error. Please retry.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-section">
      <div className="admin-comments-head">
        <h1>Advance Server</h1>
        <a
          className="admin-news-btn admin-news-btn-edit"
          href={FREE_FIRE_ADVANCE_SERVER_PATH}
          target="_blank"
          rel="noreferrer"
        >
          Preview page
        </a>
      </div>

      <form onSubmit={onSave}>
        <AdminAdvanceServerForm
          page={page}
          openIds={openIds}
          onToggle={toggle}
          onPatch={patchPage}
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
