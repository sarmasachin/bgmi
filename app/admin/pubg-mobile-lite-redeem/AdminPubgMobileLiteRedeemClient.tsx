"use client";

import { FormEvent, useState } from "react";
import { useAdminFlash } from "@/src/components/admin/AdminToast";
import { ClientErrorBoundary } from "@/src/components/ClientErrorBoundary";
import {
  PUBG_MOBILE_LITE_REDEEM_CODE_PATH,
  type PubgMobileLiteRedeemCodePageContent,
} from "@/src/lib/pubgMobileLiteRedeemCodes";
import { messageFromUnknownError, readApiError } from "@/src/lib/userFacingError";
import {
  AdminPubgMobileLiteRedeemForm,
  type RedeemAdminSectionId,
} from "./AdminPubgMobileLiteRedeemForm";

type InitialData = {
  page: PubgMobileLiteRedeemCodePageContent;
  usingDefault: boolean;
};

type Props = { initialData: InitialData };

export default function AdminPubgMobileLiteRedeemClient({ initialData }: Props) {
  const [page, setPage] = useState(initialData.page);
  const [usingDefault, setUsingDefault] = useState(initialData.usingDefault);
  const [openIds, setOpenIds] = useState<Set<RedeemAdminSectionId>>(
    () => new Set(["codes", "faq"]),
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
    updater: (prev: PubgMobileLiteRedeemCodePageContent) => PubgMobileLiteRedeemCodePageContent,
  ) {
    setPage((prev) => updater(prev));
  }

  async function parseSaveResponse(res: Response): Promise<{
    page?: PubgMobileLiteRedeemCodePageContent;
    usingDefault?: boolean;
  }> {
    try {
      return (await res.json()) as {
        page?: PubgMobileLiteRedeemCodePageContent;
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
      const res = await fetch("/api/admin/pubg-mobile-lite-redeem", {
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
      setMessage("PUBG Mobile Lite redeem codes page saved.");
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
      const res = await fetch("/api/admin/pubg-mobile-lite-redeem", {
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
      setMessage("Reverted to built-in redeem code defaults.");
    } catch (err) {
      setMessage(messageFromUnknownError(err, "Network error. Please retry."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <ClientErrorBoundary label="PUBG Mobile Lite Redeem admin">
      <section className="admin-section admin-redeem-page">
        <div className="admin-comments-head">
          <div>
            <h1>PUBG Mobile Lite Redeem Codes</h1>
            <p className="admin-redeem-page-sub">
              {usingDefault
                ? "Built-in defaults (not in DB yet). Save to publish your list."
                : "Saved DB content for /pubg-mobile-lite-redeem-code."}
            </p>
          </div>
          <a
            className="admin-news-btn admin-news-btn-edit"
            href={PUBG_MOBILE_LITE_REDEEM_CODE_PATH}
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
          <AdminPubgMobileLiteRedeemForm
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
