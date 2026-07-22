import bcrypt from "bcryptjs";
import { prisma, tryPrisma } from "@/src/server/dbSafe";
import { mockStore } from "@/src/server/mockStore";
import {
  normalizeAdminRole,
  resolvePermissions,
  sanitizeSubadminPermissions,
  type AdminPermission,
  type AdminRole,
} from "@/src/server/rbac/permissions";

export type AdminUserRow = {
  id: string;
  email: string;
  name: string | null;
  role: AdminRole;
  roleDefinitionId: string | null;
  roleDefinitionName: string | null;
  permissions: AdminPermission[];
  isActive: boolean;
  createdAt: string;
};

/** Snapshot used when issuing a session cookie. */
export type AdminUserAuthSnapshot = {
  id: string;
  email: string;
  role: AdminRole;
  permissions: AdminPermission[];
  isActive: boolean;
};

type MockUser = {
  id: string;
  email: string;
  role: string;
  active: boolean;
  name?: string | null;
  passwordHash?: string;
  permissions?: unknown;
  roleDefinitionId?: string | null;
};

function mapDbUser(u: {
  id: string;
  email: string;
  name: string | null;
  role: string;
  permissions?: unknown;
  isActive: boolean;
  createdAt: Date;
  roleDefinitionId?: string | null;
  roleDefinition?: { id: string; name: string; permissions: unknown } | null;
}): AdminUserRow {
  const role = normalizeAdminRole(u.role);
  const fromTemplate =
    u.roleDefinition && role !== "superadmin"
      ? sanitizeSubadminPermissions(u.roleDefinition.permissions)
      : null;
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role,
    roleDefinitionId: u.roleDefinitionId ?? u.roleDefinition?.id ?? null,
    roleDefinitionName: u.roleDefinition?.name ?? null,
    permissions: fromTemplate ?? resolvePermissions(role, u.permissions),
    isActive: u.isActive,
    createdAt: u.createdAt.toISOString(),
  };
}

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  permissions: true,
  isActive: true,
  createdAt: true,
  roleDefinitionId: true,
  roleDefinition: {
    select: { id: true, name: true, permissions: true },
  },
} as const;

export async function listAdminUsers(): Promise<AdminUserRow[]> {
  const rows = await tryPrisma(() =>
    prisma.adminUser.findMany({
      orderBy: { createdAt: "asc" },
      select: userSelect,
    }),
  );
  if (rows) return rows.map(mapDbUser);

  return (mockStore.users as MockUser[]).map((u) => {
    const role = normalizeAdminRole(u.role);
    const def = u.roleDefinitionId
      ? mockStore.roleDefinitions.find((r) => r.id === u.roleDefinitionId)
      : null;
    return {
      id: u.id,
      email: u.email,
      name: u.name ?? null,
      role,
      roleDefinitionId: u.roleDefinitionId ?? null,
      roleDefinitionName: def?.name ?? null,
      permissions: resolvePermissions(role, u.permissions),
      isActive: Boolean(u.active),
      createdAt: new Date().toISOString(),
    };
  });
}

export async function getAdminUserAuthSnapshot(
  userId: string,
): Promise<AdminUserAuthSnapshot | null> {
  const id = userId.trim();
  if (!id) return null;

  const row = await tryPrisma(() =>
    prisma.adminUser.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        permissions: true,
        isActive: true,
        roleDefinition: {
          select: { name: true, permissions: true },
        },
      },
    }),
  );

  if (row) {
    if (!row.isActive) return null;
    const role = normalizeAdminRole(row.role);
    const permissions =
      role === "superadmin"
        ? resolvePermissions(role, [])
        : row.roleDefinition
          ? sanitizeSubadminPermissions(row.roleDefinition.permissions)
          : resolvePermissions(role, row.permissions);
    return {
      id: row.id,
      email: row.email,
      role,
      permissions,
      isActive: true,
    };
  }

  const mock = (mockStore.users as MockUser[]).find((u) => u.id === id);
  if (!mock || mock.active === false) return null;
  const role = normalizeAdminRole(mock.role);
  return {
    id: mock.id,
    email: mock.email,
    role,
    permissions: resolvePermissions(role, mock.permissions),
    isActive: true,
  };
}

/**
 * Phase 2/Roles: create superadmin or subadmin with checkbox permissions
 * and optional role template link.
 */
