"use client";

import { FormEvent, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAdminFlash } from "@/src/components/admin/AdminToast";
import { GTA6_PATH } from "@/src/features/gta6Calculator/gta6-seo";
import { readApiError } from "@/src/lib/userFacingError";
import type { Gta6PageContent } from "@/src/lib/gta6PageTypes";
import { AdminGta6ApkForm } from "./AdminGta6ApkForm";
import { AdminGta6CheatForm } from "./AdminGta6CheatForm";
import { AdminGta6CheatRows } from "./AdminGta6CheatRows";
import { AdminGta6DetailsForm } from "./AdminGta6DetailsForm";
import { AdminGta6HomeForm } from "./AdminGta6HomeForm";
import { AdminGta6MapForm } from "./AdminGta6MapForm";

const TABS = [
  { id: "home", label: "Calculator" },
  { id: "details", label: "Details" },
  { id: "map", label: "Map" },
  { id: "cheats", label: "Cheats" },
  { id: "apk", label: "GT6 APK" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function readTab(raw: string | null): TabId {
  return TABS.some((item) => item.id === raw) ? (raw as TabId) : "home";
}

function AdminGta6Editor({
  initialData,
}: {
  initialData: { page: Gta6PageContent; usingDefault: boolean };
}) {
  const searchParams = useSearchParams();
  const tab = readTab(searchParams.get("tab"));
  const section = TABS.find((item) => item.id === tab)?.label ?? "Calculator";
  const [page, setPage] = useState(initialData.page);
  const [saving, setSaving] = useState(false);
  const setMessage = useAdminFlash();

  async function post(body: unknown, okText: string) {
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/gta-6", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        setMessage(await readApiError(res, "Could not save GTA 6."));
        return;
      }
      const json = (await res.json()) as { page?: Gta6PageContent };
      if (json.page) setPage(json.page);
      setMessage(okText);
    } catch {
      setMessage("Network error. Please retry.");
    } finally {
      setSaving(false);
    }
  }

  function onSave(event: FormEvent) {
    event.preventDefault();
    void post({ action: "save", page }, "GTA 6 saved.");
  }

  return (
    <section className="admin-section">
      <div className="admin-comments-head">
        <h1>GTA 6 — {section}</h1>
        <a className="admin-news-btn admin-news-btn-edit" href={GTA6_PATH} target="_blank" rel="noreferrer">
          Preview calculator
        </a>
      </div>
      <form onSubmit={onSave}>
        {tab === "home" ? <AdminGta6HomeForm page={page} onPatch={setPage} /> : null}
        {tab === "details" ? <AdminGta6DetailsForm page={page} onPatch={setPage} /> : null}
        {tab === "map" ? <AdminGta6MapForm page={page} onPatch={setPage} /> : null}
        {tab === "cheats" ? (
          <>
            <AdminGta6CheatForm page={page} onPatch={setPage} />
            <AdminGta6CheatRows page={page} onPatch={setPage} />
          </>
        ) : null}
        {tab === "apk" ? <AdminGta6ApkForm page={page} onPatch={setPage} /> : null}
        <div className="admin-actions" style={{ marginTop: 16 }}>
          <button type="submit" className="admin-news-btn admin-news-btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save all"}
          </button>
          <button
            type="button"
            className="admin-news-btn"
            disabled={saving}
            onClick={() => {
              if (window.confirm("Reset GTA 6 content to the built-in copy?")) {
                void post({ action: "reset" }, "GTA 6 reset to default.");
              }
            }}
          >
            Reset
          </button>
        </div>
      </form>
    </section>
  );
}

export default function AdminGta6Client({
  initialData,
}: {
  initialData: { page: Gta6PageContent; usingDefault: boolean };
}) {
  return (
    <Suspense fallback={<p style={{ padding: 12 }}>Loading GTA 6…</p>}>
      <AdminGta6Editor initialData={initialData} />
    </Suspense>
  );
}
