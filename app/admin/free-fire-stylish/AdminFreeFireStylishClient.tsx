"use client";

import { FormEvent, useState } from "react";
import { useAdminFlash } from "@/src/components/admin/AdminToast";
import { ClientErrorBoundary } from "@/src/components/ClientErrorBoundary";
import {
  FREE_FIRE_STYLISH_NAME_PATH,
  type FreeFireStylishNamePageContent,
} from "@/src/lib/freeFireStylishNamePage";
import { messageFromUnknownError, readApiError } from "@/src/lib/userFacingError";
import {
  AdminFreeFireStylishForm,
  type NameAdminSectionId,
} from "./AdminFreeFireStylishForm";

type InitialData = {
  page: FreeFireStylishNamePageContent;
  usingDefault: boolean;
};

export type AdminFreeFireStylishClientProps = {
  initialData: InitialData;
  apiPath?: string;
  previewPath?: string;
  heading?: string;
  savedPathLabel?: string;
  pathLockedLabel?: string;
  saveSuccessMessage?: string;
  resetSuccessMessage?: string;
  boundaryLabel?: string;
};

export default function AdminFreeFireStylishClient({
  initialData,
  apiPath = "/api/admin/free-fire-stylish",
  previewPath = FREE_FIRE_STYLISH_NAME_PATH,
  heading = "Free Fire Stylish Name",
  savedPathLabel = "/free-fire-stylish-name",
  pathLockedLabel = "/free-fire-stylish-name",
  saveSuccessMessage = "Free Fire stylish name page saved.",
  resetSuccessMessage = "Reverted to built-in name page defaults.",
  boundaryLabel = "Free Fire Stylish Name admin",
}: AdminFreeFireStylishClientProps) {
  const [page, setPage] = useState(initialData.page);
  const [usingDefault, setUsingDefault] = useState(initialData.usingDefault);
  const [openIds, setOpenIds] = useState<Set<NameAdminSectionId>>(
    () => new Set(["seo", "copy", "ideas", "article", "faq"]),
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
    updater: (prev: FreeFireStylishNamePageContent) => FreeFireStylishNamePageContent,
  ) {
    setPage((prev) => updater(prev));
  }

  async function parseSaveResponse(res: Response): Promise<{
    page?: FreeFireStylishNamePageContent;
    usingDefault?: boolean;
  }> {
    try {
      return (await res.json()) as {
        page?: FreeFireStylishNamePageContent;
        usingDefault?: boolean;
      };
    } catch {
      throw new Error("Invalid server response. Please retry.");
    }
  }

  async function onSave(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "save", page }),
      });
      if (!res.ok) {
        setMessage(await readApiError(res, "Could not save name page."));
        return;
      }
      const json = await parseSaveResponse(res);
      if (json.page) setPage(json.page);
      setUsingDefault(Boolean(json.usingDefault));
      setMessage(saveSuccessMessage);
    } catch (err) {
      setMessage(messageFromUnknownError(err, "Network error. Please retry."));
    } finally {
      setSaving(false);
    }
  }

  async function onReset() {
    if (!window.confirm("Reset name page to built-in defaults?")) return;
    setSaving(true);
    try {
      const res = await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "reset" }),
      });
      if (!res.ok) {
        setMessage(await readApiError(res, "Could not reset name page."));
        return;
      }
      const json = await parseSaveResponse(res);
      if (json.page) setPage(json.page);
      setUsingDefault(Boolean(json.usingDefault));
      setMessage(resetSuccessMessage);
    } catch (err) {
      setMessage(messageFromUnknownError(err, "Network error. Please retry."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <ClientErrorBoundary label={boundaryLabel}>
      <section className="admin-section">
        <div className="admin-comments-head">
          <h1>{heading}</h1>
          <a
            className="admin-news-btn admin-news-btn-edit"
            href={previewPath}
            target="_blank"
            rel="noreferrer"
          >
            Preview page
          </a>
        </div>

        <p style={{ color: "#94a3b8", marginBottom: 16 }}>
          {usingDefault
            ? "Using built-in defaults (not saved in DB yet). Edit copy, ideas chips, article, FAQ — then Save."
            : `Showing saved DB content for ${savedPathLabel}. Studio font engine stays code-based; ideas chips are CMS.`}
        </p>

        <form onSubmit={onSave}>
          <AdminFreeFireStylishForm
            page={page}
            openIds={openIds}
            onToggle={toggle}
            onPatch={patchPage}
            pathLockedLabel={pathLockedLabel}
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
    </ClientErrorBoundary>
  );
}
