"use client";

import Image from "next/image";
import { FormEvent, useCallback, useEffect, useState } from "react";
import type { AdminMediaPageData } from "@/src/server/admin/prefetchAdminMediaPageData";
import { useAdminFlash } from "@/src/components/admin/AdminToast";
import { readApiError } from "@/src/lib/userFacingError";

type MediaRow = AdminMediaPageData["initialFiles"][number];

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

type OutputPref = AdminMediaPageData["initialOutputPref"];

type Props = {
  initialFiles?: MediaRow[];
  initialOutputPref?: OutputPref;
};

export default function AdminMediaClient({ initialFiles, initialOutputPref }: Props) {
  const [files, setFiles] = useState<MediaRow[]>(initialFiles ?? []);
  const setMessage = useAdminFlash();
  const [loading, setLoading] = useState(initialFiles === undefined);
  const [uploading, setUploading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [outputPref, setOutputPref] = useState<OutputPref>(
    initialOutputPref ?? { webp: true, avif: false, jpeg: false },
  );
  const [savingPref, setSavingPref] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/media", { cache: "no-store" });
      if (!res.ok) {
        setMessage(await readApiError(res, "Could not load media library."));
        setFiles([]);
        return;
      }
      const json = (await res.json()) as { data?: MediaRow[] };
      setFiles(json.data ?? []);
    } catch {
      setMessage("Could not load media library.");
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, [setMessage]);

  const loadDefaults = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/media/defaults", { cache: "no-store" });
      if (!res.ok) {
        setMessage(await readApiError(res, "Could not load media defaults."));
        return;
      }
      const json = (await res.json()) as { data?: OutputPref };
      if (json.data) setOutputPref(json.data);
    } catch {
      setMessage("Could not load media defaults.");
    }
  }, [setMessage]);

  useEffect(() => {
    if (initialFiles !== undefined && initialOutputPref !== undefined) return;
    if (initialFiles === undefined) void load();
    if (initialOutputPref === undefined) void loadDefaults();
  }, [initialFiles, initialOutputPref, load, loadDefaults]);

  async function saveOutputPreferences() {
    setSavingPref(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/media/defaults", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(outputPref),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string; data?: OutputPref };
      if (!res.ok) {
        setMessage(json.error ?? "Could not save preferences.");
        return;
      }
      if (json.data) setOutputPref(json.data);
      setMessage("Image output preferences saved. New uploads will use this.");
    } catch {
      setMessage("Network error saving preferences.");
    } finally {
      setSavingPref(false);
    }
  }

  async function onUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const input = event.currentTarget.querySelector('input[type="file"]') as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) {
      setMessage("Choose a file to upload.");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/admin/media/upload", { method: "POST", body: fd });
      const json = (await res.json()) as { ok?: boolean; error?: string; url?: string };
      if (!res.ok) {
        setMessage(json.error ?? "Upload failed.");
        return;
      }
      setMessage(`Uploaded: ${json.url ?? ""}`);
      input.value = "";
      await load();
    } catch {
      setMessage("Network error during upload.");
    } finally {
      setUploading(false);
    }
  }

  async function onConvert(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const form = event.currentTarget;
    const fileInput = form.querySelector('input[name="convertFile"]') as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (!file) {
      setMessage("Choose a source image for conversion.");
      return;
    }
    const formats = ["jpg", "jpeg", "webp", "avif"].filter((f) => {
      const el = form.querySelector(`input[name="fmt_${f}"]`) as HTMLInputElement | null;
      return el?.checked;
    });
    if (!formats.length) {
      setMessage("Select at least one output format.");
      return;
    }
    const width = Number((form.querySelector('input[name="width"]') as HTMLInputElement)?.value) || 1200;
    const height = Number((form.querySelector('input[name="height"]') as HTMLInputElement)?.value) || 628;

    setConverting(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("width", String(width));
      fd.set("height", String(height));
      fd.set("formats", formats.join(","));

      const res = await fetch("/api/admin/media/convert", { method: "POST", body: fd });
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        outputs?: { url: string; format: string }[];
        outputSize?: string;
      };
      if (!res.ok) {
        setMessage(json.error ?? "Conversion failed.");
        return;
      }
      const urls = json.outputs?.map((o) => o.url).join(", ") ?? "";
      setMessage(`Converted (${json.outputSize}): ${urls}`);
      fileInput.value = "";
      await load();
    } catch {
      setMessage("Network error during conversion.");
    } finally {
      setConverting(false);
    }
  }

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(
        `${typeof window !== "undefined" ? window.location.origin : ""}${url}`,
      );
      setMessage("URL copied to clipboard.");
    } catch {
      setMessage("Could not copy URL.");
    }
  }

  async function deleteFile(filename: string) {
    if (!confirm(`Delete ${filename}?`)) return;
    setMessage("");
    try {
      const res = await fetch("/api/admin/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename }),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setMessage(json.error ?? "Delete failed.");
        return;
      }
      setMessage("File deleted.");
      await load();
    } catch {
      setMessage("Network error. Please retry.");
    }
  }

  return (
    <>
      <section className="admin-section">
        <h1>Media library</h1>
        <p className="admin-dashboard-subtitle">
          Files are stored under <code>public/uploads</code>. <strong>Site-wide image output:</strong> every upload
          (news feature image, media library, article editor images) is saved in <strong>one</strong> format chosen
          by priority: WebP → AVIF → JPEG. If none are checked, the original file is kept as-is.
        </p>

        <div className="admin-card admin-media-pref-card">
          <h2>Default format for all uploads</h2>
          <p className="admin-dashboard-subtitle" style={{ marginTop: 6 }}>
            Tick the formats you allow; the server uses the <strong>first match</strong> in order: WebP, then AVIF,
            then JPEG.
          </p>
          <div className="admin-media-formats" style={{ marginTop: 10 }}>
            <label>
              <input
                type="checkbox"
                checked={outputPref.webp}
                onChange={(e) => setOutputPref((p) => ({ ...p, webp: e.target.checked }))}
              />
              WebP (recommended)
            </label>
            <label>
              <input
                type="checkbox"
                checked={outputPref.avif}
                onChange={(e) => setOutputPref((p) => ({ ...p, avif: e.target.checked }))}
              />
              AVIF
            </label>
            <label>
              <input
                type="checkbox"
                checked={outputPref.jpeg}
                onChange={(e) => setOutputPref((p) => ({ ...p, jpeg: e.target.checked }))}
              />
              JPEG
            </label>
          </div>
          <button
            type="button"
            className="admin-pages-btn admin-pages-btn-preview"
            style={{ marginTop: 12 }}
            disabled={savingPref}
            onClick={() => void saveOutputPreferences()}
          >
            {savingPref ? "Saving…" : "Save image preferences"}
          </button>
        </div>

        <div className="admin-media-grid">
          <div className="admin-card admin-media-card">
            <h2>Upload image</h2>
            <form onSubmit={onUpload} className="admin-media-form">
              <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={uploading} />
              <button type="submit" className="admin-pages-btn admin-pages-btn-preview" disabled={uploading}>
                {uploading ? "Uploading…" : "Upload"}
              </button>
            </form>
          </div>

          <div className="admin-card admin-media-card">
            <h2>Resize &amp; convert</h2>
            <form onSubmit={onConvert} className="admin-media-form admin-media-convert-form">
              <label className="admin-media-dim">
                Width
                <input type="number" name="width" min={64} max={4096} defaultValue={1200} />
              </label>
              <label className="admin-media-dim">
                Height
                <input type="number" name="height" min={64} max={4096} defaultValue={628} />
              </label>
              <input
                type="file"
                name="convertFile"
                accept="image/jpeg,image/png,image/webp,image/avif"
                disabled={converting}
              />
              <div className="admin-media-formats">
                <label>
                  <input type="checkbox" name="fmt_jpg" /> jpg
                </label>
                <label>
                  <input type="checkbox" name="fmt_jpeg" /> jpeg
                </label>
                <label>
                  <input type="checkbox" name="fmt_webp" defaultChecked /> webp
                </label>
                <label>
                  <input type="checkbox" name="fmt_avif" /> avif
                </label>
              </div>
              <button type="submit" className="admin-pages-btn admin-pages-btn-preview" disabled={converting}>
                {converting ? "Converting…" : "Convert"}
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="admin-section">
        <h2>Files in /uploads</h2>
        {loading ? (
          <p>Loading…</p>
        ) : files.length === 0 ? (
          <p className="admin-dashboard-subtitle">No files yet. Upload an image above.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Preview</th>
                  <th>Filename</th>
                  <th>Format</th>
                  <th>Size</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map((row) => (
                  <tr key={row.filename}>
                    <td>
                      <Image
                        className="admin-media-thumb"
                        src={row.url}
                        alt=""
                        width={56}
                        height={56}
                        unoptimized
                      />
                    </td>
                    <td>
                      <code className="admin-media-filename">{row.filename}</code>
                    </td>
                    <td>{row.format}</td>
                    <td>{formatBytes(row.size)}</td>
                    <td>{new Date(row.createdAt).toLocaleString()}</td>
                    <td className="admin-media-actions">
                      <button
                        type="button"
                        className="admin-pages-btn admin-pages-btn-preview"
                        onClick={() => void copyUrl(row.url)}
                      >
                        Copy URL
                      </button>
                      <button
                        type="button"
                        className="admin-pages-btn"
                        style={{ borderColor: "#7f1d1d", color: "#fecaca" }}
                        onClick={() => void deleteFile(row.filename)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
