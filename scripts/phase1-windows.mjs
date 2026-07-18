import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { PrismaClient } from "@prisma/client";

const root = process.cwd();
const PSQL = "C:\\Program Files\\PostgreSQL\\16\\bin\\psql.exe";
const DB_URL = "postgresql://postgres:postgres@localhost:5432/bgmi";

function loadDotEnv(fileName) {
  const filePath = path.join(root, fileName);
  if (!fs.existsSync(filePath)) return;
  const raw = fs.readFileSync(filePath, "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let val = trimmed.slice(idx + 1).trim();
    if ((val.startsWith("\"") && val.endsWith("\"")) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

function runPsql(sql, label, { allowFail = false } = {}) {
  const password = process.env.PG_SUPERUSER_PASSWORD;
  if (!password) {
    console.error("✗ PG_SUPERUSER_PASSWORD is required.");
    console.error("  Example (PowerShell):");
    console.error('  $env:PG_SUPERUSER_PASSWORD="your_postgres_password"');
    console.error("  npm run setup:phase1:windows");
    process.exit(1);
  }
  console.log(`\n▶ ${label}`);
  try {
    execSync(`"${PSQL}" -U postgres -h localhost -p 5432 -d postgres -v ON_ERROR_STOP=1 -c "${sql.replace(/"/g, '\\"')}"`, {
      stdio: "inherit",
      cwd: root,
      env: { ...process.env, PGPASSWORD: password },
    });
  } catch (error) {
    if (!allowFail) throw error;
    console.log("  (skipped — already exists or not needed)");
  }
}

function setDatabaseUrlInEnvFiles() {
  for (const file of [".env", ".env.local"]) {
    const filePath = path.join(root, file);
    if (!fs.existsSync(filePath)) continue;
    const next = fs
      .readFileSync(filePath, "utf8")
      .replace(/DATABASE_URL="[^"]*"/, `DATABASE_URL="${DB_URL}"`);
    fs.writeFileSync(filePath, next, "utf8");
    console.log(`✓ Updated ${file} DATABASE_URL → localhost:5432/bgmi`);
  }
  process.env.DATABASE_URL = DB_URL;
}

function run(cmd, label) {
  console.log(`\n▶ ${label}`);
  execSync(cmd, { stdio: "inherit", cwd: root, env: process.env });
}

async function verifyPrisma() {
  const prisma = new PrismaClient({ log: [] });
  const t0 = performance.now();
  try {
    const count = await prisma.siteSetting.count();
    const admin = await prisma.adminUser.findFirst({
      where: { email: "admin@example.com", isActive: true },
      select: { email: true },
    });
    const ms = Math.round(performance.now() - t0);
    console.log(`✓ Prisma OK in ${ms}ms (siteSetting rows: ${count}, admin: ${admin?.email ?? "missing"})`);
    return Boolean(admin);
  } finally {
    await prisma.$disconnect();
  }
}

loadDotEnv(".env");
loadDotEnv(".env.local");

console.log("Phase 1 setup (Windows PostgreSQL 16 on port 5432)");

runPsql("SELECT version();", "Verify superuser connection");
runPsql("CREATE DATABASE bgmi;", "Create database bgmi", { allowFail: true });
runPsql("ALTER USER postgres WITH PASSWORD 'postgres';", "Align postgres user password with project .env");

setDatabaseUrlInEnvFiles();
run("npm run prisma:push", "Apply Prisma schema");
run("npm run seed:admin", "Seed admin user");

const ok = await verifyPrisma();
if (!ok) {
  console.error("\n✗ Admin user not found after seed.");
  process.exit(1);
}

console.log("\n✓ Phase 1 complete (Windows PostgreSQL).");
console.log("  Admin login: http://localhost:3000/admin/login");
console.log("  Email: admin@example.com");
console.log("  Password: 1234");
