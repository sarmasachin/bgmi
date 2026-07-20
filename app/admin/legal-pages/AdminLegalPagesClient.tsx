"use client";

import dynamic from "next/dynamic";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { AdminLegalPageRow } from "@/src/server/admin/mapAdminLegalPages";
import { useAdminFlash } from "@/src/components/admin/AdminToast";
import { readApiError } from "@/src/lib/userFacingError";
import {
  CORE_LEGAL_SLUGS,
  defaultSeoForSlug,
  defaultTitleForSlug,
  legalPublicPath,
} from "@/src/lib/legalPages";

const RichTextEditor = dynamic(
  () => import("@/src/components/admin/RichTextEditor").then((mod) => mod.RichTextEditor),
  { ssr: false, loading: () => <p>Loading editor…</p> },
);

const EDITOR_DRAFT_KEY = "bgmi_admin_legal_editor_draft_v1";

type Props = {
  initialRows?: AdminLegalPageRow[];
};

type FormState = {
  title: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  content: string;
  status: "draft" | "published";
};

const emptyForm = (): FormState => ({
  title: "",
  slug: "privacy",
  seoTitle: "",
  seoDescription: "",
  content: "",
  status: "draft",
});

function mapLoaded(item: Record<string, unknown>): AdminLegalPageRow {
  const content = item.content;
  let contentHtml = "";
  if (typeof content === "string") contentHtml = content;
  else if (content && typeof content === "object" && "html" in content) {
    contentHtml = String((content as { html?: unknown }).html ?? "");
  } else if (typeof item.contentHtml === "string") {
    contentHtml = item.contentHtml;
  }

  return {
    id: String(item.id ?? ""),
    title: String(item.title ?? ""),
    slug: String(item.slug ?? ""),
    status: item.status === "published" ? "published" : "draft",
    seoTitle: String(item.seoTitle ?? ""),
    seoDescription: String(item.seoDescription ?? ""),
    contentHtml,
    updatedAt: item.updatedAt ? String(item.updatedAt) : "",
  };
}

function publicPath(slug: string) {
  return legalPublicPath(slug);
}

