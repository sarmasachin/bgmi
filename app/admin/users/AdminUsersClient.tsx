"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import type { AdminUserRow } from "@/src/server/repositories/adminUsersRepository";
import { useAdminFlash } from "@/src/components/admin/AdminToast";

type Props = {
  initialRows?: AdminUserRow[];
};

type ResetTarget = {
  id: string;
  email: string;
};

const PAGE_SIZE = 10;

export default function AdminUsersClient({ initialRows }: Props) {
  const [rows, setRows] = useState<AdminUserRow[]>(initialRows ?? []);
  const [loading, setLoading] = useState(initialRows === undefined);
  const setMessage = useAdminFlash();
  const [busy, setBusy] = useState(false);
  const [listPage, setListPage] = useState(1);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [resetTarget, setResetTarget] = useState<ResetTarget | null>(null);
  const [resetPasswordValue, setResetPasswordValue] = useState("");
  const [resetConfirmValue, setResetConfirmValue] = useState("");
  const [resetError, setResetError] = useState("");
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safeListPage = Math.min(listPage, totalPages);
  const pagedRows = useMemo(() => {
    const start = (safeListPage - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, safeListPage]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store", credentials: "include" });
      const json = (await res.json()) as { data?: AdminUserRow[]; error?: string };
      if (!res.ok) {
        setMessage(json.error ?? "Could not load users.");
        setRows([]);
        return;
      }
      setRows(json.data ?? []);
    } catch {
      setMessage("Network error loading users.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [setMessage]);

  useEffect(() => {
    if (initialRows !== undefined) return;
    void load();
  }, [initialRows, load]);

  useEffect(() => {
    if (!resetTarget) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) closeResetModal();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [resetTarget, busy]);

  function openResetModal(row: AdminUserRow) {
    setResetTarget({ id: row.id, email: row.email });
    setResetPasswordValue("");
    setResetConfirmValue("");
    setResetError("");
  }

  function closeResetModal() {
    if (busy) return;
    setResetTarget(null);
    setResetPasswordValue("");
    setResetConfirmValue("");
    setResetError("");
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: newEmail.trim(),
          password: newPassword,
          ...(newName.trim() ? { name: newName.trim() } : {}),
        }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string; data?: AdminUserRow };
      if (!res.ok) {
        setMessage(json.error ?? "Could not create admin.");
        return;
      }
      setMessage(`Created admin: ${json.data?.email ?? newEmail}`);
      setNewEmail("");
      setNewPassword("");
      setNewName("");
      await load();
    } catch {
      setMessage("Network error.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(row: AdminUserRow) {
    const next = !row.isActive;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "setActive", id: row.id, isActive: next }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setMessage(json.error ?? "Update failed.");
        return;
      }
      setMessage(next ? "User activated." : "User deactivated.");
      await load();
    } catch {
      setMessage("Network error.");
    } finally {
      setBusy(false);
    }
  }

  async function submitResetPassword(e: FormEvent) {
    e.preventDefault();
    if (!resetTarget) return;
    if (resetPasswordValue.length < 6) {
      setResetError("Password must be at least 6 characters.");
      return;
    }
    if (resetPasswordValue !== resetConfirmValue) {
      setResetError("Passwords do not match.");
      return;
    }
    setResetError("");
    setBusy(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: "resetPassword",
          id: resetTarget.id,
          newPassword: resetPasswordValue,
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setResetError(json.error ?? "Reset failed.");
        return;
      }
      setMessage(`Password updated for ${resetTarget.email}.`);
      setResetTarget(null);
      setResetPasswordValue("");
      setResetConfirmValue("");
    } catch {
      setResetError("Network error.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <section className="admin-section">
        <h1>Admin users</h1>
        <p className="admin-dashboard-subtitle">
          Create admins, activate or deactivate accounts, or reset passwords.
        </p>
      </section>

      <section className="admin-section">
        <h2>Add admin</h2>
        <form onSubmit={onCreate}>
          <div className="admin-inline-form">
            <label>
              Email
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                autoComplete="off"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
            </label>
            <label>
              Name (optional)
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} maxLength={200} />
            </label>
          </div>
          <div className="admin-actions">
            <button type="submit" disabled={busy}>
              {busy ? "Saving…" : "Create admin"}
            </button>
          </div>
        </form>
      </section>

      <section className="admin-section">
        <h2>Accounts</h2>
        {loading ? (
          <p>Loading…</p>
        ) : rows.length === 0 ? (
          <p>No admin users returned.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Active</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagedRows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.email}</td>
                    <td>{row.name ?? "—"}</td>
                    <td>{row.role}</td>
                    <td>{row.isActive ? "Yes" : "No"}</td>
                    <td>{new Date(row.createdAt).toLocaleString()}</td>
                    <td>
                      <div className="admin-actions" style={{ marginBottom: 0 }}>
                        <button type="button" disabled={busy} onClick={() => void toggleActive(row)}>
                          {row.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button type="button" disabled={busy} onClick={() => openResetModal(row)}>
                          Reset password
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="admin-pagination">
            <button type="button" disabled={safeListPage <= 1} onClick={() => setListPage(safeListPage - 1)}>
              Prev
            </button>
            <span>
              Page {safeListPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={safeListPage >= totalPages}
              onClick={() => setListPage(safeListPage + 1)}
            >
              Next
            </button>
          </div>
        )}
      </section>

      {resetTarget ? (
        <div className="admin-modal-overlay" role="presentation" onClick={closeResetModal}>
          <div
            className="admin-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-reset-password-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="admin-reset-password-title">Reset password</h2>
            <p className="admin-modal-subtitle">{resetTarget.email}</p>
            <form onSubmit={(e) => void submitResetPassword(e)}>
              <div className="form-group">
                <label htmlFor="adminResetPassword">New password</label>
                <input
                  id="adminResetPassword"
                  type="password"
                  autoComplete="new-password"
                  minLength={6}
                  required
                  value={resetPasswordValue}
                  onChange={(e) => setResetPasswordValue(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label htmlFor="adminResetPasswordConfirm">Confirm password</label>
                <input
                  id="adminResetPasswordConfirm"
                  type="password"
                  autoComplete="new-password"
                  minLength={6}
                  required
                  value={resetConfirmValue}
                  onChange={(e) => setResetConfirmValue(e.target.value)}
                />
              </div>
              {resetError ? (
                <p className="admin-modal-error" role="alert">
                  {resetError}
                </p>
              ) : null}
              <div className="admin-modal-actions">
                <button type="button" className="admin-modal-btn-secondary" onClick={closeResetModal} disabled={busy}>
                  Cancel
                </button>
                <button type="submit" className="admin-modal-btn-primary" disabled={busy}>
                  {busy ? "Saving…" : "Update password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
