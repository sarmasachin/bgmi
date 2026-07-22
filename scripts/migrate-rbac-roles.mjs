/**
 * Roles & Permissions seed:
 * - Ensure system roles (superadmin, subadmin)
 * - Link existing AdminUsers to matching role templates when roleDefinitionId is null
 *
 * Usage (after prisma generate + prisma db push):
 *   node scripts/migrate-rbac-roles.mjs
 */
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

function loadDotEnv(fileName) {
  const filePath = path.join(process.cwd(), fileName);
  if (!fs.existsSync(filePath)) return;
  const raw = fs.readFileSync(filePath, "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let val = trimmed.slice(idx + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadDotEnv(".env");
loadDotEnv(".env.local");

async function ensureSystemRoles() {
  const existing = await prisma.adminRoleDefinition.findMany({ select: { name: true } });
  const names = new Set(existing.map((r) => r.name));
  let created = 0;

  if (!names.has("superadmin")) {
    await prisma.adminRoleDefinition.create({
      data: { name: "superadmin", permissions: [], isSystem: true },
    });
    created += 1;
  }
  if (!names.has("subadmin")) {
    await prisma.adminRoleDefinition.create({
      data: {
        name: "subadmin",
        permissions: ["dashboard.view", "contact.view", "contact.reply"],
        isSystem: true,
      },
    });
    created += 1;
  }
  return created;
}

async function main() {
  const rolesCreated = await ensureSystemRoles();
  const roles = await prisma.adminRoleDefinition.findMany({
    select: { id: true, name: true, permissions: true },
  });
  const byName = Object.fromEntries(roles.map((r) => [r.name, r]));

  const users = await prisma.adminUser.findMany({
    select: { id: true, role: true, roleDefinitionId: true, permissions: true },
  });

  let linked = 0;
  for (const user of users) {
    if (user.roleDefinitionId) continue;
    const isSuper = user.role === "superadmin" || user.role === "admin" || !user.role;
    const def = isSuper ? byName.superadmin : byName.subadmin;
    if (!def) continue;

    await prisma.adminUser.update({
      where: { id: user.id },
      data: {
        role: isSuper ? "superadmin" : "subadmin",
        roleDefinitionId: def.id,
        permissions: isSuper ? [] : Array.isArray(user.permissions) ? user.permissions : [],
      },
    });
    linked += 1;
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        rolesCreated,
        usersLinked: linked,
        totalRoles: roles.length,
        totalUsers: users.length,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
