"use client";

import { FormEvent, useState } from "react";
import { useAdminFlash } from "@/src/components/admin/AdminToast";
import { defaultNewsListingSeo, type NewsListingSeo } from "@/src/lib/listingSeoDefaults";
import { readApiError } from "@/src/lib/userFacingError";

type Props = {
  initialSeo: NewsListingSeo;
};

export function AdminNewsListingSeoPanel({ initialSeo }: Props) {
  const setMessage = useAdminFlash();
  const [title, setTitle] = useState(initialSeo.title);
  const [description, setDescription] = useState(initialSeo.description);
  const [saving, setSaving] = useState(false);

  async function onSave(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/news-listing-seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim() || defaultNewsListingSeo.title,
          description: description.trim() || defaultNewsListingSeo.description,
        }),
      });
      if (!res.ok) {
        setMessage(await readApiError(res, "Could not save news listing SEO."));
        return;
      }
      const json = (await res.json()) as { seo?: NewsListingSeo };
      if (json.seo) {
        setTitle(json.seo.title);
        setDescription(json.seo.description);
      }
      setMessage("News listing SEO saved.");
    } catch {
      setMessage("Network error. Please retry.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-section" style={{ marginBottom: 16 }}>
      <h2 style={{ margin: "0 0 12px", fontSize: 16 }}>News listing SEO (`/news`)</h2>
      <form onSubmit={onSave}>
        <div className="form-group">
          <label htmlFor="newsListingSeoTitle">Meta / H1 title</label>
          <input
            id="newsListingSeoTitle"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={160}
            placeholder={defaultNewsListingSeo.title}
          />
        </div>
        <div className="form-group">
          <label htmlFor="newsListingSeoDescription">Meta description</label>
          <textarea
            id="newsListingSeoDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={320}
            placeholder={defaultNewsListingSeo.description}
          />
        </div>
        <button type="submit" className="admin-news-btn admin-news-btn-primary" disabled={saving}>
          {saving ? "Saving…" : "Save listing SEO"}
        </button>
      </form>
    </section>
  );
}
