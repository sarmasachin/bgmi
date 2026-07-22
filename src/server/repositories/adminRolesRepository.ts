import { prisma, tryPrismaLong } from "@/src/server/dbSafe";
import { mockStore } from "@/src/server/mockStore";
import {
  ALL_ADMIN_PERMISSIONS,
  isSuperAdminRole,
  normalizeAdminRole,
  sanitizeSubadminPermissions,
  type AdminPermission,
} from "@/src/server/rbac/permissions";

export type AdminRoleDefinitionRow = {
  id: string;
  name: string;
  permissions: AdminPermission[];
  isSystem: boolean;
  userCount: number;
  createdAt: string;
  updatedAt: string;
};

function slugifyRoleName(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
}

function mapRoleRow(
  row: {
    id: string;
    name: string;
    permissions: unknown;
    isSystem: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
    _count?: { users: number };
  },
): AdminRoleDefinitionRow {
  const isSuper = row.name === "superadmin" || isSuperAdminRole(row.name);
  const createdAt =
    typeof row.createdAt === "string" ? row.createdAt : row.createdAt.toISOString();
  const updatedAt =
    typeof row.updatedAt === "string" ? row.updatedAt : row.updatedAt.toISOString();
  return {
    id: row.id,
    name: row.name,
    permissions: isSuper
      ? [...ALL_ADMIN_PERMISSIONS]
      : sanitizeSubadminPermissions(row.permissions),
    isSystem: row.isSystem,
    userCount: row._count?.users ?? 0,
    createdAt,
    updatedAt,
  };
}

function mapMockRole(row: (typeof mockStore.roleDefinitions)[number]): AdminRoleDefinitionRow {
  const userCount = mockStore.users.filter((u) => u.roleDefinitionId === row.id).length;
  return mapRoleRow({ ...row, _count: { users: userCount } });
}

const roleSelect = {
  id: true,
  name: true,
  permissions: true,
  isSystem: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { users: true } },
} as const;

/** Ensure system roles exist (superadmin + subadmin). */
export async function ensureSystemRoleDefinitions(): Promise<void> {
  await tryPrismaLong(async () => {
    const existing = await prisma.adminRoleDefinition.findMany({
      select: { name: true },
    });
    const names = new Set(existing.map((r) => r.name));

    if (!names.has("superadmin")) {
      await prisma.adminRoleDefinition.create({
        data: {
          name: "superadmin",
          permissions: [],
          isSystem: true,
        },
      });
    }
    if (!names.has("subadmin")) {
      await prisma.adminRoleDefinition.create({
        data: {
          name: "subadmin",
          permissions: ["dashboard.view", "contact.view", "contact.reply"],
          isSystem: true,
        },
      });
    }
  });
}

export async function listAdminRoleDefinitions(): Promise<AdminRoleDefinitionRow[]> {
  await ensureSystemRoleDefinitions();
  const rows = await tryPrismaLong(() =>
    prisma.adminRoleDefinition.findMany({
      orderBy: [{ isSystem: "desc" }, { name: "asc" }],
      select: roleSelect,
    }),
  );
  if (rows && rows.length > 0) return rows.map(mapRoleRow);

  if (rows && rows.length === 0) {
    // Table exists but empty — seed then re-read once.
    await ensureSystemRoleDefinitions();
    const again = await tryPrismaLong(() =>
      prisma.adminRoleDefinition.findMany({
        orderBy: [{ isSystem: "desc" }, { name: "asc" }],
        select: roleSelect,
      }),
    );
    if (again && again.length > 0) return again.map(mapRoleRow);
  }

  // DB unavailable / table missing — mock so local admin UI still works.
  if (!Array.isArray(mockStore.roleDefinitions) || mockStore.roleDefinitions.length === 0) {
    const now = new Date().toISOString();
    mockStore.roleDefinitions = [
      {
        id: "role-superadmin",
        name: "superadmin",
        permissions: [],
        isSystem: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "role-subadmin",
        name: "subadmin",
        permissions: ["dashboard.view", "contact.view", "contact.reply"],
        isSystem: true,
        createdAt: now,
        updatedAt: now,
      },
    ];
  }
  return mockStore.roleDefinitions.map(mapMockRole);
}

export async function getAdminRoleDefinitionById(
  id: string,
): Promise<AdminRoleDefinitionRow | null> {
  await ensureSystemRoleDefinitions();
  const row = await tryPrismaLong(() =>
    prisma.adminRoleDefinition.findUnique({
      where: { id: id.trim() },
      select: roleSelect,
    }),
  );
  if (row) return mapRoleRow(row);
  const mock = mockStore.roleDefinitions.find((r) => r.id === id.trim());
  return mock ? mapMockRole(mock) : null;
}

export async function getAdminRoleDefinitionByName(
  name: string,
): Promise<AdminRoleDefinitionRow | null> {
  await ensureSystemRoleDefinitions();
  const slug = slugifyRoleName(name);
  if (!slug) return null;
  const row = await tryPrismaLong(() =>
    prisma.adminRoleDefinition.findUnique({
      where: { name: slug },
      select: roleSelect,
    }),
  );
  if (row) return mapRoleRow(row);
  const mock = mockStore.roleDefinitions.find((r) => r.name === slug);
  return mock ? mapMockRole(mock) : null;
}