export default function AdminLegalPagesClient({ initialRows }: Props) {
  const [rows, setRows] = useState<AdminLegalPageRow[]>(initialRows ?? []);
  const [loading, setLoading] = useState(initialRows === undefined);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editorNonce, setEditorNonce] = useState(0);
  const [saving, setSaving] = useState(false);
  const setMessage = useAdminFlash();

  const missingCore = useMemo(() => {
    const have = new Set(rows.map((r) => r.slug));
    return CORE_LEGAL_SLUGS.filter((slug) => !have.has(slug));
  }, [rows]);

  async function loadRows(ensure = false) {
    setLoading(true);
    try {
      const qs = ensure ? "?ensure=1" : "";
      const res = await fetch(`/api/admin/legal-pages${qs}`, {
        cache: "no-store",
        credentials: "include",
      });
      if (!res.ok) {
        setMessage("Failed to load legal pages.");
        setRows([]);
        return;
      }
      const json = (await res.json()) as { data?: Array<Record<string, unknown>> };
      setRows((json.data ?? []).map(mapLoaded));
    } catch {
      setMessage("Network error. Please retry.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialRows !== undefined) return;
    void loadRows(true);
  }, [initialRows]);

  function openCreate(slugHint?: string) {
    const slug = slugHint || "privacy";
    const seo = defaultSeoForSlug(slug);
    try {
      localStorage.removeItem(EDITOR_DRAFT_KEY);
    } catch {
      /* ignore */
    }
    setEditingId(null);
    setForm({
      title: defaultTitleForSlug(slug),
      slug,
      seoTitle: seo.seoTitle,
      seoDescription: seo.seoDescription,
      content: "",
      status: "published",
    });
    setEditorNonce((n) => n + 1);
    setFormOpen(true);
  }

  function openEdit(row: AdminLegalPageRow) {
    try {
      localStorage.removeItem(EDITOR_DRAFT_KEY);
    } catch {
      /* ignore */
    }
    setEditingId(row.id);
    setForm({
      title: row.title,
      slug: row.slug,
      seoTitle: row.seoTitle,
      seoDescription: row.seoDescription,
      content: row.contentHtml,
      status: row.status,
    });
    setEditorNonce((n) => n + 1);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm());
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    if (!form.title.trim() || !form.slug.trim()) {
      setMessage("Title and slug are required.");
      return;
    }

    setSaving(true);
    try {
      const body = {
        ...(editingId ? { id: editingId } : {}),
        title: form.title.trim(),
        slug: form.slug.trim(),
        seoTitle: form.seoTitle.trim(),
        seoDescription: form.seoDescription.trim(),
        content: form.content,
        status: form.status,
      };
      const res = await fetch("/api/admin/legal-pages", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        setMessage(await readApiError(res, "Could not save legal page."));
        return;
      }
      setMessage(editingId ? "Legal page updated." : "Legal page created.");
      closeForm();
      await loadRows();
    } catch {
      setMessage("Network error. Please retry.");
    } finally {
      setSaving(false);
    }
  }

  async function setStatus(id: string, status: "draft" | "published") {
    setWorkingId(id);
    try {
      const res = await fetch("/api/admin/legal-pages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, status }),
      });
      setMessage(res.ok ? `Marked as ${status}.` : await readApiError(res, "Update failed."));
      if (res.ok) await loadRows();
    } catch {
      setMessage("Network error. Please retry.");
    }
    setWorkingId(null);
  }

  async function removePage(id: string) {
    if (!window.confirm("Delete this legal page?")) return;
    setWorkingId(id);
    try {
      const res = await fetch(`/api/admin/legal-pages?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      setMessage(res.ok ? "Legal page deleted." : await readApiError(res, "Delete failed."));
      if (res.ok) {
        if (editingId === id) closeForm();
        await loadRows();
      }
    } catch {
      setMessage("Network error. Please retry.");
    }
    setWorkingId(null);
  }

  return (
    <section className="admin-section admin-comments-section">
      <div className="admin-comments-head">
        <h1>Legal Pages</h1>
        <div className="admin-news-actions-wrap" style={{ gap: 8 }}>
          <button
            type="button"
            className="admin-news-btn admin-news-btn-primary"
            onClick={() => openCreate("privacy")}
            onMouseEnter={() => {
              void import("@/src/components/admin/RichTextEditor");
            }}
          >
            New page
          </button>
          <button
            type="button"
            className="admin-news-btn admin-news-btn-edit"
            onClick={() => void loadRows(true)}
          >
            Ensure Privacy / Terms / Disclaimer
          </button>
          <button type="button" className="admin-news-btn admin-news-btn-edit" onClick={() => void loadRows()}>
            Refresh
          </button>
        </div>
      </div>

      {missingCore.length > 0 ? (
        <p className="admin-ratings-message" style={{ marginBottom: 12 }}>
          Missing core pages: {missingCore.join(", ")}. Use “Ensure Privacy / Terms / Disclaimer” or create them
          manually.
        </p>
      ) : null}

      {formOpen ? (
        <form className="admin-news-form" onSubmit={onSubmit} style={{ marginBottom: 20 }}>
          <h2 style={{ marginTop: 0 }}>{editingId ? "Edit legal page" : "Create legal page"}</h2>
          <div className="admin-news-form-grid">
            <label>
              Title
              <input
                className="admin-input"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                maxLength={160}
                required
              />
            </label>
            <label>
              Slug
              <select
                className="admin-input"
                value={
                  (CORE_LEGAL_SLUGS as readonly string[]).includes(form.slug) ? form.slug : "__custom__"
                }
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "__custom__") {
                    setForm((f) => ({ ...f, slug: "" }));
                    return;
                  }
                  const seo = defaultSeoForSlug(v);
                  setForm((f) => ({
                    ...f,
                    slug: v,
                    title: f.title.trim() ? f.title : defaultTitleForSlug(v),
                    seoTitle: f.seoTitle.trim() ? f.seoTitle : seo.seoTitle,
                    seoDescription: f.seoDescription.trim() ? f.seoDescription : seo.seoDescription,
                  }));
                }}
              >
                <option value="privacy">privacy</option>
                <option value="terms">terms</option>
                <option value="disclaimer">disclaimer</option>
                <option value="__custom__">Custom slug…</option>
              </select>
            </label>
            {!(CORE_LEGAL_SLUGS as readonly string[]).includes(form.slug) ? (
              <label>
                Custom slug
                <input
                  className="admin-input"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="cookie-policy"
                  maxLength={80}
                  required
                />
              </label>
            ) : null}
            <label>
              Status
              <select
                className="admin-input"
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    status: e.target.value === "published" ? "published" : "draft",
                  }))
                }
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>
            <label>
              SEO title
              <input
                className="admin-input"
                value={form.seoTitle}
                onChange={(e) => setForm((f) => ({ ...f, seoTitle: e.target.value }))}
                maxLength={160}
              />
            </label>
            <label style={{ gridColumn: "1 / -1" }}>
              SEO description
              <textarea
                className="admin-input"
                value={form.seoDescription}
                onChange={(e) => setForm((f) => ({ ...f, seoDescription: e.target.value }))}
                rows={2}
                maxLength={320}
              />
            </label>
          </div>

          <div style={{ marginTop: 12 }}>
            <p style={{ marginBottom: 8, fontWeight: 700 }}>Page content</p>
            <RichTextEditor
              key={`legal-editor-${editingId ?? "new"}-${editorNonce}`}
              value={form.content}
              onChange={(value) => setForm((f) => ({ ...f, content: value }))}
              storageKey={EDITOR_DRAFT_KEY}
            />
          </div>

          <div className="admin-news-actions-wrap" style={{ marginTop: 14, gap: 8 }}>
            <button type="submit" className="admin-news-btn admin-news-btn-primary" disabled={saving}>
              {saving ? "Saving…" : editingId ? "Update" : "Create"}
            </button>
            <button type="button" className="admin-news-btn admin-news-btn-edit" onClick={closeForm}>
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <div className="admin-table-wrap">
        <table className="admin-table admin-comments-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Slug / URL</th>
              <th>Status</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5}>Loading…</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5}>No legal pages yet. Create Privacy, Terms, and Disclaimer.</td>
              </tr>
            ) : (
              rows.map((row) => {
                const busy = workingId === row.id;
                const href = publicPath(row.slug);
                return (
                  <tr key={row.id}>
                    <td style={{ fontWeight: 700 }}>{row.title}</td>
                    <td>
                      <div>{row.slug}</div>
                      <a href={href} target="_blank" rel="noreferrer" style={{ opacity: 0.85 }}>
                        {href}
                      </a>
                    </td>
                    <td>{row.status}</td>
                    <td>
                      {row.updatedAt
                        ? new Date(row.updatedAt).toLocaleString()
                        : "—"}
                    </td>
                    <td className="admin-news-actions">
                      <div className="admin-news-actions-wrap">
                        <button
                          type="button"
                          className="admin-news-btn admin-news-btn-edit"
                          disabled={busy}
                          onClick={() => openEdit(row)}
                        >
                          Edit
                        </button>
                        {row.status === "published" ? (
                          <button
                            type="button"
                            className="admin-news-btn admin-news-btn-edit"
                            disabled={busy}
                            onClick={() => void setStatus(row.id, "draft")}
                          >
                            Unpublish
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="admin-news-btn admin-news-btn-primary"
                            disabled={busy}
                            onClick={() => void setStatus(row.id, "published")}
                          >
                            Publish
                          </button>
                        )}
                        <button
                          type="button"
                          className="admin-news-btn admin-news-btn-danger"
                          disabled={busy}
                          onClick={() => void removePage(row.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
