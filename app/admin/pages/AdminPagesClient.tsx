"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { AdminPageRow } from "@/src/server/admin/mapAdminPageRows";
import { useAdminFlash } from "@/src/components/admin/AdminToast";
import { toCanonicalUrl } from "@/src/lib/siteUrl";

const RichTextEditor = dynamic(
  () => import("@/src/components/admin/RichTextEditor").then((mod) => mod.RichTextEditor),
  { ssr: false, loading: () => <p>Loading editor...</p> },
);

type TemplateType = "home" | "article" | "landing";
type CloneGame = "bgmi" | "pubg";

type PageRow = AdminPageRow;

type PageMeta = {
  templateType?: TemplateType;
  game?: CloneGame;
  socialTitle?: string;
  socialDescription?: string;
  socialImageAlt?: string;
  keywords?: string;
};

function coerceTemplateType(value: unknown): TemplateType {
  return value === "article" || value === "landing" || value === "home" ? value : "home";
}

function coerceCloneGame(value: unknown): CloneGame {
  return value === "pubg" ? "pubg" : "bgmi";
}

function normalizeSlugInput(next: string) {
  const compact = next.replace(/\s+/g, "-").replace(/-+/g, "-");
  if (!compact) return "";
  // Leading "/" is not stored — the public URL path already includes it.
  return compact.replace(/^\/+/, "").replace(/\/+$/, "").toLowerCase();
}

function slugifyFromTitle(input: string) {
  const base = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s/-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/\/+/g, "/")
    .replace(/\/-/g, "/")
    .replace(/-\/+/g, "/")
    .replace(/^-+|-+$/g, "")
    .replace(/^\/+|\/+$/g, "");
  return base;
}

function parseContent(content: unknown) {
  if (typeof content === "string") {
    return { html: content, meta: {} as PageMeta };
  }
  if (typeof content === "object" && content !== null) {
    const maybeHtml = (content as { html?: unknown }).html;
    const maybeMeta = (content as { meta?: unknown }).meta;
    const metaObj =
      typeof maybeMeta === "object" && maybeMeta !== null
        ? (maybeMeta as {
            templateType?: unknown;
            game?: unknown;
            socialTitle?: unknown;
            socialDescription?: unknown;
            socialImageAlt?: unknown;
            keywords?: unknown;
          })
        : {};
    return {
      html: typeof maybeHtml === "string" ? maybeHtml : "",
      meta: {
        templateType:
          metaObj.templateType === "home" || metaObj.templateType === "article" || metaObj.templateType === "landing"
            ? metaObj.templateType
            : undefined,
        game: metaObj.game === "pubg" || metaObj.game === "bgmi" ? metaObj.game : undefined,
        socialTitle: typeof metaObj.socialTitle === "string" ? metaObj.socialTitle : undefined,
        socialDescription: typeof metaObj.socialDescription === "string" ? metaObj.socialDescription : undefined,
        socialImageAlt: typeof metaObj.socialImageAlt === "string" ? metaObj.socialImageAlt : undefined,
        keywords: typeof metaObj.keywords === "string" ? metaObj.keywords : undefined,
      },
    };
  }
  return { html: "", meta: {} as PageMeta };
}

function comparableSlug(input: string) {
  return normalizeSlugInput(input.trim()).toLowerCase();
}

type Props = {
  initialRows?: PageRow[];
};

type ConfirmAction = {
  type: "delete" | "unpublish";
  id: string;
  title: string;
  slug: string;
};

const PAGES_EDITOR_DRAFT_KEY = "bgmi_admin_pages_editor_draft_v1";

function clearPagesEditorDraft() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PAGES_EDITOR_DRAFT_KEY);
}

