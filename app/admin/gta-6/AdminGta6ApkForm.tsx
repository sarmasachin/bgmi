"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import type { Gta6PageContent } from "@/src/lib/gta6PageTypes";
import { GtaBlock, GtaField } from "./gta6AdminFields";

const RichTextEditor = dynamic(
  () => import("@/src/components/admin/RichTextEditor").then((mod) => mod.RichTextEditor),
  { ssr: false, loading: () => <p>Loading editor...</p> },
);

type Patch = (updater: (page: Gta6PageContent) => Gta6PageContent) => void;

function splitKeywords(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function AdminGta6ApkForm({ page, onPatch }: { page: Gta6PageContent; onPatch: Patch }) {
  const apk = page.apk;
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadNote, setUploadNote] = useState("");
  const [keywordText, setKeywordText] = useState<string | null>(null);

  function setApk(partial: Partial<Gta6PageContent["apk"]>) {
    onPatch((prev) => ({ ...prev, apk: { ...prev.apk, ...partial } }));
  }

  async function uploadFeatureImage(file: File) {
    const body = new FormData();
    body.set("file", file);
    setUploading(true);
    setUploadNote("");
    try {
      const res = await fetch("/api/admin/media/upload", { method: "POST", body, credentials: "include" });
      const json = (await res.json().catch(() => ({}))) as { url?: string };
      if (!res.ok || !json.url) {
        setUploadNote("Image upload failed.");
        return;
      }
      setApk({ featureImage: json.url });
      setUploadNote("Feature image uploaded.");
    } catch {
      setUploadNote("Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  const keywordsShown = keywordText ?? apk.keywords.join(", ");

  return (
    <GtaBlock title="GT6 APK article">
      <p style={{ margin: "0 0 12px", color: "#94a3b8", fontSize: 13 }}>
        This page stays an article. There is no download button. Write the article in the editor below.
      </p>
      <GtaField label="Meta title" value={apk.seoTitle} onChange={(seoTitle) => setApk({ seoTitle })} />
      <p style={{ margin: "-6px 0 12px", color: "#94a3b8", fontSize: 12 }}>
        {apk.seoTitle.trim().length} characters. Best length is 50–60.
      </p>
      <GtaField
        label="Meta description"
        value={apk.seoDescription}
        multiline
        onChange={(seoDescription) => setApk({ seoDescription })}
      />
      <p style={{ margin: "-6px 0 12px", color: "#94a3b8", fontSize: 12 }}>
        {apk.seoDescription.trim().length} characters. Best length is 140–160.
      </p>
      <GtaField
        label="Keywords, separated by commas"
        value={keywordsShown}
        onChange={(value) => {
          setKeywordText(value);
          setApk({ keywords: splitKeywords(value) });
        }}
      />
      <GtaField
        label="Canonical URL"
        value={apk.canonicalUrl}
        onChange={(canonicalUrl) => setApk({ canonicalUrl })}
      />
      <p style={{ margin: "-6px 0 12px", color: "#94a3b8", fontSize: 12 }}>
        Leave blank to use the real page URL, /gta-6-apk.
      </p>
      <GtaField
        label="Feature image URL"
        value={apk.featureImage}
        onChange={(featureImage) => setApk({ featureImage })}
      />
      <p style={{ margin: "-6px 0 8px", color: "#94a3b8", fontSize: 12 }}>
        Best size is 1200×630. This image is the page image and the Google / social share image.
      </p>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        style={{ display: "none" }}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void uploadFeatureImage(file);
          event.currentTarget.value = "";
        }}
      />
      <button
        type="button"
        className="admin-news-btn admin-news-btn-primary"
        disabled={uploading}
        onClick={() => fileRef.current?.click()}
        style={{ marginBottom: 12 }}
      >
        {uploading ? "Uploading..." : "Upload feature image"}
      </button>
      {uploadNote ? <p style={{ margin: "-6px 0 12px", color: "#94a3b8", fontSize: 12 }}>{uploadNote}</p> : null}
      {apk.featureImage.trim() ? (
        <img
          src={apk.featureImage.trim()}
          alt={apk.featureImageAlt.trim() || "Feature image preview"}
          style={{ display: "block", width: "min(100%, 360px)", height: "auto", margin: "0 0 12px", borderRadius: 8 }}
        />
      ) : null}
      <GtaField
        label="Feature image alt text"
        value={apk.featureImageAlt}
        onChange={(featureImageAlt) => setApk({ featureImageAlt })}
      />
      <GtaField label="Heading" value={apk.title} onChange={(title) => setApk({ title })} />
      <GtaField label="Last updated" value={apk.updated} onChange={(updated) => setApk({ updated })} />
      <div className="admin-pages-editor-wrap" style={{ marginTop: 8 }}>
        <RichTextEditor
          value={apk.articleHtml}
          onChange={(articleHtml) => setApk({ articleHtml })}
          storageKey="bgmi_admin_gta6_apk_article_v1"
        />
      </div>
    </GtaBlock>
  );
}
