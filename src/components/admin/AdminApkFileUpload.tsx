"use client";

import { useRef, useState } from "react";

const MAX_APK_UPLOAD_BYTES = 1024 * 1024 * 1024;

type Props = {
  onUploaded: (url: string) => void;
};

export function AdminApkFileUpload({ onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  function upload(file: File) {
    setError("");
    setNote("");
    if (file.size <= 0) {
      setError("Choose an APK file.");
      return;
    }
    if (file.size > MAX_APK_UPLOAD_BYTES) {
      setError("File must be 1GB or smaller.");
      return;
    }
    if (!/\.(apk|xapk|apks|zip)$/i.test(file.name)) {
      setError("Only .apk, .xapk, .apks, and .zip files are allowed.");
      return;
    }

    setBusy(true);
    setProgress(0);
    const body = new FormData();
    body.append("file", file);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/apk-file");
    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      setProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
    };
    xhr.onload = () => {
      setBusy(false);
      let json: { url?: string; error?: string } = {};
      try {
        json = JSON.parse(xhr.responseText || "{}") as { url?: string; error?: string };
      } catch {
        json = {};
      }
      if (xhr.status >= 200 && xhr.status < 300 && json.url) {
        onUploaded(json.url);
        setProgress(100);
        setNote("Link added to APK URL. Save the page to publish it.");
        return;
      }
      setError(json.error?.trim() || "Upload failed.");
    };
    xhr.onerror = () => {
      setBusy(false);
      setError("Upload failed.");
    };
    xhr.send(body);
  }

  return (
    <div style={{ margin: "0 0 12px" }}>
      <span style={{ display: "block", fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>
        Upload APK file (max 1GB). The link fills the APK URL box.
      </span>
      <input
        ref={inputRef}
        type="file"
        accept=".apk,.xapk,.apks,.zip,application/vnd.android.package-archive"
        disabled={busy}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) upload(file);
        }}
        style={{ color: "#e2e8f0", fontSize: 13 }}
      />
      {busy ? (
        <p style={{ margin: "8px 0 0", fontSize: 12, color: "#93c5fd" }}>Uploading… {progress}%</p>
      ) : null}
      {note ? <p style={{ margin: "8px 0 0", fontSize: 12, color: "#4ade80" }}>{note}</p> : null}
      {error ? <p style={{ margin: "8px 0 0", fontSize: 12, color: "#fca5a5" }}>{error}</p> : null}
    </div>
  );
}
