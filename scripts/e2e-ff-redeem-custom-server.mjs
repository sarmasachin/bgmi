/**
 * E2E: admin can add custom redeem servers (FF CMS).
 * Run: npx tsx scripts/e2e-ff-redeem-custom-server.mjs
 */
import fs from "fs";
import path from "path";
import {
  getFreeFireRedeemPage,
  getFreeFireRedeemPageForAdmin,
  saveFreeFireRedeemPage,
} from "../src/server/repositories/freeFireRedeemCodesRepository.ts";
import {
  buildFreeFireRedeemServerTabs,
  normalizeRedeemServersList,
} from "../src/lib/freeFireRedeemServers.ts";
import { defaultLiveRedeemSchedule } from "../src/lib/redeemCodeSchedule.ts";

function loadDotEnv(fileName) {
  const filePath = path.join(process.cwd(), fileName);
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let val = trimmed.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadDotEnv(".env");
loadDotEnv(".env.local");

const base = process.env.E2E_BASE_URL || "http://localhost:3000";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.warn("CUSTOM_SERVER_SKIP: no DATABASE_URL");
    process.exit(0);
  }

  const customId = `vietnam-${Date.now().toString(36)}`;
  const customServer = { id: customId, label: "Vietnam Test", badge: "VN" };
  const marker = `SRV-CODE-${Date.now()}`;

  const before = await getFreeFireRedeemPageForAdmin();
  const backup = structuredClone(before.page);

  const nextServers = normalizeRedeemServersList([...before.page.servers, customServer]);
  assert(nextServers.some((s) => s.id === customId), "custom server not normalized");

  const schedule = defaultLiveRedeemSchedule();
  const testCode = {
    id: marker,
    title: marker,
    code: marker,
    status: "live",
    server: customId,
    ...schedule,
  };

  await saveFreeFireRedeemPage({
    ...before.page,
    servers: nextServers,
    codes: [testCode, ...before.page.codes.filter((c) => c.id !== marker)],
  });

  const reloaded = await getFreeFireRedeemPageForAdmin();
  assert(reloaded.page.servers.some((s) => s.id === customId), "admin reload missing custom server");
  const savedCode = reloaded.page.codes.find((c) => c.code === marker);
  assert(savedCode?.server === customId, `code server mismatch: ${savedCode?.server}`);

  const tabs = buildFreeFireRedeemServerTabs(reloaded.page.servers);
  assert(tabs.some((t) => t.id === customId), "public tabs missing custom server");

  const publicPage = await getFreeFireRedeemPage();
  assert(publicPage.servers.some((s) => s.id === customId), "public read missing custom server");

  const publicRes = await fetch(`${base}/free-fire-redeem-code`, { cache: "no-store" });
  const html = await publicRes.text();
  assert(publicRes.ok, `public HTTP ${publicRes.status}`);
  assert(html.includes("Vietnam Test") || html.includes(customId), "public HTML missing custom tab label");

  await saveFreeFireRedeemPage(backup);
  console.log("FF_REDEEM_CUSTOM_SERVER_OK");
}

main().catch((err) => {
  console.error("FF_REDEEM_CUSTOM_SERVER_FAIL:", err.message);
  process.exit(1);
});
