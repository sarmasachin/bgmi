"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

import dynamic from "next/dynamic";
import type { AdminNewsRow } from "@/src/server/admin/mapAdminNewsRows";
import { useAdminFlash } from "@/src/components/admin/AdminToast";
import { useAdminDuplicateCheck } from "@/src/hooks/useAdminDuplicateCheck";
import { readApiError } from "@/src/lib/userFacingError";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import { extractNewsHtml, extractNewsMeta } from "@/src/lib/newsContent";

const RichTextEditor = dynamic(
  () => import("@/src/components/admin/RichTextEditor").then((mod) => mod.RichTextEditor),
  { ssr: false, loading: () => <p>Loading editor...</p> },
);

type Props = {
  initialRows?: AdminNewsRow[];
  initialTotal?: number;
};

type ConfirmAction = {
  type: "delete" | "unpublish";
  id: string;
  title: string;
  slug: string;
};

const PAGE_SIZE = 10;
const NEWS_EDITOR_DRAFT_KEY = "bgmi_admin_news_editor_draft_v1";

function clearNewsEditorDraft() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(NEWS_EDITOR_DRAFT_KEY);
}

export default function AdminNewsClient({ initialRows, initialTotal }: Props) {
  const featureImageInputRef = useRef<HTMLInputElement | null>(null);
  const setMessage = useAdminFlash();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [featureImage, setFeatureImage] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [canonicalManualOverride, setCanonicalManualOverride] = useState(false);
  const [ogImageUrl, setOgImageUrl] = useState("");
  const [socialTitle, setSocialTitle] = useState("");
  const [socialDescription, setSocialDescription] = useState("");
  const [socialImageAlt, setSocialImageAlt] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [content, setContent] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [metaKeywordDraft, setMetaKeywordDraft] = useState("");
  const [showMetaKeywords, setShowMetaKeywords] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [rows, setRows] = useState<AdminNewsRow[]>(initialRows ?? []);
  const [listPage, setListPage] = useState(1);
  const [totalRows, setTotalRows] = useState(initialTotal ?? initialRows?.length ?? 0);
  const [showForm, setShowForm] = useState(false);
  const [editorNonce, setEditorNonce] = useState(0);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));
  const safeListPage = Math.min(listPage, totalPages);

  const duplicateTitleExists = useAdminDuplicateCheck({
    endpoint: "/api/admin/news",
    field: "title",
    value: title,
    excludeId: editingId,
    minLength: 3,
    enabled: showForm,
  });
  const duplicateSlugExists = useAdminDuplicateCheck({
    endpoint: "/api/admin/news",
    field: "slug",
    value: slug,
    excludeId: editingId,
    minLength: 1,
    enabled: showForm,
  });

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

  function resetFormFields() {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setExcerpt("");
    setFeatureImage("");
    setSeoTitle("");
    setSeoDescription("");
    setCanonicalUrl("");
    setCanonicalManualOverride(false);
    setOgImageUrl("");
    setSocialTitle("");
    setSocialDescription("");
    setSocialImageAlt("");
    setContent("");
    setMetaKeywords("");
    setMetaKeywordDraft("");
    setShowMetaKeywords(false);
    clearNewsEditorDraft();
    setEditorNonce((n) => n + 1);
  }

  function openCreateForm() {
    resetFormFields();
    setShowForm(true);
  }

  function closeForm() {
    resetFormFields();
    setShowForm(false);
  }

  async function loadRows(page = safeListPage) {
    try {
      const res = await fetch(`/api/admin/news?page=${page}&pageSize=${PAGE_SIZE}`);
      if (!res.ok) {
        setMessage("Failed to load news.");
        setRows([]);
        setTotalRows(0);
        return;
      }
      const json = await res.json();
      const total = typeof json.total === "number" ? json.total : 0;
      const maxPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
      const nextPage = Math.min(page, maxPage);
      if (nextPage !== page) {
        await loadRows(nextPage);
        return;
      }
      setRows(
        (json.data ?? []).map((item: { id: string; title: string; status: string; slug: string; updatedAt?: string }) => ({
          id: item.id,
          title: item.title,
          status: item.status,
          slug: item.slug,
          updatedAt: item.updatedAt ?? "",
        })),
      );
      setTotalRows(total);
      setListPage(nextPage);
    } catch {
      setMessage("Network error. Please retry.");
      setRows([]);
      setTotalRows(0);
    }
  }

  useEffect(() => {
    if (initialRows !== undefined) return;
    void loadRows(1);
  }, [initialRows]);

  useEffect(() => {
    if (canonicalManualOverride) return;
    const safeSlug = slug.trim();
    if (!safeSlug) {
      setCanonicalUrl("");
      return;
    }
    setCanonicalUrl(toCanonicalUrl(`/news/${safeSlug}`));
  }, [slug, canonicalManualOverride]);

  function buildSeoPayload() {
    return {
      title,
      slug,
      excerpt,
      featureImage,
      content,
      seoTitle,
      seoDescription,
      canonicalUrl: canonicalUrl.trim() || toCanonicalUrl(`/news/${slug.trim()}`),
      ogImageUrl,
      socialTitle,
      socialDescription,
      socialImageAlt,
      metaKeywords,
    };
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (duplicateTitleExists) {
      setMessage("Warning: title already exists. Please use another title.");
      return;
    }
    if (duplicateSlugExists) {
      setMessage("Warning: slug already exists. Please use another slug.");
      return;
    }
    try {
      const payload = buildSeoPayload();
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
      setMessage(
        res.ok
          ? editingId
            ? "News updated."
            : "News created."
          : await readApiError(res, "Failed to save news."),
      );
      if (res.ok) {
        closeForm();
        await loadRows();
      }
    } catch {
      setMessage("Network error. Please retry.");
    }
  }

  async function removeNews(id: string) {
    try {
      const res = await fetch(`/api/admin/news?id=${id}`, { method: "DELETE" });
      setMessage(res.ok ? "News deleted." : await readApiError(res, "Delete failed."));
      if (res.ok) await loadRows();
      return res.ok;
    } catch {
      setMessage("Network error. Please retry.");
      return false;
    }
  }

  async function setNewsStatus(id: string, status: "draft" | "published") {
    const publishing = status === "published";
    try {
      const res = await fetch("/api/admin/news", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      setMessage(
        res.ok
          ? publishing
            ? "News published."
            : "News unpublished. It is no longer live."
          : await readApiError(res, publishing ? "Publish failed." : "Unpublish failed."),
      );
      if (res.ok) await loadRows();
      return res.ok;
    } catch {
      setMessage("Network error. Please retry.");
      return false;
    }
  }

  function closeConfirmModal() {
    if (confirmBusy) return;
    setConfirmAction(null);
  }

  async function confirmPendingAction() {
    if (!confirmAction || confirmBusy) return;
    setConfirmBusy(true);
    const ok =
      confirmAction.type === "delete"
        ? await removeNews(confirmAction.id)
        : await setNewsStatus(confirmAction.id, "draft");
    setConfirmBusy(false);
    if (ok) setConfirmAction(null);
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
        excerpt?: string | null;
        featureImage?: string | null;
        seoTitle?: string | null;
        seoDescription?: string | null;
        content?: unknown;
      };
      const meta = extractNewsMeta(item.content);
      clearNewsEditorDraft();
      setEditingId(item.id);
      setTitle(item.title ?? "");
      setSlug(item.slug ?? "");
      setExcerpt(item.excerpt ?? "");
      setFeatureImage(item.featureImage ?? "");
      setSeoTitle(item.seoTitle ?? "");
      setSeoDescription(item.seoDescription ?? "");
      setCanonicalUrl(meta.canonicalUrl?.trim() || toCanonicalUrl(`/news/${item.slug}`));
      setCanonicalManualOverride(Boolean(meta.canonicalUrl?.trim()));
      setOgImageUrl(meta.ogImageUrl ?? "");
      setSocialTitle(meta.socialTitle ?? "");
      setSocialDescription(meta.socialDescription ?? "");
      setSocialImageAlt(meta.socialImageAlt ?? "");
      setContent(extractNewsHtml(item.content));
      setMetaKeywords(meta.keywords ?? "");
      setMetaKeywordDraft("");
      setShowMetaKeywords(Boolean((meta.keywords ?? "").trim()));
      setEditorNonce((n) => n + 1);
      setShowForm(true);
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

  const seoTitleLength = seoTitle.trim().length || title.trim().length;
  const seoDescriptionLength = seoDescription.trim().length || excerpt.trim().length;

  return (
    <>
      {!showForm ? (
        <section className="admin-section">
          <div className="admin-section-head-row">
            <h1>Manage News</h1>
            <button
              type="button"
              className="admin-news-btn admin-news-btn-primary"
              onClick={openCreateForm}
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
                <th>Sr No</th>
                <th>Title</th>
                <th>Status</th>
                <th>Slug</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id}>
                  <td>{(safeListPage - 1) * PAGE_SIZE + index + 1}</td>
                  <td>{row.title}</td>
                    <td>{row.status}</td>
                    <td>{row.slug}</td>
                    <td>{row.updatedAt || "-"}</td>
                    <td className="admin-news-actions">
                      <div className="admin-news-actions-wrap">
                        <button type="button" className="admin-news-btn admin-news-btn-edit" onClick={() => void startEdit(row.id)}>
                          Edit
                        </button>
                        {row.status === "published" ? (
                          <button
                            type="button"
                            className="admin-news-btn admin-news-btn-edit"
                            onClick={() =>
                              setConfirmAction({
                                type: "unpublish",
                                id: row.id,
                                title: row.title,
                                slug: row.slug,
                              })
                            }
                          >
                            Unpublish
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="admin-news-btn admin-news-btn-primary"
                            onClick={() => void setNewsStatus(row.id, "published")}
                          >
                            Publish
                          </button>
                        )}
                        <button
                          type="button"
                          className="admin-news-btn admin-news-btn-danger"
                          onClick={() =>
                            setConfirmAction({
                              type: "delete",
                              id: row.id,
                              title: row.title,
                              slug: row.slug,
                            })
                          }
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
          <div className="admin-pagination">
            <button
              type="button"
              disabled={safeListPage <= 1}
              onClick={() => void loadRows(safeListPage - 1)}
            >
              Prev
            </button>
            <span>
              Page {safeListPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={safeListPage >= totalPages}
              onClick={() => void loadRows(safeListPage + 1)}
            >
              Next
            </button>
          </div>
        </section>
      ) : null}

      {showForm ? (
        <section className="admin-section">
          <div className="admin-section-head-row">
            <h1>{editingId ? "Edit News" : "Create News"}</h1>
            <button type="button" className="admin-news-btn admin-news-btn-edit" onClick={closeForm}>
              Close
            </button>
          </div>
          <form onSubmit={onSubmit} className="admin-inline-form">
            <div className="admin-field admin-input-wide">
              <input
                name="title"
                placeholder="News title"
                className={duplicateTitleExists ? "is-invalid" : undefined}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              {duplicateTitleExists ? (
                <p className="admin-field-error">This title is already in use.</p>
              ) : null}
            </div>
            <div className="admin-field">
              <input
                name="slug"
                placeholder="news-slug"
                className={duplicateSlugExists ? "is-invalid" : undefined}
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
              {duplicateSlugExists ? (
                <p className="admin-field-error">This slug is already in use.</p>
              ) : null}
            </div>
            <input
              name="excerpt"
              className="admin-input-wide"
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

            <input
              name="seoTitle"
              className="admin-input-wide"
              placeholder="SEO title"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
            />
            <input
              name="seoDescription"
              className="admin-input-wide"
              placeholder="SEO description"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
            />
            <input
              name="canonicalUrl"
              placeholder="Canonical URL (auto from slug)"
              value={canonicalUrl}
              onChange={(e) => {
                setCanonicalManualOverride(true);
                setCanonicalUrl(e.target.value);
              }}
            />
            <input
              name="ogImageUrl"
              placeholder="Social / OG image URL (optional)"
              value={ogImageUrl}
              onChange={(e) => setOgImageUrl(e.target.value)}
            />
            <input
              name="socialTitle"
              placeholder="Social title override"
              value={socialTitle}
              onChange={(e) => setSocialTitle(e.target.value)}
            />
            <input
              name="socialDescription"
              placeholder="Social description override"
              value={socialDescription}
              onChange={(e) => setSocialDescription(e.target.value)}
            />
            <input
              name="socialImageAlt"
              placeholder="Feature / social image alt text"
              value={socialImageAlt}
              onChange={(e) => setSocialImageAlt(e.target.value)}
            />

            <div style={{ gridColumn: "1 / -1" }}>
              <RichTextEditor
                key={`news-editor-${editingId ?? "new"}-${editorNonce}`}
                value={content}
                onChange={setContent}
                storageKey={NEWS_EDITOR_DRAFT_KEY}
              />
            </div>
            <div className="admin-news-meta-wrap">
              <button
                type="button"
                className="admin-news-btn admin-news-btn-edit admin-news-meta-toggle"
                onClick={() => setShowMetaKeywords((prev) => !prev)}
                aria-expanded={showMetaKeywords}
                aria-controls="admin-news-meta-keywords"
              >
                <span className="admin-news-meta-plus" aria-hidden>
                  +
                </span>
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
            <div className="admin-pages-checks" style={{ gridColumn: "1 / -1" }}>
              <p>SEO title length: {seoTitleLength} (ideal 50–60)</p>
              <p>SEO description length: {seoDescriptionLength} (ideal 140–160)</p>
            </div>
            <button type="submit" className="admin-news-btn admin-news-btn-primary">
              {editingId ? "Update News" : "Create News"}
            </button>
          </form>
        </section>
      ) : null}

      {confirmAction ? (
        <div className="admin-modal-overlay" role="presentation" onClick={closeConfirmModal}>
          <div
            className={`admin-modal admin-confirm-modal ${
              confirmAction.type === "delete" ? "is-danger" : "is-warning"
            }`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-news-confirm-title"
            aria-describedby="admin-news-confirm-desc"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-confirm-icon" aria-hidden>
              {confirmAction.type === "delete" ? (
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                  <path
                    d="M9 3h6m-8 4h10m-9 0 .7 12.2A1.5 1.5 0 0 0 10.2 21h3.6a1.5 1.5 0 0 0 1.5-1.4L16 7M10 11v6m4-6v6"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                  <path
                    d="M12 9v4.5M12 17h.01M10.3 4.2 2.7 17.1A2 2 0 0 0 4.4 20h15.2a2 2 0 0 0 1.7-2.9L13.7 4.2a2 2 0 0 0-3.4 0Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            <h2 id="admin-news-confirm-title">
              {confirmAction.type === "delete" ? "Delete this news?" : "Unpublish this news?"}
            </h2>
            <p id="admin-news-confirm-desc" className="admin-modal-subtitle">
              {confirmAction.type === "delete"
                ? "This will permanently remove the news article. This action cannot be undone."
                : "This news will go offline and stop appearing on the live site."}
            </p>
            <div className="admin-confirm-meta">
              <span className="admin-confirm-meta-label">News</span>
              <strong>{confirmAction.title}</strong>
              <span className="admin-confirm-meta-slug">/news/{confirmAction.slug}</span>
            </div>
            <div className="admin-modal-actions">
              <button
                type="button"
                className="admin-modal-btn-secondary"
                onClick={closeConfirmModal}
                disabled={confirmBusy}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`admin-modal-btn-primary ${
                  confirmAction.type === "delete" ? "admin-modal-btn-danger" : "admin-modal-btn-warning"
                }`}
                onClick={() => void confirmPendingAction()}
                disabled={confirmBusy}
              >
                {confirmBusy
                  ? confirmAction.type === "delete"
                    ? "Deleting…"
                    : "Unpublishing…"
                  : confirmAction.type === "delete"
                    ? "Yes, delete"
                    : "Yes, unpublish"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
