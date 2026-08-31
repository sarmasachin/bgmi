"use client";

import { useState } from "react";
import { AdminDialogModal } from "@/src/components/admin/AdminDialogModal";
import type { FreeFireRedeemServerConfig } from "@/src/lib/freeFireRedeemServers";
import {
  ensureGlobalRedeemServer,
  slugifyRedeemServerId,
} from "@/src/lib/freeFireRedeemServers";

const fieldStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #334155",
  background: "#0f172a",
  color: "#e2e8f0",
} as const;

type EditorState =
  | { mode: "create"; draft: FreeFireRedeemServerConfig }
  | { mode: "edit"; index: number; draft: FreeFireRedeemServerConfig };

type Props = {
  servers: FreeFireRedeemServerConfig[];
  onChangeServers: (servers: FreeFireRedeemServerConfig[]) => void;
};

function emptyServer(): FreeFireRedeemServerConfig {
  return { id: "", label: "", badge: "" };
}

function Field({
  label,
  value,
  onChange,
  hint,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  disabled?: boolean;
}) {
  return (
    <label className="admin-redeem-field">
      <span>{label}</span>
      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        style={fieldStyle}
      />
      {hint ? <small className="admin-redeem-hint">{hint}</small> : null}
    </label>
  );
}

/** Admin CRUD for Free Fire / FF Max redeem server tabs. */
export function AdminFreeFireRedeemServersSection({ servers, onChangeServers }: Props) {
  const [editor, setEditor] = useState<EditorState | null>(null);
  const list = ensureGlobalRedeemServer(servers);

  function openCreate() {
    setEditor({ mode: "create", draft: emptyServer() });
  }

  function openEdit(index: number) {
    const item = list[index];
    if (!item) return;
    setEditor({ mode: "edit", index, draft: { ...item } });
  }

  function applyEditor() {
    if (!editor) return;
    const label = editor.draft.label.trim();
    const badge = editor.draft.badge.trim() || label.slice(0, 4).toUpperCase();
    const id =
      editor.mode === "edit" && editor.draft.id === "global"
        ? "global"
        : slugifyRedeemServerId(editor.draft.id.trim() || label);
    if (!label) return;
    const nextRow: FreeFireRedeemServerConfig = {
      id,
      label,
      badge: badge || "REG",
    };
    if (editor.mode === "create") {
      onChangeServers(ensureGlobalRedeemServer([...list, nextRow]));
    } else {
      onChangeServers(
        ensureGlobalRedeemServer(list.map((row, i) => (i === editor.index ? nextRow : row))),
      );
    }
    setEditor(null);
  }

  function removeAt(index: number) {
    const item = list[index];
    if (!item || item.id === "global") return;
    if (!window.confirm(`Remove server “${item.label}”? Codes on this server move to Global.`)) return;
    onChangeServers(ensureGlobalRedeemServer(list.filter((_, i) => i !== index)));
  }

  function patchDraft(patch: Partial<FreeFireRedeemServerConfig>) {
    setEditor((prev) => (prev ? { ...prev, draft: { ...prev.draft, ...patch } } : prev));
  }

  const previewId =
    editor?.draft.id.trim() ||
    (editor?.draft.label.trim() ? slugifyRedeemServerId(editor.draft.label) : "");

  return (
    <div className="admin-redeem-manager">
      <div className="admin-redeem-toolbar">
        <p className="admin-redeem-hint" style={{ flex: 1 }}>
          These become public region tabs. <strong>Global</strong> codes show on every tab.
        </p>
        <button type="button" className="admin-news-btn" onClick={openCreate}>
          Add server
        </button>
      </div>

      <div className="admin-table-wrap admin-redeem-table-wrap">
        <table className="admin-table admin-redeem-table">
          <thead>
            <tr>
              <th>Label</th>
              <th>Badge</th>
              <th>ID</th>
              <th style={{ width: 160 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((item, index) => (
              <tr key={item.id}>
                <td>{item.label}</td>
                <td>{item.badge}</td>
                <td>
                  <code className="admin-redeem-code">{item.id}</code>
                </td>
                <td>
                  <div className="admin-redeem-row-actions">
                    <button
                      type="button"
                      className="admin-news-btn admin-news-btn-edit"
                      onClick={() => openEdit(index)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="admin-news-btn admin-news-btn-edit"
                      onClick={() => removeAt(index)}
                      disabled={item.id === "global"}
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

      {editor ? (
        <AdminDialogModal
          title={editor.mode === "create" ? "Add server" : "Edit server"}
          subtitle="Save page to publish tabs on the public redeem page."
          onClose={() => setEditor(null)}
          actions={
            <>
              <button type="button" className="admin-modal-btn-secondary" onClick={() => setEditor(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="admin-modal-btn-primary"
                onClick={applyEditor}
                disabled={!editor.draft.label.trim()}
              >
                {editor.mode === "create" ? "Add server" : "Apply changes"}
              </button>
            </>
          }
        >
          <Field
            label="Display name"
            value={editor.draft.label}
            onChange={(label) =>
              patchDraft({
                label,
                badge:
                  editor.draft.badge ||
                  (editor.mode === "create" ? label.slice(0, 4).toUpperCase() : editor.draft.badge),
              })
            }
          />
          <Field
            label="Badge (short tag on cards)"
            value={editor.draft.badge}
            onChange={(badge) => patchDraft({ badge })}
          />
          <Field
            label="ID (URL-safe slug)"
            value={editor.mode === "edit" && editor.draft.id === "global" ? "global" : editor.draft.id}
            onChange={(id) => patchDraft({ id: slugifyRedeemServerId(id) })}
            disabled={editor.mode === "edit" && editor.draft.id === "global"}
            hint={previewId ? `Preview id: ${previewId}` : "Auto-generated from display name if empty."}
          />
        </AdminDialogModal>
      ) : null}
    </div>
  );
}
