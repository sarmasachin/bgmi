import bcrypt from "bcryptjs";
import { prisma, tryPrisma } from "@/src/server/dbSafe";
import { mockStore } from "@/src/server/mockStore";

export type AdminUserRow = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
};

type MockUser = {
  id: string;
  email: string;
  role: string;
  active: boolean;
  name?: string | null;
  passwordHash?: string;
};

function mapDbUser(u: {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
  createdAt: Date;
}): AdminUserRow {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    isActive: u.isActive,
    createdAt: u.createdAt.toISOString(),
  };
}

export async function listAdminUsers(): Promise<AdminUserRow[]> {
  const rows = await tryPrisma(() =>
    prisma.adminUser.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
    }),
  );
  if (rows) return rows.map(mapDbUser);

  return (mockStore.users as MockUser[]).map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name ?? null,
    role: u.role,
    isActive: Boolean(u.active),
    createdAt: new Date().toISOString(),
  }));
}

export async function createAdminUser(input: {
  email: string;
  password: string;
  name?: string;
}): Promise<AdminUserRow | { error: "duplicate" }> {
  const email = input.email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(input.password, 10);

  const db = await tryPrisma(async () => {
    try {
      const c = await prisma.adminUser.create({
        data: {
          email,
          passwordHash,
          name: input.name?.trim() || null,
          role: "admin",
          isActive: true,
        },
        select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
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
    role: "admin",
    active: true,
    name: input.name?.trim() || null,
    passwordHash,
  });
  return {
    id,
    email,
    name: input.name?.trim() || null,
    role: "admin",
    isActive: true,
    createdAt: new Date().toISOString(),
  };
}

export async function setAdminUserActive(
  id: string,
  isActive: boolean,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const dbResult = await tryPrisma(async () => {
    if (!isActive) {
      const activeCount = await prisma.adminUser.count({ where: { isActive: true } });
      const target = await prisma.adminUser.findUnique({ where: { id }, select: { isActive: true } });
      if (!target) return { err: "notfound" as const };
      if (target.isActive && activeCount <= 1) return { err: "last" as const };
    }
    try {
      await prisma.adminUser.update({ where: { id }, data: { isActive } });
    } catch {
      return { err: "notfound" as const };
    }
    return { err: null };
  });

  if (dbResult) {
    if (dbResult.err === "notfound") return { ok: false, error: "User not found." };
    if (dbResult.err === "last") return { ok: false, error: "Cannot deactivate the last active admin." };
    return { ok: true };
  }

  const users = mockStore.users as MockUser[];
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return { ok: false, error: "User not found." };
  if (!isActive) {
    const activeCount = users.filter((u) => u.active).length;
    if (users[idx].active && activeCount <= 1) {
      return { ok: false, error: "Cannot deactivate the last active admin." };
    }
  }
  users[idx].active = isActive;
  return { ok: true };
}

export async function updateAdminUserPassword(id: string, newPassword: string): Promise<boolean> {
  const passwordHash = await bcrypt.hash(newPassword, 10);
  const ok = await tryPrisma(async () => {
    try {
      await prisma.adminUser.update({ where: { id }, data: { passwordHash } });
      return true;
    } catch {
      return false;
    }
  });
  if (ok === true) return true;
  if (ok === false) return false;

  const users = mockStore.users as MockUser[];
  const u = users.find((x) => x.id === id);
  if (!u) return false;
  u.passwordHash = passwordHash;
  return true;
}