export default function AdminPagesClient({ initialRows }: Props) {
  const setMessage = useAdminFlash();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManualOverride, setSlugManualOverride] = useState(false);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [canonicalManualOverride, setCanonicalManualOverride] = useState(false);
  const [ogImageUrl, setOgImageUrl] = useState("");
  const [socialTitle, setSocialTitle] = useState("");
  const [socialDescription, setSocialDescription] = useState("");
  const [socialImageAlt, setSocialImageAlt] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [metaKeywordDraft, setMetaKeywordDraft] = useState("");
  const [showMetaKeywords, setShowMetaKeywords] = useState(false);
  const [templateType, setTemplateType] = useState<TemplateType>("home");
  const [game, setGame] = useState<CloneGame>("bgmi");
  const [content, setContent] = useState("");
  const [publishAsNews, setPublishAsNews] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [rows, setRows] = useState<PageRow[]>(initialRows ?? []);
  const [showForm, setShowForm] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [editorNonce, setEditorNonce] = useState(0);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);

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
    setSlugManualOverride(false);
    setSeoTitle("");
    setSeoDescription("");
    setCanonicalUrl("");
    setCanonicalManualOverride(false);
    setOgImageUrl("");
    setSocialTitle("");
    setSocialDescription("");
    setSocialImageAlt("");
    setMetaKeywords("");
    setMetaKeywordDraft("");
    setShowMetaKeywords(false);
    setTemplateType("home");
    setGame("bgmi");
    setContent("");
    setPublishAsNews(false);
    clearPagesEditorDraft();
    setEditorNonce((n) => n + 1);
  }

  function openCreateForm() {
    resetFormFields();
    setShowForm(true);
  }

  async function loadRows() {
    try {
      const res = await fetch("/api/admin/pages");
      if (!res.ok) {
        setMessage("Failed to load pages.");
        setRows([]);
        return;
      }
      const json = (await res.json()) as {
        data?: Array<{
          id: string;
          title: string;
          status: string;
          slug: string;
          seoTitle?: string;
          seoDescription?: string;
          canonicalUrl?: string;
          ogImageUrl?: string;
          content?: unknown;
        }>;
      };

      setRows(
        (json.data ?? []).map((item) => {
          const parsed = parseContent(item.content);
          return {
            id: item.id,
            title: item.title,
            status: item.status,
            slug: item.slug,
            seoTitle: item.seoTitle ?? "",
            seoDescription: item.seoDescription ?? "",
            canonicalUrl: item.canonicalUrl ?? "",
            ogImageUrl: item.ogImageUrl ?? "",
            contentHtml: parsed.html,
            templateType: coerceTemplateType(parsed.meta.templateType),
            game: coerceCloneGame(parsed.meta.game),
            socialTitle: parsed.meta.socialTitle ?? "",
            socialDescription: parsed.meta.socialDescription ?? "",
            socialImageAlt: parsed.meta.socialImageAlt ?? "",
            metaKeywords: parsed.meta.keywords ?? "",
          };
        }),
      );
    } catch {
      setMessage("Network error. Please retry.");
      setRows([]);
    }
  }

  useEffect(() => {
    void loadRows();
    // Always refresh from API so list is not stuck on a stale/empty SSR snapshot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const duplicateSlugExists = useMemo(() => {
    const current = comparableSlug(slug);
    if (!current) return false;
    return rows.some((row) => comparableSlug(row.slug) === current && row.id !== editingId);
  }, [slug, rows, editingId]);

  const liveChecks = useMemo(() => {
    const titleLength = title.trim().length;
    const descriptionLength = seoDescription.trim().length;
    let headingCount = 0;
    let internalLinkCount = 0;
    let imageCount = 0;
    let missingImageAltCount = 0;

    if (typeof window !== "undefined" && content.trim()) {
      const doc = new DOMParser().parseFromString(content, "text/html");
      headingCount = doc.querySelectorAll("h1,h2,h3,h4,h5,h6,.rich-h7,.rich-h8").length;
      internalLinkCount = Array.from(doc.querySelectorAll("a[href]")).filter((link) => {
        const href = link.getAttribute("href")?.trim() ?? "";
        return href.startsWith("/") || href.startsWith("#");
      }).length;
      const images = Array.from(doc.querySelectorAll("img"));
      imageCount = images.length;
      missingImageAltCount = images.filter((img) => !(img.getAttribute("alt") ?? "").trim()).length;
    }

    return {
      titleLength,
      descriptionLength,
      headingCount,
      internalLinkCount,
      imageCount,
      missingImageAltCount,
    };
  }, [title, seoDescription, content]);

  const previewSlug = useMemo(() => normalizeSlugInput(slug), [slug]);
  const editingStatus = useMemo(
    () => (editingId ? rows.find((row) => row.id === editingId)?.status : undefined),
    [editingId, rows],
  );
  const previewUrl = previewSlug
    ? editingStatus === "published"
      ? `/${previewSlug}`
      : `/${previewSlug}?preview=1`
    : "";

  // Keep canonical in sync with slug unless the admin typed a custom value.
  useEffect(() => {
    if (canonicalManualOverride) return;
    if (!previewSlug) {
      setCanonicalUrl("");
      return;
    }
    setCanonicalUrl(toCanonicalUrl(`/${previewSlug}`));
  }, [previewSlug, canonicalManualOverride]);

  const socialPreviewTitle = socialTitle.trim() || seoTitle.trim() || title.trim() || "Social title preview";
  const socialPreviewDescription =
    socialDescription.trim() || seoDescription.trim() || "Social description preview appears here.";
  const socialPreviewUrl = canonicalUrl.trim() || (previewSlug ? toCanonicalUrl(`/${previewSlug}`) : "https://example.com/custom-url");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const safeSlug = normalizeSlugInput(slug);
    if (!safeSlug) {
      setMessage("Slug is required.");
      return;
    }

    if (duplicateSlugExists) {
      setMessage("Warning: slug already exists. Please use another slug.");
      return;
    }

    const payload = {
      title,
      slug: safeSlug,
      seoTitle,
      seoDescription,
      canonicalUrl: canonicalUrl.trim() || toCanonicalUrl(`/${safeSlug}`),
      ogImageUrl,
      templateType,
      game,
      socialTitle,
      socialDescription,
      socialImageAlt,
      metaKeywords,
      content: content.trim() ? content : undefined,
      publishAsNews,
      status: "draft" as const,
    };

    try {
      const res = await fetch(
        "/api/admin/pages",
        editingId
          ? {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: editingId,
                title,
                slug: safeSlug,
                seoTitle,
                seoDescription,
                canonicalUrl: canonicalUrl.trim() || toCanonicalUrl(`/${safeSlug}`),
                ogImageUrl,
                templateType,
                game,
                socialTitle,
                socialDescription,
                socialImageAlt,
                metaKeywords,
                content,
              }),
            }
          : {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            },
      );

      if (!res.ok) {
        let errorMessage = editingId ? "Failed to update clone." : "Failed to create clone.";
        try {
          const errorJson = (await res.json()) as { error?: string };
          if (errorJson.error) errorMessage = errorJson.error;
        } catch {
          // Keep default message if error JSON is not available.
        }
        setMessage(errorMessage);
        return;
      }

      setMessage(editingId ? "Clone updated." : "Clone created.");
      resetFormFields();
      setShowForm(false);
      await loadRows();
    } catch {
      setMessage("Network error. Please retry.");
    }
  }

  async function setPageStatus(id: string, status: "draft" | "published") {
    const publishing = status === "published";
    try {
      const res = await fetch("/api/admin/pages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      setMessage(
        res.ok
          ? publishing
            ? "Page published."
            : "Page unpublished. It is no longer live."
          : publishing
            ? "Publish failed."
            : "Unpublish failed.",
      );
      if (res.ok) await loadRows();
      return res.ok;
    } catch {
      setMessage("Network error. Please retry.");
      return false;
    }
  }

  async function deletePage(id: string) {
    try {
      const res = await fetch(`/api/admin/pages?id=${id}`, { method: "DELETE" });
      setMessage(res.ok ? "Page deleted." : "Delete failed.");
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
        ? await deletePage(confirmAction.id)
        : await setPageStatus(confirmAction.id, "draft");
    setConfirmBusy(false);
    if (ok) setConfirmAction(null);
  }

  return (
    <>
      {!showForm ? (
      <section className="admin-section">
        <div className="admin-section-head-row">
          <h1>Home Template Clones</h1>
          <button
            type="button"
            className="admin-pages-btn admin-pages-btn-publish"
            onClick={openCreateForm}
            onMouseEnter={() => {
              void import("@/src/components/admin/RichTextEditor");
            }}
          >
            + Create Clone
          </button>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Slug</th>
                <th>Type</th>
                <th>Game</th>
                <th>SEO Title</th>
                <th>SEO Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.title}</td>
                  <td>{row.status}</td>
                  <td>{normalizeSlugInput(row.slug) || row.slug}</td>
                  <td>{row.templateType}</td>
                  <td>{row.game === "pubg" ? "PUBG Mobile" : "BGMI"}</td>
                  <td>{row.seoTitle || "-"}</td>
                  <td>{row.seoDescription || "-"}</td>
                  <td className="admin-pages-actions">
                    <div className="admin-pages-actions-wrap">
                      {row.status === "published" ? (
                        <button
                          type="button"
                          className="admin-pages-btn admin-pages-btn-edit"
                          onClick={() =>
                            setConfirmAction({
                              type: "unpublish",
                              id: row.id,
                              title: row.title,
                              slug: normalizeSlugInput(row.slug) || row.slug,
                            })
                          }
                        >
                          Unpublish
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="admin-pages-btn admin-pages-btn-publish"
                          onClick={() => void setPageStatus(row.id, "published")}
                        >
                          Publish
                        </button>
                      )}
                      <a
                        className="admin-pages-btn admin-pages-btn-preview"
                        href={
                          row.status === "published"
                            ? `/${normalizeSlugInput(row.slug)}`
                            : `/${normalizeSlugInput(row.slug)}?preview=1`
                        }
                        target="_blank"
                        rel="noreferrer"
                      >
                        Preview
                      </a>
                      <button
                        type="button"
                        className="admin-pages-btn admin-pages-btn-edit"
                        onClick={() => {
                          clearPagesEditorDraft();
                          setShowForm(true);
                          setEditingId(row.id);
                          setTitle(row.title);
                          setSlug(normalizeSlugInput(row.slug));
                          setSlugManualOverride(true);
                          setSeoTitle(row.seoTitle ?? "");
                          setSeoDescription(row.seoDescription ?? "");
                          setCanonicalUrl(row.canonicalUrl?.trim() || toCanonicalUrl(`/${normalizeSlugInput(row.slug)}`));
                          setCanonicalManualOverride(Boolean(row.canonicalUrl?.trim()));
                          setOgImageUrl(row.ogImageUrl ?? "");
                          setSocialTitle(row.socialTitle ?? "");
                          setSocialDescription(row.socialDescription ?? "");
                          setSocialImageAlt(row.socialImageAlt ?? "");
                          setMetaKeywords(row.metaKeywords ?? "");
                          setMetaKeywordDraft("");
                          setShowMetaKeywords(Boolean((row.metaKeywords ?? "").trim()));
                          setTemplateType(row.templateType ?? "home");
                          setGame(row.game === "pubg" ? "pubg" : "bgmi");
                          setContent(row.contentHtml ?? "");
                          setEditorNonce((n) => n + 1);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="admin-pages-btn admin-pages-btn-delete"
                        onClick={() =>
                          setConfirmAction({
                            type: "delete",
                            id: row.id,
                            title: row.title,
                            slug: normalizeSlugInput(row.slug) || row.slug,
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
      </section>
      ) : null}
      {showForm ? (
      <section className="admin-section">
        <div className="admin-section-head-row">
          <h1>{editingId ? "Edit Home Clone" : "Create Home Clone"}</h1>
          <button
            type="button"
            className="admin-pages-btn admin-pages-btn-edit"
            onClick={() => {
              resetFormFields();
              setShowForm(false);
            }}
          >
            Close
          </button>
        </div>
        <form onSubmit={onSubmit} className="admin-inline-form admin-pages-inline-form">
          <input
            name="title"
            placeholder="Page title"
            value={title}
            onChange={(e) => {
              const nextTitle = e.target.value;
              setTitle(nextTitle);
              if (!slugManualOverride) {
                setSlug(slugifyFromTitle(nextTitle));
              }
            }}
          />
          <input
            name="slug"
            placeholder="custom-url"
            value={slug}
            onChange={(e) => {
              setSlugManualOverride(true);
              setSlug(normalizeSlugInput(e.target.value));
            }}
            onPaste={(e) => {
              e.preventDefault();
              setSlugManualOverride(true);
              const pastedText = e.clipboardData.getData("text");
              const input = e.currentTarget;
              const start = input.selectionStart ?? input.value.length;
              const end = input.selectionEnd ?? input.value.length;
              const nextValue = `${input.value.slice(0, start)}${pastedText}${input.value.slice(end)}`;
              setSlug(normalizeSlugInput(nextValue));
            }}
          />
          <input name="seoTitle" placeholder="SEO title" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
          <input
            name="seoDescription"
            placeholder="SEO description"
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
          />
          <select value={templateType} onChange={(e) => setTemplateType(e.target.value as TemplateType)} title="Clone type">
            <option value="home">Home style</option>
            <option value="article">Article style</option>
            <option value="landing">Landing style</option>
          </select>
          <select
            value={game}
            onChange={(e) => setGame(e.target.value as CloneGame)}
            title="Calculator game"
            aria-label="Calculator game"
          >
            <option value="bgmi">BGMI</option>
            <option value="pubg">PUBG Mobile</option>
          </select>
          <label className="admin-pages-publish-toggle">
            <input
              type="checkbox"
              name="publishAsNews"
              checked={publishAsNews}
              onChange={(e) => setPublishAsNews(e.target.checked)}
            />{" "}
            Publish in News
          </label>

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
            placeholder="Social image URL"
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
            placeholder="Social image alt text"
            value={socialImageAlt}
            onChange={(e) => setSocialImageAlt(e.target.value)}
          />
          <div className="admin-news-meta-wrap" style={{ gridColumn: "1 / -1" }}>
            <button
              type="button"
              className="admin-news-btn admin-news-btn-edit admin-news-meta-toggle"
              onClick={() => setShowMetaKeywords((prev) => !prev)}
              aria-expanded={showMetaKeywords}
              aria-controls="admin-pages-meta-keywords"
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
                  id="admin-pages-meta-keywords"
                  name="metaKeywords"
                  placeholder="Enter meta keywords"
                  value={metaKeywordDraft}
                  onChange={(e) => setMetaKeywordDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "," || e.key === "Enter") {
                      e.preventDefault();
                      addMetaKeyword(metaKeywordDraft);
                      setMetaKeywordDraft("");
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
                  }}
                />
              </div>
            ) : null}
          </div>
          <button type="submit">{editingId ? "Update Clone" : "Create Clone"}</button>

          {duplicateSlugExists ? (
            <p className="admin-pages-warning">Warning: slug already exists. Create se pehle slug change karein.</p>
          ) : null}

          <div className="admin-pages-checks">
            <p>Title length: {liveChecks.titleLength}</p>
            <p>Description length: {liveChecks.descriptionLength}</p>
            <p>Headings found: {liveChecks.headingCount}</p>
            <p>Internal links found: {liveChecks.internalLinkCount}</p>
            <p>Images in article: {liveChecks.imageCount}</p>
            <p>Images without alt: {liveChecks.missingImageAltCount}</p>
          </div>

          <div className="admin-pages-social-preview">
            <strong>Social share preview</strong>
            <div className="admin-pages-social-card">
              {ogImageUrl ? <img src={ogImageUrl} alt={socialImageAlt || "social-preview"} /> : null}
              <div>
                <h3>{socialPreviewTitle}</h3>
                <p>{socialPreviewDescription}</p>
                <small>{socialPreviewUrl}</small>
              </div>
            </div>
          </div>

          <div className="admin-pages-editor-wrap">
            <RichTextEditor
              key={`pages-editor-${editingId ?? "new"}-${editorNonce}`}
              value={content}
              onChange={setContent}
              storageKey={PAGES_EDITOR_DRAFT_KEY}
            />
          </div>

          <div className="admin-pages-preview-wrap">
            <div className="admin-pages-preview-controls">
              <button
                type="button"
                className={`admin-pages-preview-device ${previewDevice === "desktop" ? "is-active" : ""}`}
                onClick={() => setPreviewDevice("desktop")}
              >
                Desktop
              </button>
              <button
                type="button"
                className={`admin-pages-preview-device ${previewDevice === "tablet" ? "is-active" : ""}`}
                onClick={() => setPreviewDevice("tablet")}
              >
                Tablet
              </button>
              <button
                type="button"
                className={`admin-pages-preview-device ${previewDevice === "mobile" ? "is-active" : ""}`}
                onClick={() => setPreviewDevice("mobile")}
              >
                Mobile
              </button>
            </div>
            {previewUrl ? (
              <div className={`admin-pages-preview-frame ${previewDevice}`}>
                <iframe title="Page preview" src={previewUrl} />
              </div>
            ) : (
              <p className="admin-pages-preview-hint">Preview ke liye slug fill karein.</p>
            )}
          </div>
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
            aria-labelledby="admin-pages-confirm-title"
            aria-describedby="admin-pages-confirm-desc"
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
            <h2 id="admin-pages-confirm-title">
              {confirmAction.type === "delete" ? "Delete this clone?" : "Unpublish this clone?"}
            </h2>
            <p id="admin-pages-confirm-desc" className="admin-modal-subtitle">
              {confirmAction.type === "delete"
                ? "This will permanently remove the clone. This action cannot be undone."
                : "This clone will go offline and stop appearing as a live page."}
            </p>
            <div className="admin-confirm-meta">
              <span className="admin-confirm-meta-label">Clone</span>
              <strong>{confirmAction.title}</strong>
              <span className="admin-confirm-meta-slug">/{confirmAction.slug}</span>
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
