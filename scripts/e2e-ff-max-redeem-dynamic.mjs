/**
 * E2E: FF Max redeem — dynamic servers + schedule (same CMS as FF, separate DB).
 * Run: npx tsx scripts/e2e-ff-max-redeem-dynamic.mjs
 */
import fs from "fs";
import path from "path";
import {
  getFreeFireMaxRedeemPage,
  getFreeFireMaxRedeemPageForAdmin,
  saveFreeFireMaxRedeemPage,
} from "../src/server/repositories/freeFireMaxRedeemCodesRepository.ts";
import {
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
    console.warn("FF_MAX_DYNAMIC_SKIP: no DATABASE_URL");
    process.exit(0);
  }

  const serverId = `max-region-${Date.now().toString(36)}`;
  const marker = `MAX-DYN-${Date.now()}`;
  const schedule = defaultLiveRedeemSchedule();

  const maxBefore = await getFreeFireMaxRedeemPageForAdmin();
  const ffBefore = await getFreeFireRedeemPageForAdmin();
  const maxBackup = structuredClone(maxBefore.page);
  const ffBackup = structuredClone(ffBefore.page);

  const maxServers = normalizeRedeemServersList([
    ...maxBefore.page.servers,
    { id: serverId, label: "Max Vietnam", badge: "MVN" },
  ]);

  await saveFreeFireMaxRedeemPage({
    ...maxBefore.page,
    servers: maxServers,
    codes: [
      {
        id: marker,
        title: marker,
        code: marker,
        status: "live",
        server: serverId,
        ...schedule,
      },
      ...maxBefore.page.codes.filter((c) => c.id !== marker),
    ],
  });

  const maxReload = await getFreeFireMaxRedeemPageForAdmin();
  const ffReload = await getFreeFireRedeemPageForAdmin();
  const maxCode = maxReload.page.codes.find((c) => c.code === marker);
  const ffLeak = ffReload.page.codes.find((c) => c.code === marker);

  assert(maxReload.page.servers.some((s) => s.id === serverId), "Max admin missing custom server");
  assert(maxCode?.server === serverId, "Max code server wrong");
  assert(maxCode?.releasedAt && maxCode?.releasedLabel?.includes("Released:"), "Max schedule ISO/label missing");
  assert(!ffLeak, "Max code leaked into FF CMS");

  const tabs = buildFreeFireRedeemServerTabs(maxReload.page.servers);
  assert(tabs.some((t) => t.id === serverId), "Max tabs missing custom server");

  const publicMax = await getFreeFireMaxRedeemPage();
  assert(publicMax.servers.some((s) => s.id === serverId), "Max public read missing server");

  const [maxHtml, ffHtml] = await Promise.all([
    fetch(`${base}/free-fire-max-redeem-code`, { cache: "no-store" }).then((r) => r.text()),
    fetch(`${base}/free-fire-redeem-code`, { cache: "no-store" }).then((r) => r.text()),
  ]);
  assert(maxHtml.includes("Max Vietnam") || maxHtml.includes(serverId), "Max public HTML missing tab");
  assert(!ffHtml.includes(marker), "Max test code leaked to FF public page");

  await saveFreeFireMaxRedeemPage(maxBackup);
  await saveFreeFireRedeemPage(ffBackup);
  console.log("FF_MAX_REDEEM_DYNAMIC_OK");
}

main().catch((err) => {
  console.error("FF_MAX_REDEEM_DYNAMIC_FAIL:", err.message);
  process.exit(1);
});
