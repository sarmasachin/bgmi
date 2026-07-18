"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { AdminNewsRow } from "@/src/server/admin/mapAdminNewsRows";

const RichTextEditor = dynamic(
  () => import("@/src/components/admin/RichTextEditor").then((mod) => mod.RichTextEditor),
  { ssr: false, loading: () => <p>Loading editor...</p> },
);

type Props = {
  initialRows?: AdminNewsRow[];
};

export default function AdminNewsClient({ initialRows }: Props) {
  const featureImageInputRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [featureImage, setFeatureImage] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [content, setContent] = useState("<p>Start writing...</p>");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [metaKeywordDraft, setMetaKeywordDraft] = useState("");
  const [showMetaKeywords, setShowMetaKeywords] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [rows, setRows] = useState<AdminNewsRow[]>(initialRows ?? []);
  const [showForm, setShowForm] = useState(false);

  function normalizeSlugInput(next: string) {
    return next.replace(/\s+/g, "-");
  }

  function splitMetaKeywords(raw: string) {
    return raw
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function setMetaKeywordList(list: string[]) {
    setMetaKeywords(list.join(", "));
  }

  function addMetaKeyword(raw: string) {
    const normalized = raw.replace(/,+$/g, "").trim();
    if (!normalized) return;
    const list = splitMetaKeywords(metaKeywords);
    const exists = list.some((item) => item.toLowerCase() === normalized.toLowerCase());
    if (!exists) {
      setMetaKeywordList([...list, normalized]);
    }
  }

  function removeMetaKeyword(keywordToRemove: string) {
    const list = splitMetaKeywords(metaKeywords).filter((item) => item !== keywordToRemove);
    setMetaKeywordList(list);
  }

  async function loadRows() {
    try {
      const res = await fetch("/api/admin/news?page=1&pageSize=20");
      if (!res.ok) {
        setMessage("Failed to load news.");
        setRows([]);
        return;
      }
      const json = await res.json();
      setRows(
        (json.data ?? []).map((item: { id: string; title: string; status: string; slug: string; updatedAt?: string }) => ({
          id: item.id,
          title: item.title,
          status: item.status,
          slug: item.slug,
          updatedAt: item.updatedAt ?? "",
        })),
      );
    } catch {
      setMessage("Network error. Please retry.");
      setRows([]);
    }
  }

  useEffect(() => {
    if (initialRows !== undefined) return;
    void loadRows();
  }, [initialRows]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const payload = { title, slug, excerpt, featureImage, content };
      const res = await fetch(
        "/api/admin/news",
        editingId
          ? {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: editingId, ...payload }),
            }
          : {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...payload, status: "draft" as const }),
            },
      );
      setMessage(res.ok ? (editingId ? "News updated." : "News created.") : "Failed to save news.");
      if (res.ok) {
        setEditingId(null);
        setTitle("");
        setSlug("");
        setExcerpt("");
        setFeatureImage("");
        setContent("<p>Start writing...</p>");
        await loadRows();
      }
    } catch {
      setMessage("Network error. Please retry.");
    }
  }

  async function removeNews(id: string) {
    try {
      const res = await fetch(`/api/admin/news?id=${id}`, { method: "DELETE" });
      setMessage(res.ok ? "News deleted." : "Delete failed.");
      if (res.ok) await loadRows();
    } catch {
      setMessage("Network error. Please retry.");
    }
  }

  async function publishNews(id: string) {
    try {
      const res = await fetch("/api/admin/news", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "published" }),
      });
      setMessage(res.ok ? "News published." : "Publish failed.");
      if (res.ok) await loadRows();
    } catch {
      setMessage("Network error. Please retry.");
    }
  }

  async function startEdit(id: string) {
    try {
      const res = await fetch(`/api/admin/news?id=${id}`);
      if (!res.ok) {
        setMessage("Failed to load news for edit.");
        return;
      }
      const json = await res.json();
      const item = json.data as {
        id: string;
        title: string;
        slug: string;
        excerpt?: string;
        featureImage?: string;
        content?: { html?: string } | string;
      };
      setEditingId(item.id);
      setShowForm(true);
      setTitle(item.title ?? "");
      setSlug(item.slug ?? "");
      setExcerpt(item.excerpt ?? "");
      setFeatureImage(item.featureImage ?? "");
      if (typeof item.content === "string") {
        setContent(item.content);
      } else {
        setContent(item.content?.html ?? "<p>Start writing...</p>");
      }
      setMessage("Editing mode enabled.");
    } catch {
      setMessage("Network error. Please retry.");
    }
  }

  async function uploadFeatureImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    setIsUploadingImage(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/news/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        setMessage("Image upload failed.");
        return;
      }
      const json = await res.json();
      if (!json?.url) {
        setMessage("Image upload failed.");
        return;
      }
      setFeatureImage(json.url);
      setMessage("Feature image uploaded.");
    } catch {
      setMessage("Image upload failed.");
    } finally {
      setIsUploadingImage(false);
    }
  }

  return (
    <>
      <section className="admin-section">
        <div className="admin-section-head-row">
          <h1>Manage News</h1>
          <button
            type="button"
            className="admin-news-btn admin-news-btn-primary"
            onClick={() => setShowForm(true)}
            onMouseEnter={() => {
              void import("@/src/components/admin/RichTextEditor");
            }}
          >
            + Create News
          </button>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Slug</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.title}</td>
                  <td>{row.status}</td>
                  <td>{row.slug}</td>
                  <td>{row.updatedAt || "-"}</td>
                  <td className="admin-news-actions">
                    <div className="admin-news-actions-wrap">
                      <button type="button" className="admin-news-btn admin-news-btn-edit" onClick={() => startEdit(row.id)}>
                        Edit
                      </button>
                      <button type="button" className="admin-news-btn admin-news-btn-primary" onClick={() => publishNews(row.id)}>
                        Publish
                      </button>
                      <button type="button" className="admin-news-btn admin-news-btn-danger" onClick={() => removeNews(row.id)}>
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
      {showForm ? (
      <section className="admin-section">
        <div className="admin-section-head-row">
          <h1>{editingId ? "Edit News" : "Create News"}</h1>
          <button
            type="button"
            className="admin-news-btn admin-news-btn-edit"
            onClick={() => {
              setShowForm(false);
              setEditingId(null);
              setTitle("");
              setSlug("");
              setExcerpt("");
              setFeatureImage("");
              setContent("<p>Start writing...</p>");
            }}
          >
            Close
          </button>
        </div>
        <form onSubmit={onSubmit} className="admin-inline-form">
          <input name="title" placeholder="News title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input
            name="slug"
            placeholder="news-slug"
            value={slug}
            onChange={(e) => setSlug(normalizeSlugInput(e.target.value))}
            onPaste={(e) => {
              e.preventDefault();
              const pastedText = e.clipboardData.getData("text");
              const input = e.currentTarget;
              const start = input.selectionStart ?? input.value.length;
              const end = input.selectionEnd ?? input.value.length;
              const nextValue = `${input.value.slice(0, start)}${pastedText}${input.value.slice(end)}`;
              setSlug(normalizeSlugInput(nextValue));
            }}
          />
          <input
            name="excerpt"
            placeholder="Short description"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
          />
          <input
            name="featureImage"
            placeholder="Feature image URL"
            value={featureImage}
            onChange={(e) => setFeatureImage(e.target.value)}
          />
          <input
            ref={featureImageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                void uploadFeatureImage(file);
              }
              e.currentTarget.value = "";
            }}
          />
          <button
            type="button"
            className="admin-news-btn admin-news-btn-primary"
            disabled={isUploadingImage}
            onClick={() => featureImageInputRef.current?.click()}
          >
            {isUploadingImage ? "Uploading..." : "Upload Feature Image"}
          </button>
          <div style={{ gridColumn: "1 / -1" }}>
            <RichTextEditor value={content} onChange={setContent} />
          </div>
          <div className="admin-news-meta-wrap">
            <button
              type="button"
              className="admin-news-btn admin-news-btn-edit admin-news-meta-toggle"
              onClick={() => setShowMetaKeywords((prev) => !prev)}
              aria-expanded={showMetaKeywords}
              aria-controls="admin-news-meta-keywords"
            >
              <span className="admin-news-meta-plus" aria-hidden>+</span>
              <span>Meta Keywords</span>
            </button>
            {showMetaKeywords ? (
              <div className="admin-news-meta-input-box">
                {splitMetaKeywords(metaKeywords).map((keyword) => (
                  <span key={keyword} className="admin-news-meta-tag">
                    {keyword}
                    <button
                      type="button"
                      className="admin-news-meta-tag-remove"
                      aria-label={`Remove ${keyword}`}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => removeMetaKeyword(keyword)}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  id="admin-news-meta-keywords"
                  name="metaKeywords"
                  placeholder="Enter meta keywords"
                  value={metaKeywordDraft}
                  onChange={(e) => setMetaKeywordDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "," || e.key === "Enter") {
                      e.preventDefault();
                      addMetaKeyword(metaKeywordDraft);
                      setMetaKeywordDraft("");
                      if (e.key === "Enter" && splitMetaKeywords(metaKeywords).length > 0) {
                        setShowMetaKeywords(false);
                      }
                    } else if (e.key === "Backspace" && !metaKeywordDraft.trim()) {
                      const list = splitMetaKeywords(metaKeywords);
                      if (list.length > 0) {
                        e.preventDefault();
                        removeMetaKeyword(list[list.length - 1]);
                      }
                    }
                  }}
                  onBlur={() => {
                    addMetaKeyword(metaKeywordDraft);
                    setMetaKeywordDraft("");
                    if (splitMetaKeywords(metaKeywords).length > 0) {
                      setShowMetaKeywords(false);
                    }
                  }}
                />
              </div>
            ) : null}
          </div>
          <button type="submit" className="admin-news-btn admin-news-btn-primary">
            {editingId ? "Update News" : "Create News"}
          </button>
          {editingId ? (
            <button
              type="button"
              className="admin-news-btn admin-news-btn-edit"
              onClick={() => {
                setEditingId(null);
                setTitle("");
                setSlug("");
                setExcerpt("");
                setFeatureImage("");
                setContent("<p>Start writing...</p>");
              }}
            >
              Cancel Edit
            </button>
          ) : null}
        </form>
        {message ? <p style={{ marginTop: 8 }}>{message}</p> : null}
      </section>
      ) : null}
    </>
  );
}
