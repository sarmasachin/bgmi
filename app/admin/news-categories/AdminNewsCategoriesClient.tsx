"use client";

import { FormEvent, useState } from "react";
import type { AdminNewsCategoryRow } from "@/src/server/admin/mapAdminNewsCategoryRows";
import { useAdminFlash } from "@/src/components/admin/AdminToast";
import { readApiError } from "@/src/lib/userFacingError";
import { normalizeCategorySlugInput } from "@/src/lib/newsCategories";

type Props = {
  initialRows: AdminNewsCategoryRow[];
};

type FormState = {
  slug: string;
  label: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
};

const emptyForm = (): FormState => ({
  slug: "",
  label: "",
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
});

export default function AdminNewsCategoriesClient({ initialRows }: Props) {
  const setMessage = useAdminFlash();
  const [rows, setRows] = useState(initialRows);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function reload() {
    const res = await fetch("/api/admin/news-categories");
    if (!res.ok) {
      setMessage("Failed to load categories.");
      return;
    }
    const json = await res.json();
    setRows(json.data ?? []);
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm());
  }

  function startEdit(row: AdminNewsCategoryRow) {
    setEditingId(row.id);
    setForm({
      slug: row.slug,
      label: row.label,
      seoTitle: row.seoTitle,
      seoDescription: row.seoDescription,
      seoKeywords: row.seoKeywords,
    });
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const payload = {
        slug: normalizeCategorySlugInput(form.slug),
        label: form.label.trim(),
        seoTitle: form.seoTitle.trim(),
        seoDescription: form.seoDescription.trim(),
        seoKeywords: form.seoKeywords.trim(),
      };
      const res = await fetch(
        "/api/admin/news-categories",
        editingId
          ? {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: editingId, ...payload }),
            }
          : {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            },
      );
      if (!res.ok) {
        setMessage(await readApiError(res, "Could not save category."));
        return;
      }
      setMessage(editingId ? "Category updated." : "Category created.");
      resetForm();
      await reload();
    } catch {
      setMessage("Network error. Please retry.");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id: string, rowLabel: string) {
    if (!window.confirm(`Delete category “${rowLabel}”?`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/news-categories?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setMessage(await readApiError(res, "Could not delete category."));
        return;
      }
      setMessage("Category deleted.");
      if (editingId === id) resetForm();
      await reload();
    } catch {
      setMessage("Network error. Please retry.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="admin-section">
      <div className="admin-section-head-row">
        <h1>News Categories</h1>
      </div>
      <p className="admin-dashboard-subtitle">
        Categories build public URLs like <code>/ff-max/article-slug</code>. SEO title / description
        / keywords apply to the category listing page. Used articles cannot be deleted until posts
        are moved.
      </p>

      <form onSubmit={onSubmit} className="admin-inline-form" style={{ marginBottom: 24 }}>
        <div className="admin-field">
          <input
            name="label"
            placeholder="Label (e.g. BGMI Lite)"
            value={form.label}
            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            required
          />
        </div>
        <div className="admin-field">
          <input
            name="slug"
            placeholder="slug (e.g. bgmi-lite)"
            value={form.slug}
            onChange={(e) =>
              setForm((f) => ({ ...f, slug: normalizeCategorySlugInput(e.target.value) }))
            }
            required
          />
        </div>
        <div className="admin-field" style={{ gridColumn: "1 / -1" }}>
          <input
            name="seoTitle"
            placeholder="SEO / H1 title (optional)"
            value={form.seoTitle}
            onChange={(e) => setForm((f) => ({ ...f, seoTitle: e.target.value }))}
            maxLength={160}
          />
        </div>
        <div className="admin-field" style={{ gridColumn: "1 / -1" }}>
          <textarea
            name="seoDescription"
            placeholder="SEO description (optional)"
            value={form.seoDescription}
            onChange={(e) => setForm((f) => ({ ...f, seoDescription: e.target.value }))}
            rows={2}
            maxLength={320}
          />
        </div>
        <div className="admin-field" style={{ gridColumn: "1 / -1" }}>
          <input
            name="seoKeywords"
            placeholder="SEO keywords, comma separated (optional)"
            value={form.seoKeywords}
            onChange={(e) => setForm((f) => ({ ...f, seoKeywords: e.target.value }))}
            maxLength={400}
          />
        </div>
        <button type="submit" className="admin-news-btn admin-news-btn-primary" disabled={busy}>
          {editingId ? "Update Category" : "Add Category"}
        </button>
        {editingId ? (
          <button
            type="button"
            className="admin-news-btn admin-news-btn-edit"
            disabled={busy}
            onClick={resetForm}
          >
            Cancel
          </button>
        ) : null}
      </form>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Label</th>
              <th>Slug / URL</th>
              <th>SEO title</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.label}</td>
                <td>/{row.slug}/…</td>
                <td>{row.seoTitle || "—"}</td>
                <td className="admin-news-actions">
                  <div className="admin-news-actions-wrap">
                    <button
                      type="button"
                      className="admin-news-btn admin-news-btn-edit"
                      disabled={busy}
                      onClick={() => startEdit(row)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="admin-news-btn admin-news-btn-danger"
                      disabled={busy}
                      onClick={() => void onDelete(row.id, row.label)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
