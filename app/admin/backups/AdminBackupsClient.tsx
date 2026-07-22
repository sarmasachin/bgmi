"use client";

import { useRef, useState } from "react";
import { useAdminFlash } from "@/src/components/admin/AdminToast";

type BackupFileJson = {
  payload?: Record<string, unknown>;
  checksum?: string;
  version?: number;
  [key: string]: unknown;
};

function parseBackupFile(text: string): BackupFileJson {
  const parsed = JSON.parse(text) as unknown;
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid backup file");
  }
  return parsed as BackupFileJson;
}

function extractPayload(parsed: BackupFileJson): Record<string, unknown> {
  const p = parsed.payload;
  if (p && typeof p === "object" && !Array.isArray(p)) {
    return p as Record<string, unknown>;
  }
  return parsed as Record<string, unknown>;
}

export default function AdminBackupsClient() {
  const setMessage = useAdminFlash();
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function downloadBackup() {
    setMessage("");
    setBusy(true);
    try {
      const res = await fetch("/api/admin/backup/download", { credentials: "include" });
      if (!res.ok) {
        setMessage("Download failed.");
        return;
      }
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const stamp = new Date().toISOString().slice(0, 10);
      a.download = `bgmi-backup-${stamp}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setMessage("Backup file downloaded.");
    } catch {
      setMessage("Network error.");
    } finally {
      setBusy(false);
    }
  }

  async function runDryRun() {
    setMessage("");
    setBusy(true);
    try {
      const file = fileRef.current?.files?.[0];
      let body: Record<string, unknown> = { dryRun: true };
      if (file) {
        const text = await file.text();
        const parsed = parseBackupFile(text);
        const payload = extractPayload(parsed);
        body = {
          dryRun: true,
          payload,
          ...(typeof parsed.checksum === "string" ? { checksum: parsed.checksum } : {}),
          ...(typeof parsed.version === "number" ? { version: parsed.version } : {}),
        };
      }
      const res = await fetch("/api/admin/backup/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const j = (await res.json()) as { error?: string; checksumVerified?: boolean };
      if (!res.ok) {
        setMessage(j.error ?? "Dry-run failed.");
        return;
      }
      setMessage(
        file
          ? j.checksumVerified
            ? "Dry-run OK (checksum verified)."
            : "Dry-run OK (no checksum in file, structure accepted)."
          : "Dry-run OK (API reachable).",
      );
    } catch {
      setMessage("Invalid JSON file or network error.");
    } finally {
      setBusy(false);
    }
  }

  async function uploadRestore() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setMessage("Choose a backup .json file first.");
      return;
    }
    if (!confirm("This replaces news, pages, comments, ads, site settings, and admin users. Continue?")) {
      return;
    }
    if (!confirm("Final confirmation: your database will be overwritten from this file.")) {
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const text = await file.text();
      const parsed = parseBackupFile(text);
      const payload = extractPayload(parsed);
      const body = {
        dryRun: false,
        payload,
        ...(typeof parsed.checksum === "string" ? { checksum: parsed.checksum } : {}),
        ...(typeof parsed.version === "number" ? { version: parsed.version } : {}),
      };
      const res = await fetch("/api/admin/backup/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const j = (await res.json()) as { error?: string; message?: string };
      setMessage(res.ok ? (j.message ?? "Restore completed.") : j.error ?? "Restore failed.");
    } catch {
      setMessage("Invalid backup file or network error.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="admin-section">
      <h1>Backup &amp; restore</h1>
      <p className="admin-dashboard-subtitle">
        Download is a JSON export of the database (news, pages, comments, ads, admin users, site settings).{" "}
        <strong>Password hashes are not included</strong> (restore keeps current passwords for matching emails).{" "}
        <strong>Files in public/uploads are not included</strong> — copy that folder separately if needed.
      </p>

      <div className="admin-backups-actions">
        <button
          type="button"
          className="admin-pages-btn admin-pages-btn-preview"
          disabled={busy}
          onClick={() => void downloadBackup()}
        >
          Download backup
        </button>
      </div>

      <div className="admin-card admin-backups-file-card">
        <h2>Restore / validate</h2>
        <p className="admin-dashboard-subtitle" style={{ marginTop: 6 }}>
          Select the <code>.json</code> file from &quot;Download backup&quot; (or same format). Use dry-run to test;
          restore applies it to the database.
        </p>
        <input ref={fileRef} type="file" accept="application/json,.json" disabled={busy} className="admin-backups-file-input" />
        <div className="admin-backups-row">
          <button
            type="button"
            className="admin-pages-btn admin-pages-btn-preview"
            disabled={busy}
            onClick={() => void runDryRun()}
          >
            Run dry-run
          </button>
          <button type="button" className="admin-pages-btn" disabled={busy} onClick={() => void uploadRestore()}>
            Restore from file
          </button>
        </div>
      </div>
    </section>
  );
}
