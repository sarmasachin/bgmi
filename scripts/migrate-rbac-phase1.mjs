/**
 * RBAC Phase 1 data migration:
 * - Ensure AdminUser.permissions column exists (run prisma db push first)
 * - Map legacy role "admin" / empty → "superadmin"
 * - Clear permissions array for superadmins (effective access is full via code)
 *
 * Usage (on server after git pull + prisma generate + prisma db push):
 *   node scripts/migrate-rbac-phase1.mjs
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

async function main() {
  const legacy = await prisma.adminUser.updateMany({
    where: {
      OR: [{ role: "admin" }, { role: "" }],
    },
    data: {
      role: "superadmin",
      permissions: [],
    },
  });

  // Also normalize any superadmin that somehow has null-ish permissions
  const supers = await prisma.adminUser.findMany({
    where: { role: "superadmin" },
    select: { id: true, permissions: true },
  });
  let cleared = 0;
  for (const row of supers) {
    if (!Array.isArray(row.permissions)) {
      await prisma.adminUser.update({
        where: { id: row.id },
        data: { permissions: [] },
      });
      cleared += 1;
    }
  }

  const total = await prisma.adminUser.count();
  console.log(
    JSON.stringify(
      {
        ok: true,
        legacyRolesUpdated: legacy.count,
        superadminPermissionsNormalized: cleared,
        totalAdminUsers: total,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
