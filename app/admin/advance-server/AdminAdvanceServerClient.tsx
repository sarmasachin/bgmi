"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAdminToast } from "@/src/components/admin/AdminToast";
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
  loadError?: boolean;
};

export default function AdminAdvanceServerClient({ initialData, loadError = false }: Props) {
  const [page, setPage] = useState(initialData.page);
  const [openIds, setOpenIds] = useState<Set<AdvanceServerPageSectionId>>(
    () => new Set(),
  );
  const [saving, setSaving] = useState(false);
  const toast = useAdminToast();
  const blocked = loadError || saving;

  useEffect(() => {
    if (loadError) {
      toast.error("Could not load saved Advance Server page. Save is disabled — refresh and try again.");
    }
  }, [loadError, toast]);

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
    if (blocked) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/advance-server", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "save", page }),
      });
      if (!res.ok) {
        toast.error(await readApiError(res, "Could not save Advance Server page."));
        return;
      }
      const json = (await res.json()) as {
        ok?: boolean;
        page?: FfAdvanceServerPageContent;
        warning?: string;
      };
      if (!json.ok || !json.page) {
        toast.error("Could not save Advance Server page.");
        return;
      }
      setPage(json.page);
      if (json.warning) {
        toast.warning(`Advance Server page saved. Push: ${json.warning}`);
      } else {
        toast.success("Advance Server page saved.");
      }
    } catch {
      toast.error("Network error. Please retry.");
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

      {loadError ? (
        <p role="alert" style={{ color: "#fecaca", marginBottom: 16 }}>
          Could not load saved Advance Server content from the database. Save is disabled so live
          copy is not overwritten. Refresh this page and try again.
        </p>
      ) : null}

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
          <button type="submit" className="admin-news-btn admin-news-btn-primary" disabled={blocked}>
            {saving ? "Saving…" : "Save all"}
          </button>
        </div>
      </form>
    </section>
  );
}
