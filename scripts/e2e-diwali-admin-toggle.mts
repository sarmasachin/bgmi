/**
 * E2E: Diwali admin setting — toggle DB flag, verify public HTML on/off.
 * Run: npx tsx scripts/e2e-diwali-admin-toggle.mts
 */
import { PrismaClient } from "@prisma/client";
import { isDiwaliDiyasEnabled } from "../src/lib/diwaliDecor";

const BASE = process.env.E2E_BASE ?? "http://127.0.0.1:3000";
const KEY = "settings:integrations";
const PAGES = [
  "/",
  "/bgmi",
  "/bgmi-air",
  "/pubg",
  "/pubg-mobile-flash",
  "/gta-6-sensitivity-settings-calculator",
  "/gta-6-cheat-code",
  "/free-fire-max-sensitivity-settings-calculator",
  "/free-fire-india",
];

/** Pages with calculator / update-strip Diwali UI (cheat article has none). */
const DIYA_REQUIRED = new Set([
  "/",
  "/bgmi",
  "/bgmi-air",
  "/pubg",
  "/pubg-mobile-flash",
  "/gta-6-sensitivity-settings-calculator",
  "/free-fire-max-sensitivity-settings-calculator",
  "/free-fire-india",
]);

const prisma = new PrismaClient();

function hasDiya(html: string) {
  return /class="diya |diya--left|diya--right/.test(html);
}

function hasDiwaliClass(html: string) {
  return /--diwali/.test(html);
}

async function readIntegrations(): Promise<Record<string, unknown>> {
  const row = await prisma.siteSetting.findUnique({ where: { key: KEY } });
  const raw = row?.value;
  return raw && typeof raw === "object" && !Array.isArray(raw)
    ? (raw as Record<string, unknown>)
    : {};
}

async function setDiwali(on: boolean) {
  const existing = await readIntegrations();
  const next = { ...existing, showDiwaliDiyas: on };
  await prisma.siteSetting.upsert({
    where: { key: KEY },
    create: { key: KEY, value: next },
    update: { value: next },
  });
  const after = await readIntegrations();
  const enabled = isDiwaliDiyasEnabled(after);
  if (enabled !== on) {
    throw new Error(`DB showDiwaliDiyas expected ${on}, got ${enabled} raw=${JSON.stringify(after.showDiwaliDiyas)}`);
  }
}

async function fetchPage(path: string) {
  const res = await fetch(`${BASE}${path}`, {
    cache: "no-store",
    headers: { "Cache-Control": "no-cache" },
  });
  const html = await res.text();
  return { status: res.status, diya: hasDiya(html), diwaliClass: hasDiwaliClass(html), path };
}

async function checkPages(expectOn: boolean) {
  const rows = [];
  for (const path of PAGES) {
    const r = await fetchPage(path);
    rows.push(r);
    if (r.status !== 200) throw new Error(`${path} status ${r.status}`);
    const expectDiya = expectOn && DIYA_REQUIRED.has(path);
    if (r.diya !== expectDiya) {
      throw new Error(`${path}: diya expected ${expectDiya}, got ${r.diya}`);
    }
    if (expectDiya && !r.diwaliClass) {
      throw new Error(`${path}: missing --diwali class while ON`);
    }
    if (!expectOn && r.diwaliClass) {
      throw new Error(`${path}: --diwali class still present while OFF`);
    }
  }
  return rows;
}

async function main() {
  const original = isDiwaliDiyasEnabled(await readIntegrations());
  console.log("original=", original);

  try {
    console.log("\n--- OFF ---");
    await setDiwali(false);
    // brief wait so any in-flight RSC isn't stale; still request-scoped getSettings
    const offRows = await checkPages(false);
    console.log(offRows.map((r) => `${r.path} diya=${r.diya} class=${r.diwaliClass}`).join("\n"));

    console.log("\n--- ON ---");
    await setDiwali(true);
    const onRows = await checkPages(true);
    console.log(onRows.map((r) => `${r.path} diya=${r.diya} class=${r.diwaliClass}`).join("\n"));

    console.log("\n--- restore ---");
    await setDiwali(original);
    console.log("OK e2e diwali admin toggle");
  } catch (err) {
    console.error("FAIL", err);
    try {
      await setDiwali(original);
      console.log("restored original=", original);
    } catch (e2) {
      console.error("restore failed", e2);
    }
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