export async function createAdminUser(input: {
  email: string;
  password: string;
  name?: string;
  role?: AdminRole;
  permissions?: unknown;
  roleDefinitionId?: string | null;
}): Promise<AdminUserRow | { error: "duplicate" }> {
  const email = input.email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(input.password, 10);

  let role = normalizeAdminRole(input.role ?? "superadmin");
  let permissions =
    role === "superadmin" ? [] : sanitizeSubadminPermissions(input.permissions);
  let roleDefinitionId: string | null = input.roleDefinitionId?.trim() || null;

  if (roleDefinitionId) {
    const def =
      (await tryPrisma(() =>
        prisma.adminRoleDefinition.findUnique({
          where: { id: roleDefinitionId! },
          select: { id: true, name: true, permissions: true },
        }),
      )) ??
      mockStore.roleDefinitions.find((r) => r.id === roleDefinitionId) ??
      null;
    if (def) {
      if (def.name === "superadmin") {
        role = "superadmin";
        permissions = [];
        roleDefinitionId = def.id;
      } else {
        role = "subadmin";
        permissions = sanitizeSubadminPermissions(def.permissions);
        roleDefinitionId = def.id;
      }
    } else {
      roleDefinitionId = null;
    }
  }

  const db = await tryPrisma(async () => {
    try {
      const c = await prisma.adminUser.create({
        data: {
          email,
          passwordHash,
          name: input.name?.trim() || null,
          role,
          permissions,
          roleDefinitionId,
          isActive: true,
        },
        select: userSelect,
      });
      return mapDbUser(c);
    } catch (e: unknown) {
      const code = e && typeof e === "object" && "code" in e ? String((e as { code: string }).code) : "";
      if (code === "P2002") return "duplicate";
      throw e;
    }
  });

  if (db === "duplicate") return { error: "duplicate" };
  if (db && typeof db === "object" && "email" in db) return db as AdminUserRow;

  const users = mockStore.users as MockUser[];
  if (users.some((u) => u.email.toLowerCase() === email)) {
    return { error: "duplicate" };
  }
  const id = `u-${Date.now()}`;
  users.push({
    id,
    email,
    role,
    active: true,
    name: input.name?.trim() || null,
    passwordHash,
    permissions,
    roleDefinitionId,
  });
  return {
    id,
    email,
    name: input.name?.trim() || null,
    role,
    roleDefinitionId,
    roleDefinitionName:
      mockStore.roleDefinitions.find((r) => r.id === roleDefinitionId)?.name ?? null,
    permissions: resolvePermissions(role, permissions),
    isActive: true,
    createdAt: new Date().toISOString(),
  };
}

export async function setAdminUserActive(
  id: string,
  isActive: boolean,
): Promise<{ ok: true } | { ok: false; error: string; code?: "notfound" | "protected_superadmin" | "last" }> {
  const dbResult = await tryPrisma(async () => {
    const target = await prisma.adminUser.findUnique({
      where: { id },
      select: { isActive: true, role: true },
    });
    if (!target) return { err: "notfound" as const };

    // Superadmin accounts are locked — cannot deactivate / "delete".
    if (!isActive && normalizeAdminRole(target.role) === "superadmin") {
      return { err: "protected_super" as const };
    }

    if (!isActive && target.isActive) {
      const activeCount = await prisma.adminUser.count({ where: { isActive: true } });
      if (activeCount <= 1) return { err: "last" as const };
    }

    try {
      await prisma.adminUser.update({ where: { id }, data: { isActive } });
    } catch {
      return { err: "notfound" as const };
    }
    return { err: null };
  });

  if (dbResult) {
    if (dbResult.err === "notfound") return { ok: false, error: "User not found.", code: "notfound" };
    if (dbResult.err === "protected_super") {
      return {
        ok: false,
        error: "Superadmin accounts are protected and cannot be deactivated.",
        code: "protected_superadmin",
      };
    }
    if (dbResult.err === "last") {
      return { ok: false, error: "Cannot deactivate the last active admin.", code: "last" };
    }
    return { ok: true };
  }

  const users = mockStore.users as MockUser[];
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return { ok: false, error: "User not found.", code: "notfound" };
  if (!isActive && normalizeAdminRole(users[idx]!.role) === "superadmin") {
    return {
      ok: false,
      error: "Superadmin accounts are protected and cannot be deactivated.",
      code: "protected_superadmin",
    };
  }
  if (!isActive) {
    const activeCount = users.filter((u) => u.active).length;
    if (users[idx]!.active && activeCount <= 1) {
      return { ok: false, error: "Cannot deactivate the last active admin.", code: "last" };
    }
  }
  users[idx]!.active = isActive;
  return { ok: true };
}

