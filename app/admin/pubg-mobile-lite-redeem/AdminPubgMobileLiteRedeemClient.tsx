"use client";

import { FormEvent, useState } from "react";
import { useAdminFlash } from "@/src/components/admin/AdminToast";
import {
  PUBG_MOBILE_LITE_REDEEM_CODE_PATH,
  type PubgMobileLiteRedeemCodePageContent,
} from "@/src/lib/pubgMobileLiteRedeemCodes";
import { readApiError } from "@/src/lib/userFacingError";
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
    () => new Set(["seo", "copy", "article", "codes"]),
  );
  const [saving, setSaving] = useState(false);
  const setMessage = useAdminFlash();

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
      const json = (await res.json()) as {
        page?: PubgMobileLiteRedeemCodePageContent;
        usingDefault?: boolean;
      };
      if (json.page) setPage(json.page);
      setUsingDefault(Boolean(json.usingDefault));
      setMessage("PUBG Mobile Lite redeem codes page saved.");
    } catch {
      setMessage("Network error. Please retry.");
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
      const json = (await res.json()) as {
        page?: PubgMobileLiteRedeemCodePageContent;
        usingDefault?: boolean;
      };
      if (json.page) setPage(json.page);
      setUsingDefault(Boolean(json.usingDefault));
      setMessage("Reverted to built-in redeem code defaults.");
    } catch {
      setMessage("Network error. Please retry.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-section">
      <div className="admin-comments-head">
        <h1>PUBG Mobile Lite Redeem Codes</h1>
        <a
          className="admin-news-btn admin-news-btn-edit"
          href={PUBG_MOBILE_LITE_REDEEM_CODE_PATH}
          target="_blank"
          rel="noreferrer"
        >
          Preview page
        </a>
      </div>

      <p style={{ color: "#94a3b8", marginBottom: 16 }}>
        {usingDefault
          ? "Using built-in defaults (not saved in DB yet). Public page shows “No new codes today” until you Save."
          : "Showing saved DB content for /pubg-mobile-lite-redeem-code. Each Save marks “updated today” (IST) on the public page."}
      </p>

      <form onSubmit={onSave}>
        <AdminPubgMobileLiteRedeemForm
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
