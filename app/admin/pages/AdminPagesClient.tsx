"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { AdminPageRow } from "@/src/server/admin/mapAdminPageRows";
import { useAdminFlash } from "@/src/components/admin/AdminToast";

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

export default function AdminPagesClient({ initialRows }: Props) {
  const setMessage = useAdminFlash();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManualOverride, setSlugManualOverride] = useState(false);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [ogImageUrl, setOgImageUrl] = useState("");
  const [socialTitle, setSocialTitle] = useState("");
  const [socialDescription, setSocialDescription] = useState("");
  const [socialImageAlt, setSocialImageAlt] = useState("");
  const [templateType, setTemplateType] = useState<TemplateType>("home");
  const [game, setGame] = useState<CloneGame>("bgmi");
  const [content, setContent] = useState("");
  const [publishAsNews, setPublishAsNews] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [rows, setRows] = useState<PageRow[]>(initialRows ?? []);
  const [showForm, setShowForm] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");

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
          };
        }),
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

  const socialPreviewTitle = socialTitle.trim() || seoTitle.trim() || title.trim() || "Social title preview";
  const socialPreviewDescription =
    socialDescription.trim() || seoDescription.trim() || "Social description preview appears here.";
  const socialPreviewUrl = canonicalUrl.trim() || (previewSlug ? `https://example.com/${previewSlug}` : "https://example.com/custom-url");

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
      canonicalUrl,
      ogImageUrl,
      templateType,
      game,
      socialTitle,
      socialDescription,
      socialImageAlt,
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
                canonicalUrl,
                ogImageUrl,
                templateType,
                game,
                socialTitle,
                socialDescription,
                socialImageAlt,
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
      setTitle("");
      setSlug("");
      setSlugManualOverride(false);
      setSeoTitle("");
      setSeoDescription("");
      setCanonicalUrl("");
      setOgImageUrl("");
      setSocialTitle("");
      setSocialDescription("");
      setSocialImageAlt("");
      setTemplateType("home");
      setGame("bgmi");
      setContent("");
      setPublishAsNews(false);
      setEditingId(null);
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
    } catch {
      setMessage("Network error. Please retry.");
    }
  }

  async function deletePage(id: string) {
    try {
      const res = await fetch(`/api/admin/pages?id=${id}`, { method: "DELETE" });
      setMessage(res.ok ? "Page deleted." : "Delete failed.");
      if (res.ok) await loadRows();
    } catch {
      setMessage("Network error. Please retry.");
    }
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
            onClick={() => setShowForm(true)}
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
                          onClick={() => void setPageStatus(row.id, "draft")}
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
                          setShowForm(true);
                          setEditingId(row.id);
                          setTitle(row.title);
                          setSlug(normalizeSlugInput(row.slug));
                          setSlugManualOverride(true);
                          setSeoTitle(row.seoTitle ?? "");
                          setSeoDescription(row.seoDescription ?? "");
                          setCanonicalUrl(row.canonicalUrl ?? "");
                          setOgImageUrl(row.ogImageUrl ?? "");
                          setSocialTitle(row.socialTitle ?? "");
                          setSocialDescription(row.socialDescription ?? "");
                          setSocialImageAlt(row.socialImageAlt ?? "");
                          setTemplateType(row.templateType ?? "home");
                          setGame(row.game === "pubg" ? "pubg" : "bgmi");
                          setContent(row.contentHtml ?? "");
                        }}
                      >
                        Edit
                      </button>
                      <button type="button" className="admin-pages-btn admin-pages-btn-delete" onClick={() => void deletePage(row.id)}>
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
              setShowForm(false);
              setEditingId(null);
              setTitle("");
              setSlug("");
              setSlugManualOverride(false);
              setSeoTitle("");
              setSeoDescription("");
              setCanonicalUrl("");
              setOgImageUrl("");
              setSocialTitle("");
              setSocialDescription("");
              setSocialImageAlt("");
              setTemplateType("home");
              setGame("bgmi");
              setContent("");
              setPublishAsNews(false);
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
            placeholder="Canonical URL"
            value={canonicalUrl}
            onChange={(e) => setCanonicalUrl(e.target.value)}
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
            <RichTextEditor value={content || "<p>Start writing...</p>"} onChange={setContent} />
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
    </>
  );
}
