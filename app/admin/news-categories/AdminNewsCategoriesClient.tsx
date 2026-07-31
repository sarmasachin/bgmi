"use client";

import { FormEvent, useState } from "react";
import type { AdminNewsCategoryRow } from "@/src/server/admin/mapAdminNewsCategoryRows";
import { useAdminFlash } from "@/src/components/admin/AdminToast";
import { readApiError } from "@/src/lib/userFacingError";
import { normalizeCategorySlugInput } from "@/src/lib/newsCategories";

type Props = {
  initialRows: AdminNewsCategoryRow[];
};

export default function AdminNewsCategoriesClient({ initialRows }: Props) {
  const setMessage = useAdminFlash();
  const [rows, setRows] = useState(initialRows);
  const [slug, setSlug] = useState("");
  const [label, setLabel] = useState("");
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
    setSlug("");
    setLabel("");
  }

  function startEdit(row: AdminNewsCategoryRow) {
    setEditingId(row.id);
    setSlug(row.slug);
    setLabel(row.label);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const payload = {
        slug: normalizeCategorySlugInput(slug),
        label: label.trim(),
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
        Categories build public URLs like <code>/ff-max/article-slug</code>. Used articles cannot be
        deleted until posts are moved.
      </p>

      <form onSubmit={onSubmit} className="admin-inline-form" style={{ marginBottom: 24 }}>
        <div className="admin-field">
          <input
            name="label"
            placeholder="Label (e.g. Free Fire)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            required
          />
        </div>
        <div className="admin-field">
          <input
            name="slug"
            placeholder="slug (e.g. free-fire)"
            value={slug}
            onChange={(e) => setSlug(normalizeCategorySlugInput(e.target.value))}
            required
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.label}</td>
                <td>
                  /{row.slug}/…
                </td>
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
