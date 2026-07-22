"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import type { AdminUserRow } from "@/src/server/repositories/adminUsersRepository";
import type { AdminRoleDefinitionRow } from "@/src/server/repositories/adminRolesRepository";
import { useAdminFlash } from "@/src/components/admin/AdminToast";
import type { AdminRole } from "@/src/server/rbac/permissions";

type MeInfo = {
  id: string;
  email: string;
  role: AdminRole;
};

type Props = {
  initialRows?: AdminUserRow[];
  me: MeInfo;
};

type ResetTarget = {
  id: string;
  email: string;
};

type AccessTarget = {
  id: string;
  email: string;
  roleDefinitionId: string | null;
};

const PAGE_SIZE = 10;

function formatWhen(value: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function formatRoleName(name: string) {
  if (name === "superadmin") return "Superadmin";
  if (name === "subadmin") return "Subadmin";
  return name
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function accessSummary(row: AdminUserRow) {
  if (row.role === "superadmin") return "Full access";
  const n = row.permissions.length;
  return n === 0 ? "No modules" : `${n} permission${n === 1 ? "" : "s"}`;
}

export default function AdminUsersClient({ initialRows, me }: Props) {
  const [rows, setRows] = useState<AdminUserRow[]>(initialRows ?? []);
  const [roles, setRoles] = useState<AdminRoleDefinitionRow[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [loading, setLoading] = useState(initialRows === undefined);
  const setMessage = useAdminFlash();
  const [busy, setBusy] = useState(false);
  const [listPage, setListPage] = useState(1);

  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [newRoleDefinitionId, setNewRoleDefinitionId] = useState("");

  const [resetTarget, setResetTarget] = useState<ResetTarget | null>(null);
  const [resetPasswordValue, setResetPasswordValue] = useState("");
  const [resetConfirmValue, setResetConfirmValue] = useState("");
  const [resetError, setResetError] = useState("");

  const [accessTarget, setAccessTarget] = useState<AccessTarget | null>(null);
  const [accessRoleDefinitionId, setAccessRoleDefinitionId] = useState("");
  const [accessError, setAccessError] = useState("");

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safeListPage = Math.min(listPage, totalPages);
  const pagedRows = useMemo(() => {
    const start = (safeListPage - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, safeListPage]);

  const selectedCreateRole = useMemo(
    () => roles.find((r) => r.id === newRoleDefinitionId) ?? null,
    [roles, newRoleDefinitionId],
  );

  const selectedAccessRole = useMemo(
    () => roles.find((r) => r.id === accessRoleDefinitionId) ?? null,
    [roles, accessRoleDefinitionId],
  );

  const loadRoles = useCallback(async () => {
    setRolesLoading(true);
    try {
      const res = await fetch("/api/admin/roles", { cache: "no-store", credentials: "include" });
      const json = (await res.json()) as { data?: AdminRoleDefinitionRow[]; error?: string };
      if (!res.ok) {
        setMessage(json.error ?? "Could not load roles.");
        setRoles([]);
        return;
      }
      const list = json.data ?? [];
      setRoles(list);
      setNewRoleDefinitionId((prev) => {
        if (prev && list.some((r) => r.id === prev)) return prev;
        const sub = list.find((r) => r.name === "subadmin");
        return sub?.id ?? list[0]?.id ?? "";
      });
      if (list.length === 0) {
        setMessage("No roles found. Open Roles & Permissions after DB migrate.");
      }
    } catch {
      setMessage("Network error loading roles.");
      setRoles([]);
    } finally {
      setRolesLoading(false);
    }
  }, [setMessage]);

  const load = useCallback(
    async (opts?: { soft?: boolean }) => {
      const soft =
        opts?.soft === true ? true : opts?.soft === false ? false : rows.length > 0;
      if (!soft) setLoading(true);
      try {
        const res = await fetch("/api/admin/users", { cache: "no-store", credentials: "include" });
        const json = (await res.json()) as { data?: AdminUserRow[]; error?: string };
        if (!res.ok) {
          setMessage(json.error ?? "Could not load users.");
          return;
        }
        setRows(json.data ?? []);
      } catch {
        setMessage("Network error loading users.");
      } finally {
        if (!soft) setLoading(false);
      }
    },
    [rows.length, setMessage],
  );

  useEffect(() => {
    void loadRoles();
    if (initialRows !== undefined) return;
    void load({ soft: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRows]);

  useEffect(() => {
    if (!resetTarget && !accessTarget) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || busy) return;
      if (resetTarget) closeResetModal();
      if (accessTarget) closeAccessModal();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [resetTarget, accessTarget, busy]);

  function openResetModal(row: AdminUserRow) {
    if (row.role === "superadmin") {
      setMessage("Superadmin password is locked and cannot be reset here.");
      return;
    }
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

  function openAccessModal(row: AdminUserRow) {
    if (row.role === "superadmin") {
      setMessage("Superadmin access is locked and cannot be edited.");
      return;
    }
    setAccessTarget({
      id: row.id,
      email: row.email,
      roleDefinitionId: row.roleDefinitionId,
    });
    const fallback =
      row.roleDefinitionId ||
      roles.find((r) => r.name === (row.role === "superadmin" ? "superadmin" : "subadmin"))?.id ||
      "";
    setAccessRoleDefinitionId(fallback);
    setAccessError("");
  }

  function closeAccessModal() {
    if (busy) return;
    setAccessTarget(null);
    setAccessError("");
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    if (!newRoleDefinitionId) {
      setMessage("Select a role first (create one under Roles & Permissions).");
      return;
    }
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
          roleDefinitionId: newRoleDefinitionId,
        }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string; data?: AdminUserRow };
      if (!res.ok) {
        setMessage(json.error ?? "Could not create admin.");
        return;
      }
      setMessage(`Created ${json.data?.email ?? newEmail}`);
      setNewEmail("");
      setNewPassword("");
      setNewName("");
      await load({ soft: true });
    } catch {
      setMessage("Network error.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(row: AdminUserRow) {
    if (row.role === "superadmin") {
      setMessage("Superadmin accounts are protected and cannot be deactivated.");
      return;
    }
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
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, isActive: next } : r)));
      await load({ soft: true });
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

  async function submitAccess(e: FormEvent) {
    e.preventDefault();
    if (!accessTarget) return;
    if (!accessRoleDefinitionId) {
      setAccessError("Select a role.");
      return;
    }
    setAccessError("");
    setBusy(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: "setAccess",
          id: accessTarget.id,
          roleDefinitionId: accessRoleDefinitionId,
        }),
      });
      const json = (await res.json()) as { error?: string; data?: AdminUserRow };
      if (!res.ok) {
        setAccessError(json.error ?? "Could not update access.");
        return;
      }
      if (json.data) {
        setRows((prev) => prev.map((r) => (r.id === json.data!.id ? json.data! : r)));
      }
      setMessage(`Access updated for ${accessTarget.email}.`);
      setAccessTarget(null);
      await load({ soft: true });
    } catch {
      setAccessError("Network error.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <section className="admin-section">
        <h1>Admin users</h1>
        <p className="admin-dashboard-subtitle">
          Assign a role from <strong>Roles & Permissions</strong>. Module checkboxes live on that
          page. Signed in as {me.email}.
        </p>
      </section>

      <section className="admin-section">
        <h2>Add user</h2>
        <p className="admin-dashboard-subtitle" style={{ marginTop: 0 }}>
          Pick a role template — permissions come from that role.
        </p>
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
            <label>
              Role
              <select
                className="admin-input"
                value={newRoleDefinitionId}
                onChange={(e) => setNewRoleDefinitionId(e.target.value)}
                required
              >
                {rolesLoading ? <option value="">Loading roles…</option> : null}
                {!rolesLoading && roles.length === 0 ? (
                  <option value="">No roles — open Roles & Permissions</option>
                ) : null}
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {formatRoleName(role.name)}
                    {role.isSystem ? " (system)" : ""}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {selectedCreateRole ? (
            <p className="admin-dashboard-subtitle" style={{ marginTop: 10 }}>
              {selectedCreateRole.name === "superadmin"
                ? "Superadmin gets full access (Users, Backups, System included)."
                : `${selectedCreateRole.permissions.length} permission${
                    selectedCreateRole.permissions.length === 1 ? "" : "s"
                  } from this role. Edit them under Roles & Permissions.`}
            </p>
          ) : null}

          <div className="admin-actions" style={{ marginTop: 14 }}>
            <button type="submit" disabled={busy || !newRoleDefinitionId}>
              {busy ? "Saving…" : "Create user"}
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
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Access</th>
                    <th>Active</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedRows.map((row) => (
                    <tr key={row.id}>
                      <td>
                        {row.email}
                        {row.id === me.id ? (
                          <span style={{ marginLeft: 6, opacity: 0.7, fontSize: 12 }}>(you)</span>
                        ) : null}
                      </td>
                      <td>{row.name ?? "—"}</td>
                      <td>
                        {row.roleDefinitionName
                          ? formatRoleName(row.roleDefinitionName)
                          : row.role === "superadmin"
                            ? "Superadmin"
                            : "Subadmin"}
                      </td>
                      <td>{accessSummary(row)}</td>
                      <td>{row.isActive ? "Yes" : "No"}</td>
                      <td>{formatWhen(row.createdAt)}</td>
                      <td>
                        <div className="admin-actions" style={{ marginBottom: 0 }}>
                          {row.role === "superadmin" ? (
                            <span
                              className="admin-role-badge is-system"
                              title="Superadmin is locked: no edit access, deactivate, or password reset"
                            >
                              Protected
                            </span>
                          ) : (
                            <>
                              <button type="button" disabled={busy} onClick={() => openAccessModal(row)}>
                                Edit access
                              </button>
                              <button type="button" disabled={busy} onClick={() => void toggleActive(row)}>
                                {row.isActive ? "Deactivate" : "Activate"}
                              </button>
                              <button type="button" disabled={busy} onClick={() => openResetModal(row)}>
                                Reset password
                              </button>
                            </>
                          )}
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
          </>
        )}
      </section>

      {accessTarget ? (
        <div className="admin-modal-overlay" role="presentation" onClick={closeAccessModal}>
          <div
            className="admin-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-access-title"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 480, width: "min(480px, 94vw)" }}
          >
            <h2 id="admin-access-title">Edit access</h2>
            <p className="admin-modal-subtitle">{accessTarget.email}</p>
            <form onSubmit={(e) => void submitAccess(e)}>
              <div className="form-group">
                <label htmlFor="adminAccessRole">Role</label>
                <select
                  id="adminAccessRole"
                  className="admin-input"
                  value={accessRoleDefinitionId}
                  disabled={busy}
                  onChange={(e) => setAccessRoleDefinitionId(e.target.value)}
                  required
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {formatRoleName(role.name)}
                      {role.isSystem ? " (system)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {selectedAccessRole ? (
                <p className="admin-dashboard-subtitle">
                  {selectedAccessRole.name === "superadmin"
                    ? "Superadmin has full access to every module."
                    : `${selectedAccessRole.permissions.length} permission${
                        selectedAccessRole.permissions.length === 1 ? "" : "s"
                      }. Change modules on Roles & Permissions.`}
                </p>
              ) : null}

              {accessError ? (
                <p className="admin-modal-error" role="alert">
                  {accessError}
                </p>
              ) : null}

              <div className="admin-modal-actions">
                <button type="button" disabled={busy} onClick={closeAccessModal}>
                  Cancel
                </button>
                <button type="submit" disabled={busy || !accessRoleDefinitionId}>
                  {busy ? "Saving…" : "Save access"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {resetTarget ? (
        <div className="admin-modal-overlay" role="presentation" onClick={closeResetModal}>
          <div
            className="admin-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-reset-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="admin-reset-title">Reset password</h2>
            <p className="admin-modal-subtitle">{resetTarget.email}</p>
            <form onSubmit={(e) => void submitResetPassword(e)}>
              <div className="form-group">
                <label htmlFor="adminResetPassword">New password</label>
                <input
                  id="adminResetPassword"
                  type="password"
                  minLength={6}
                  value={resetPasswordValue}
                  onChange={(e) => setResetPasswordValue(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="adminResetConfirm">Confirm password</label>
                <input
                  id="adminResetConfirm"
                  type="password"
                  minLength={6}
                  value={resetConfirmValue}
                  onChange={(e) => setResetConfirmValue(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
              {resetError ? (
                <p className="admin-modal-error" role="alert">
                  {resetError}
                </p>
              ) : null}
              <div className="admin-modal-actions">
                <button type="button" disabled={busy} onClick={closeResetModal}>
                  Cancel
                </button>
                <button type="submit" disabled={busy}>
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
