"use client";

import { FormEvent, useState } from "react";
import { useAdminFlash } from "@/src/components/admin/AdminToast";
import { ClientErrorBoundary } from "@/src/components/ClientErrorBoundary";
import {
  FREE_FIRE_REDEEM_CODE_PATH,
  type FreeFireRedeemCodePageContent,
} from "@/src/lib/freeFireRedeemCodes";
import { messageFromUnknownError, readApiError } from "@/src/lib/userFacingError";
import {
  AdminFreeFireRedeemForm,
  type RedeemAdminSectionId,
} from "./AdminFreeFireRedeemForm";

type InitialData = {
  page: FreeFireRedeemCodePageContent;
  usingDefault: boolean;
};

export type AdminFreeFireRedeemClientProps = {
  initialData: InitialData;
  apiPath?: string;
  previewPath?: string;
  heading?: string;
  savedPathLabel?: string;
  saveSuccessMessage?: string;
  resetSuccessMessage?: string;
  boundaryLabel?: string;
};

export default function AdminFreeFireRedeemClient({
  initialData,
  apiPath = "/api/admin/free-fire-redeem",
  previewPath = FREE_FIRE_REDEEM_CODE_PATH,
  heading = "Free Fire Redeem Codes",
  savedPathLabel = "/free-fire-redeem-code",
  saveSuccessMessage = "Free Fire redeem codes page saved.",
  resetSuccessMessage = "Reverted to built-in redeem code defaults.",
  boundaryLabel = "Free Fire Redeem admin",
}: AdminFreeFireRedeemClientProps) {
  const [page, setPage] = useState(initialData.page);
  const [usingDefault, setUsingDefault] = useState(initialData.usingDefault);
  const [openIds, setOpenIds] = useState<Set<RedeemAdminSectionId>>(
    () => new Set(["servers", "codes", "faq"]),
  );
  const [saving, setSaving] = useState(false);
  const setMessage = useAdminFlash();

  const liveCount = page.codes.filter((c) => c.status === "live").length;

  function toggle(id: RedeemAdminSectionId) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function patchPage(
    updater: (prev: FreeFireRedeemCodePageContent) => FreeFireRedeemCodePageContent,
  ) {
    setPage((prev) => updater(prev));
  }

  async function parseSaveResponse(res: Response): Promise<{
    page?: FreeFireRedeemCodePageContent;
    usingDefault?: boolean;
  }> {
    try {
      return (await res.json()) as {
        page?: FreeFireRedeemCodePageContent;
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
        setMessage(await readApiError(res, "Could not save redeem codes page."));
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
    if (!window.confirm("Reset redeem codes page to built-in defaults?")) return;
    setSaving(true);
    try {
      const res = await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "reset" }),
      });
      if (!res.ok) {
        setMessage(await readApiError(res, "Could not reset redeem codes page."));
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
      <section className="admin-section admin-redeem-page">
        <div className="admin-comments-head">
          <div>
            <h1>{heading}</h1>
            <p className="admin-redeem-page-sub">
              {usingDefault
                ? "Built-in defaults (not in DB yet). Save to publish your list."
                : `Saved DB content for ${savedPathLabel}.`}
            </p>
          </div>
          <a
            className="admin-news-btn admin-news-btn-edit"
            href={previewPath}
            target="_blank"
            rel="noreferrer"
          >
            Preview page
          </a>
        </div>

        <div className="admin-redeem-summary">
          <span>{page.codes.length} codes</span>
          <span className="is-live">{liveCount} live</span>
          <span>{page.codes.length - liveCount} expired</span>
          <span>{page.faqs.length} FAQs</span>
        </div>

        <form onSubmit={onSave} className="admin-redeem-form">
          <AdminFreeFireRedeemForm
            page={page}
            openIds={openIds}
            onToggle={toggle}
            onPatch={patchPage}
          />

          <div className="admin-redeem-sticky-bar">
            <div className="admin-redeem-sticky-meta">
              {usingDefault ? "Unsaved defaults" : "Ready to publish changes"}
            </div>
            <div className="admin-redeem-sticky-actions">
              <button
                type="button"
                className="admin-news-btn admin-news-btn-edit"
                onClick={onReset}
                disabled={saving}
              >
                Reset
              </button>
              <button type="submit" className="admin-news-btn" disabled={saving}>
                {saving ? "Saving…" : "Save page"}
              </button>
            </div>
          </div>
        </form>
      </section>
    </ClientErrorBoundary>
  );
}
