import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { PrismaClient } from "@prisma/client";

const root = process.cwd();

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

function run(cmd, label) {
  console.log(`\n▶ ${label}`);
  console.log(`  $ ${cmd}`);
  execSync(cmd, { stdio: "inherit", cwd: root, env: process.env });
}

function assertDockerReady() {
  try {
    execSync("docker info", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function parseDbTarget() {
  const url = new URL(process.env.DATABASE_URL ?? "");
  return {
    host: url.hostname,
    port: url.port || "5432",
    db: url.pathname.slice(1),
    user: url.username,
  };
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

function setDatabaseUrlPort5433() {
  const dbUrl = "postgresql://postgres:postgres@localhost:5433/bgmi";
  for (const file of [".env", ".env.local"]) {
    const filePath = path.join(root, file);
    if (!fs.existsSync(filePath)) continue;
    const next = fs
      .readFileSync(filePath, "utf8")
      .replace(/DATABASE_URL="[^"]*"/, `DATABASE_URL="${dbUrl}"`);
    fs.writeFileSync(filePath, next, "utf8");
    console.log(`✓ Updated ${file} DATABASE_URL → localhost:5433/bgmi`);
  }
  process.env.DATABASE_URL = dbUrl;
}

if (!process.env.DATABASE_URL) {
  console.error("✗ DATABASE_URL missing in .env / .env.local");
  process.exit(1);
}

const target = parseDbTarget();
console.log("Phase 1 setup");
console.log(`Database target: ${target.user}@${target.host}:${target.port}/${target.db}`);

if (!assertDockerReady()) {
  console.error("\n✗ Docker daemon is not running.");
  console.error("  1) Open Docker Desktop manually and wait until it shows Running.");
  console.error("  2) Re-run: node scripts/phase1-setup.mjs");
  process.exit(1);
}

run("docker compose up -d postgres", "Start BGMI Postgres container (host port 5433)");
setDatabaseUrlPort5433();
run("npm run prisma:push", "Apply Prisma schema");
run("npm run seed:admin", "Seed admin user");

const ok = await verifyPrisma();
if (!ok) {
  console.error("\n✗ Admin user not found after seed.");
  process.exit(1);
}

console.log("\n✓ Phase 1 complete.");
console.log("  Admin login: http://localhost:3000/admin/login");
console.log("  Email: admin@example.com");
console.log("  Password: 1234");