export async function createAdminRoleDefinition(input: {
  name: string;
  permissions?: unknown;
}): Promise<AdminRoleDefinitionRow | { error: "invalid" | "duplicate" | "unavailable" }> {
  const slug = slugifyRoleName(input.name);
  if (!slug || slug === "superadmin" || slug === "admin") {
    return { error: "invalid" };
  }

  const permissions = sanitizeSubadminPermissions(input.permissions);
  const created = await tryPrismaLong(async () => {
    try {
      return await prisma.adminRoleDefinition.create({
        data: {
          name: slug,
          permissions,
          isSystem: false,
        },
        select: roleSelect,
      });
    } catch (e: unknown) {
      const code = e && typeof e === "object" && "code" in e ? String((e as { code: string }).code) : "";
      if (code === "P2002") return "duplicate" as const;
      throw e;
    }
  });

  if (created === "duplicate") return { error: "duplicate" };
  if (created) return mapRoleRow(created);

  if (mockStore.roleDefinitions.some((r) => r.name === slug)) return { error: "duplicate" };
  const now = new Date().toISOString();
  const row = {
    id: `role-${Date.now()}`,
    name: slug,
    permissions,
    isSystem: false,
    createdAt: now,
    updatedAt: now,
  };
  mockStore.roleDefinitions.push(row);
  return mapMockRole(row);
}

export async function updateAdminRoleDefinition(input: {
  id: string;
  name?: string;
  permissions?: unknown;
}): Promise<
  | { ok: true; data: AdminRoleDefinitionRow }
  | { ok: false; error: string; code: "notfound" | "invalid" | "duplicate" | "locked" | "unavailable" }
> {
  const existing = await getAdminRoleDefinitionById(input.id);
  if (!existing) return { ok: false, error: "Role not found.", code: "notfound" };
  if (existing.name === "superadmin") {
    return { ok: false, error: "Superadmin role is locked and cannot be edited.", code: "locked" };
  }

  let nextName = existing.name;
  if (input.name !== undefined) {
    const slug = slugifyRoleName(input.name);
    if (!slug) return { ok: false, error: "Invalid role name.", code: "invalid" };
    if (existing.isSystem && slug !== existing.name) {
      return { ok: false, error: "System role name cannot be changed.", code: "locked" };
    }
    if (!existing.isSystem && (slug === "superadmin" || slug === "admin")) {
      return { ok: false, error: "That role name is reserved.", code: "invalid" };
    }
    nextName = existing.isSystem ? existing.name : slug;
  }

  const nextPermissions =
    existing.name === "superadmin"
      ? []
      : input.permissions !== undefined
        ? sanitizeSubadminPermissions(input.permissions)
        : existing.permissions;

  const updated = await tryPrismaLong(async () => {
    try {
      const row = await prisma.adminRoleDefinition.update({
        where: { id: existing.id },
        data: {
          name: nextName,
          permissions: nextPermissions,
        },
        select: roleSelect,
      });

      // Keep assigned users' cached permissions in sync (subadmins only).
      if (existing.name !== "superadmin") {
        await prisma.adminUser.updateMany({
          where: {
            roleDefinitionId: existing.id,
            NOT: { role: { in: ["superadmin", "admin"] } },
          },
          data: {
            permissions: nextPermissions,
            role: "subadmin",
          },
        });
      }

      return row;
    } catch (e: unknown) {
      const code = e && typeof e === "object" && "code" in e ? String((e as { code: string }).code) : "";
      if (code === "P2002") return "duplicate" as const;
      throw e;
    }
  });

  if (updated === "duplicate") {
    return { ok: false, error: "A role with this name already exists.", code: "duplicate" };
  }
  if (updated) return { ok: true, data: mapRoleRow(updated) };

  const idx = mockStore.roleDefinitions.findIndex((r) => r.id === existing.id);
  if (idx === -1) return { ok: false, error: "Role not found.", code: "notfound" };
  if (
    nextName !== existing.name &&
    mockStore.roleDefinitions.some((r, i) => i !== idx && r.name === nextName)
  ) {
    return { ok: false, error: "A role with this name already exists.", code: "duplicate" };
  }
  const now = new Date().toISOString();
  mockStore.roleDefinitions[idx] = {
    ...mockStore.roleDefinitions[idx]!,
    name: nextName,
    permissions: nextPermissions,
    updatedAt: now,
  };
  for (const user of mockStore.users) {
    if (user.roleDefinitionId === existing.id && user.role !== "superadmin" && user.role !== "admin") {
      user.permissions = nextPermissions;
      user.role = "subadmin";
    }
  }
  return { ok: true, data: mapMockRole(mockStore.roleDefinitions[idx]!) };
}

export async function deleteAdminRoleDefinition(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string; code: "notfound" | "locked" | "in_use" | "unavailable" }> {
  const existing = await getAdminRoleDefinitionById(id);
  if (!existing) return { ok: false, error: "Role not found.", code: "notfound" };
  if (existing.isSystem) {
    return { ok: false, error: "System roles cannot be deleted.", code: "locked" };
  }
  if (existing.userCount > 0) {
    return {
      ok: false,
      error: "Role is assigned to users. Reassign them first.",
      code: "in_use",
    };
  }

  const deleted = await tryPrismaLong(async () => {
    await prisma.adminRoleDefinition.delete({ where: { id: existing.id } });
    return true;
  });
  if (deleted) return { ok: true };

  const before = mockStore.roleDefinitions.length;
  mockStore.roleDefinitions = mockStore.roleDefinitions.filter((r) => r.id !== existing.id);
  if (mockStore.roleDefinitions.length === before) {
    return { ok: false, error: "Role not found.", code: "notfound" };
  }
  return { ok: true };
}

export { slugifyRoleName, normalizeAdminRole };
