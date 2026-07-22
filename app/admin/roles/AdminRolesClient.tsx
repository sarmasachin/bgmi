"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useAdminFlash } from "@/src/components/admin/AdminToast";
import { readApiError } from "@/src/lib/userFacingError";
import type { AdminRoleDefinitionRow } from "@/src/server/repositories/adminRolesRepository";

type Props = {
  initialRows?: AdminRoleDefinitionRow[];
};

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 20h9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M16.5 3.5a2.1 2.1 0 0 1 3 3l1 1a2.1 2.1 0 0 1 0 3L7 19l-4 1 1-4L16.5 3.5z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 6h18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M8 6V4.8A1.8 1.8 0 0 1 9.8 3h4.4A1.8 1.8 0 0 1 16 4.8V6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 6l-.7 12.2A2 2 0 0 1 16.3 20H7.7a2 2 0 0 1-2-1.8L5 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10 11v5M14 11v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function AdminRolesClient({ initialRows }: Props) {
  const [rows, setRows] = useState<AdminRoleDefinitionRow[]>(initialRows ?? []);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AdminRoleDefinitionRow | null>(null);
  const setMessage = useAdminFlash();

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/roles", { cache: "no-store", credentials: "include" });
      const json = (await res.json()) as { data?: AdminRoleDefinitionRow[]; error?: string };
      if (!res.ok) {
        setMessage(json.error ?? "Failed to load roles.");
        return;
      }
      setRows(json.data ?? []);
    } catch {
      setMessage("Network error loading roles.");
    }
  }, [setMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!deleteTarget) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || busyId) return;
      setDeleteTarget(null);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [deleteTarget, busyId]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    if (creating) return;
    setCreating(true);
    try {
      const res = await fetch("/api/admin/roles", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, permissions: ["dashboard.view"] }),
      });
      const json = (await res.json()) as { data?: AdminRoleDefinitionRow; error?: string };
      if (!res.ok) {
        setMessage(await readApiError(res, json.error ?? "Could not create role."));
        return;
      }
      setNewName("");
      setMessage(`Role created: ${json.data?.name ?? newName}`);
      await load();
      if (json.data?.id) {
        window.location.href = `/admin/roles/${json.data.id}`;
      }
    } catch {
      setMessage("Network error.");
    } finally {
      setCreating(false);
    }
  }

  function openDeleteModal(row: AdminRoleDefinitionRow) {
    if (row.isSystem || busyId) return;
    setDeleteTarget(row);
  }

  function closeDeleteModal() {
    if (busyId) return;
    setDeleteTarget(null);
  }

  async function confirmDelete() {
    if (!deleteTarget || deleteTarget.isSystem) return;
    const row = deleteTarget;
    setBusyId(row.id);
    try {
      const res = await fetch(`/api/admin/roles?id=${encodeURIComponent(row.id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        setMessage(await readApiError(res, "Delete failed."));
        return;
      }
      setMessage(`Deleted role: ${row.name}`);
      setRows((prev) => prev.filter((r) => r.id !== row.id));
      setDeleteTarget(null);
    } catch {
      setMessage("Network error.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="admin-section">
      <div className="admin-roles-head">
        <div>
          <h1>Roles &amp; Permissions</h1>
          <p className="admin-dashboard-subtitle" style={{ marginBottom: 0 }}>
            Role templates with module checkboxes. Assign roles to users from the Users page.
          </p>
        </div>
      </div>

      <form onSubmit={onCreate} className="admin-inline-form" style={{ marginBottom: 16, gap: 8 }}>
        <label>
          New role name
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="content_editor"
            maxLength={60}
            required
            minLength={2}
          />
        </label>
        <div className="admin-actions" style={{ alignSelf: "end", marginBottom: 0 }}>
          <button type="submit" className="admin-news-btn admin-news-btn-primary" disabled={creating}>
            {creating ? "Adding…" : "+ Add Role"}
          </button>
        </div>
      </form>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Role</th>
              <th>Permissions</th>
              <th>Users</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4}>No roles yet.</td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <span className={`admin-role-badge ${row.isSystem ? "is-system" : "is-custom"}`}>
                      {row.name}
                    </span>
                  </td>
                  <td>
                    {row.name === "superadmin"
                      ? `${row.permissions.length} permissions (full)`
                      : `${row.permissions.length} permission${row.permissions.length === 1 ? "" : "s"}`}
                  </td>
                  <td>{row.userCount}</td>
                  <td>
                    <div className="admin-roles-actions">
                      {row.name === "superadmin" ? (
                        <span
                          className="admin-role-badge is-system"
                          title="Superadmin role is locked"
                        >
                          Locked
                        </span>
                      ) : (
                        <>
                          <Link
                            href={`/admin/roles/${row.id}`}
                            className="admin-role-icon-btn"
                            title="Edit role"
                            aria-label={`Edit ${row.name}`}
                          >
                            <EditIcon />
                          </Link>
                          {!row.isSystem ? (
                            <button
                              type="button"
                              className="admin-role-icon-btn is-danger"
                              title="Delete role"
                              aria-label={`Delete ${row.name}`}
                              disabled={busyId === row.id}
                              onClick={() => openDeleteModal(row)}
                            >
                              <TrashIcon />
                            </button>
                          ) : null}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {deleteTarget ? (
        <div className="admin-modal-overlay" role="presentation" onClick={closeDeleteModal}>
          <div
            className="admin-modal admin-confirm-modal is-danger"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-role-delete-title"
            aria-describedby="admin-role-delete-desc"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-confirm-icon" aria-hidden>
              <TrashIcon />
            </div>
            <h2 id="admin-role-delete-title">Delete this role?</h2>
            <p id="admin-role-delete-desc" className="admin-modal-subtitle">
              This permanently removes the role template. Users already assigned must be reassigned
              first.
            </p>
            <div className="admin-confirm-meta">
              <span className="admin-confirm-meta-label">Role</span>
              <strong>{deleteTarget.name}</strong>
              <span className="admin-confirm-meta-label" style={{ marginTop: 8 }}>
                {deleteTarget.permissions.length} permission
                {deleteTarget.permissions.length === 1 ? "" : "s"} · {deleteTarget.userCount} user
                {deleteTarget.userCount === 1 ? "" : "s"}
              </span>
            </div>
            <div className="admin-confirm-note">
              <span className="admin-confirm-note-dot" aria-hidden />
              System roles cannot be deleted. This action cannot be undone.
            </div>
            <div className="admin-modal-actions">
              <button
                type="button"
                className="admin-modal-btn-secondary"
                disabled={Boolean(busyId)}
                onClick={closeDeleteModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-modal-btn-primary admin-modal-btn-danger"
                disabled={Boolean(busyId)}
                onClick={() => void confirmDelete()}
              >
                {busyId === deleteTarget.id ? "Deleting…" : "Yes, delete role"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
