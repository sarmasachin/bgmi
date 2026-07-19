"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import type { AdminUserRow } from "@/src/server/repositories/adminUsersRepository";
import { useAdminFlash } from "@/src/components/admin/AdminToast";

type Props = {
  initialRows?: AdminUserRow[];
};

export default function AdminUsersClient({ initialRows }: Props) {
  const [rows, setRows] = useState<AdminUserRow[]>(initialRows ?? []);
  const [loading, setLoading] = useState(initialRows === undefined);
  const setMessage = useAdminFlash();
  const [busy, setBusy] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setMessage("");
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
  }, []);

  useEffect(() => {
    if (initialRows !== undefined) return;
    void load();
  }, [initialRows, load]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setMessage("");
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
    setMessage("");
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

  async function resetPassword(row: AdminUserRow) {
    const pwd = window.prompt(`New password for ${row.email} (min 6 characters):`, "");
    if (pwd === null) return;
    if (pwd.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }
    setMessage("");
    setBusy(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "resetPassword", id: row.id, newPassword: pwd }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setMessage(json.error ?? "Reset failed.");
        return;
      }
      setMessage(`Password updated for ${row.email}.`);
    } catch {
      setMessage("Network error.");
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
                {rows.map((row) => (
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
                        <button type="button" disabled={busy} onClick={() => void resetPassword(row)}>
                          Reset password
                        </button>
                      </div>
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
