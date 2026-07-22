"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminFlash } from "@/src/components/admin/AdminToast";
import { readApiError } from "@/src/lib/userFacingError";
import type { AdminRoleDefinitionRow } from "@/src/server/repositories/adminRolesRepository";
import {
  ADMIN_PERMISSION_MODULES,
  permissionActionLabel,
  sanitizeSubadminPermissions,
  type AdminPermission,
} from "@/src/server/rbac/permissions";

type Props = {
  initialRole: AdminRoleDefinitionRow;
};

const EDITABLE_MODULES = ADMIN_PERMISSION_MODULES.filter((m) => !m.superadminOnly);

export default function AdminRoleEditClient({ initialRole }: Props) {
  const router = useRouter();
  const setMessage = useAdminFlash();
  const [name, setName] = useState(initialRole.name);
  const [permissions, setPermissions] = useState<AdminPermission[]>(
    initialRole.name === "superadmin"
      ? initialRole.permissions
      : sanitizeSubadminPermissions(initialRole.permissions),
  );
  const [saving, setSaving] = useState(false);
  const isSuper = initialRole.name === "superadmin";
  const nameLocked = initialRole.isSystem;

  const selectedCount = useMemo(() => permissions.length, [permissions]);

  function toggle(perm: AdminPermission, on: boolean) {
    if (isSuper) return;
    setPermissions((prev) => {
      if (on) return sanitizeSubadminPermissions([...prev, perm]);
      return prev.filter((p) => p !== perm);
    });
  }

  async function onSave(e: FormEvent) {
    e.preventDefault();
    if (saving || isSuper) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/roles", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: initialRole.id,
          ...(nameLocked ? {} : { name }),
          permissions,
        }),
      });
      if (!res.ok) {
        setMessage(await readApiError(res, "Could not save role."));
        return;
      }
      setMessage(`Saved role: ${name}`);
      router.push("/admin/roles");
      router.refresh();
    } catch {
      setMessage("Network error.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-section admin-role-edit-wrap">
      <p style={{ marginTop: 0 }}>
        <Link href="/admin/roles" style={{ color: "#93c5fd" }}>
          ← Roles &amp; Permissions
        </Link>
      </p>
      <h1>Edit Role: {initialRole.name}</h1>

      <form onSubmit={(e) => void onSave(e)}>
        <div className="admin-role-name-field">
          <label htmlFor="roleName">
            Role Name<span className="req">*</span>
          </label>
          <input
            id="roleName"
            className="admin-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            maxLength={60}
            disabled={nameLocked || saving}
          />
          {nameLocked ? (
            <p className="admin-dashboard-subtitle" style={{ marginBottom: 0 }}>
              System role name is locked.
            </p>
          ) : null}
        </div>

        <h2 style={{ fontSize: 18, marginBottom: 8 }}>
          Permissions{" "}
          <span style={{ fontWeight: 500, fontSize: 14, opacity: 0.75 }}>({selectedCount})</span>
        </h2>

        {isSuper ? (
          <p className="admin-dashboard-subtitle">
            Superadmin always has full access. Permissions here are display-only.
          </p>
        ) : null}

        <div className="admin-perm-grid">
          {(isSuper ? ADMIN_PERMISSION_MODULES : EDITABLE_MODULES).map((mod) => (
            <div key={mod.id} className="admin-perm-card">
              <h3>{mod.label}</h3>
              <div className="admin-perm-checks">
                {mod.permissions.map((perm) => {
                  const checked = permissions.includes(perm) || isSuper;
                  return (
                    <label key={perm}>
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={isSuper || saving || Boolean(mod.superadminOnly)}
                        onChange={(e) => toggle(perm, e.target.checked)}
                      />
                      {permissionActionLabel(perm).toLowerCase()}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="admin-role-edit-actions">
          {!isSuper ? (
            <button type="submit" className="admin-news-btn admin-news-btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save Role"}
            </button>
          ) : null}
          <Link href="/admin/roles" className="admin-news-btn admin-news-btn-edit">
            Back
          </Link>
        </div>
      </form>
    </section>
  );
}