export async function updateAdminUserPassword(
  id: string,
  newPassword: string,
): Promise<{ ok: true } | { ok: false; error: string; code: "notfound" | "protected_superadmin" }> {
  const existing = await getAdminUserById(id);
  if (!existing) return { ok: false, error: "User not found.", code: "notfound" };
  if (existing.role === "superadmin") {
    return {
      ok: false,
      error: "Superadmin password cannot be reset from Users. Change it via your own account settings only.",
      code: "protected_superadmin",
    };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  const ok = await tryPrisma(async () => {
    try {
      await prisma.adminUser.update({ where: { id }, data: { passwordHash } });
      return true;
    } catch {
      return false;
    }
  });
  if (ok === true) return { ok: true };
  if (ok === false) return { ok: false, error: "User not found.", code: "notfound" };

  const users = mockStore.users as MockUser[];
  const u = users.find((x) => x.id === id);
  if (!u) return { ok: false, error: "User not found.", code: "notfound" };
  u.passwordHash = passwordHash;
  return { ok: true };
}

/** How many admin rows exist (any status). null = DB unavailable. */
export async function countAdminUsers(): Promise<number | null> {
  const n = await tryPrisma(() => prisma.adminUser.count());
  if (typeof n === "number") return n;
  return (mockStore.users as MockUser[]).length;
}

/**
 * Create the first admin, or replace the oldest admin when forceReplace is true.
 * Used by first-time setup / bootstrap seed.
 */
export async function setPrimaryAdminCredentials(input: {
  email: string;
  password: string;
  name?: string;
  forceReplace?: boolean;
}): Promise<AdminUserRow | { error: "exists" | "unavailable" | "duplicate" }> {
  const email = input.email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(input.password, 10);
  const name = input.name?.trim() || "Primary Admin";

  const db = await tryPrisma(async () => {
    const count = await prisma.adminUser.count();
    if (count === 0) {
      const created = await prisma.adminUser.create({
        data: {
          email,
          passwordHash,
          name,
          role: "superadmin",
          permissions: [],
          isActive: true,
        },
        select: userSelect,
      });
      return mapDbUser(created);
    }

    if (!input.forceReplace) {
      return "exists" as const;
    }

    const primary = await prisma.adminUser.findFirst({
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });
    if (!primary) return "unavailable" as const;

    try {
      const updated = await prisma.adminUser.update({
        where: { id: primary.id },
        data: {
          email,
          passwordHash,
          name,
          isActive: true,
          role: "superadmin",
          permissions: [],
        },
        select: userSelect,
      });
      return mapDbUser(updated);
    } catch (e: unknown) {
      const code = e && typeof e === "object" && "code" in e ? String((e as { code: string }).code) : "";
      if (code === "P2002") return "duplicate" as const;
      throw e;
    }
  });

  if (db === "exists") return { error: "exists" };
  if (db === "unavailable") return { error: "unavailable" };
  if (db === "duplicate") return { error: "duplicate" };
  if (db && typeof db === "object" && "email" in db) return db as AdminUserRow;

  // Mock fallback (dev without DB)
  const users = mockStore.users as MockUser[];
  if (users.length === 0 || input.forceReplace) {
    if (users.length === 0) {
      users.push({
        id: "u1",
        email,
        role: "superadmin",
        active: true,
        name,
        passwordHash,
        permissions: [],
      });
    } else {
      users[0]!.email = email;
      users[0]!.passwordHash = passwordHash;
      users[0]!.name = name;
      users[0]!.active = true;
      users[0]!.role = "superadmin";
      users[0]!.permissions = [];
    }
    return {
      id: users[0]!.id,
      email,
      name,
      role: "superadmin",
      roleDefinitionId: null,
      roleDefinitionName: null,
      permissions: resolvePermissions("superadmin", []),
      isActive: true,
      createdAt: new Date().toISOString(),
    };
  }
  return { error: "exists" };
}

export async function getAdminUserById(id: string): Promise<AdminUserRow | null> {
  const targetId = id.trim();
  if (!targetId) return null;

  const row = await tryPrisma(() =>
    prisma.adminUser.findUnique({
      where: { id: targetId },
      select: userSelect,
    }),
  );
  if (row) return mapDbUser(row);

  const mock = (mockStore.users as MockUser[]).find((u) => u.id === targetId);
  if (!mock) return null;
  const role = normalizeAdminRole(mock.role);
  return {
    id: mock.id,
    email: mock.email,
    name: mock.name ?? null,
    role,
    roleDefinitionId: mock.roleDefinitionId ?? null,
    roleDefinitionName: null,
    permissions: resolvePermissions(role, mock.permissions),
    isActive: Boolean(mock.active),
    createdAt: new Date().toISOString(),
  };
}

/** Active users that resolve to superadmin (includes legacy role "admin"). */
export async function countActiveSuperadmins(): Promise<number | null> {
  const rows = await tryPrisma(() =>
    prisma.adminUser.findMany({
      where: { isActive: true },
      select: { role: true },
    }),
  );
  if (rows) {
    return rows.filter((r) => normalizeAdminRole(r.role) === "superadmin").length;
  }
  return (mockStore.users as MockUser[]).filter(
    (u) => u.active && normalizeAdminRole(u.role) === "superadmin",
  ).length;
}

/**
 * Update role (+ optional role template) and permissions.
 * Prefer roleDefinitionId — copies template permissions onto the user.
 */
export async function updateAdminUserAccess(input: {
  id: string;
  role?: AdminRole;
  permissions?: unknown;
  roleDefinitionId?: string | null;
  /** Actor performing the change (session user id). */
  actorUserId: string;
}): Promise<
  | { ok: true; data: AdminUserRow }
  | {
      ok: false;
      error: string;
      code: "notfound" | "invalid_role" | "protected_superadmin";
    }
> {
  const targetId = input.id.trim();

  const existing = await getAdminUserById(targetId);
  if (!existing) return { ok: false, error: "User not found.", code: "notfound" };

  // Superadmin accounts are locked — role / access cannot be changed.
  if (existing.role === "superadmin") {
    return {
      ok: false,
      error: "Superadmin access is locked and cannot be edited.",
      code: "protected_superadmin",
    };
  }

  let nextRole = normalizeAdminRole(input.role ?? "subadmin");
  let nextPermissions =
    nextRole === "superadmin" ? [] : sanitizeSubadminPermissions(input.permissions);
  let nextRoleDefinitionId: string | null =
    input.roleDefinitionId === undefined ? null : input.roleDefinitionId?.trim() || null;

  if (input.roleDefinitionId !== undefined) {
    const defId = input.roleDefinitionId?.trim() || null;
    if (!defId) {
      return { ok: false, error: "Role is required.", code: "invalid_role" };
    }
    const def =
      (await tryPrisma(() =>
        prisma.adminRoleDefinition.findUnique({
          where: { id: defId },
          select: { id: true, name: true, permissions: true },
        }),
      )) ??
      mockStore.roleDefinitions.find((r) => r.id === defId) ??
      null;
    if (!def) {
      return { ok: false, error: "Role not found.", code: "invalid_role" };
    }
    if (def.name === "superadmin") {
      nextRole = "superadmin";
      nextPermissions = [];
      nextRoleDefinitionId = def.id;
    } else {
      nextRole = "subadmin";
      nextPermissions = sanitizeSubadminPermissions(def.permissions);
      nextRoleDefinitionId = def.id;
    }
  }

  const db = await tryPrisma(async () => {
    try {
      const updated = await prisma.adminUser.update({
        where: { id: targetId },
        data: {
          role: nextRole,
          permissions: nextPermissions,
          ...(input.roleDefinitionId !== undefined
            ? { roleDefinitionId: nextRoleDefinitionId }
            : { roleDefinitionId: null }),
        },
        select: userSelect,
      });
      return mapDbUser(updated);
    } catch {
      return null;
    }
  });

  if (db) return { ok: true, data: db };

  const users = mockStore.users as MockUser[];
  const idx = users.findIndex((u) => u.id === targetId);
  if (idx === -1) return { ok: false, error: "User not found.", code: "notfound" };
  users[idx]!.role = nextRole;
  users[idx]!.permissions = nextPermissions;
  users[idx]!.roleDefinitionId = nextRoleDefinitionId ?? null;
  return {
    ok: true,
    data: {
      id: users[idx]!.id,
      email: users[idx]!.email,
      name: users[idx]!.name ?? null,
      role: nextRole,
      roleDefinitionId: nextRoleDefinitionId ?? null,
      roleDefinitionName:
        mockStore.roleDefinitions.find((r) => r.id === nextRoleDefinitionId)?.name ?? null,
      permissions: resolvePermissions(nextRole, nextPermissions),
      isActive: Boolean(users[idx]!.active),
      createdAt: new Date().toISOString(),
    },
  };
}

/** One-time / deploy: legacy role "admin" → "superadmin". */
export async function migrateLegacyAdminRoles(): Promise<{ updated: number } | null> {
  const result = await tryPrisma(async () => {
    const res = await prisma.adminUser.updateMany({
      where: {
        OR: [{ role: "admin" }, { role: "" }],
      },
      data: {
        role: "superadmin",
        permissions: [],
      },
    });
    return { updated: res.count };
  });
  return result;
}
