/**
 * E2E: Free Fire vs Free Fire Max redeem CMS are fully separate.
 * Run: npx tsx scripts/e2e-ff-vs-max-redeem-isolation.mjs
 */
import fs from "fs";
import path from "path";
import {
  getFreeFireRedeemPage,
  getFreeFireRedeemPageForAdmin,
  saveFreeFireRedeemPage,
} from "../src/server/repositories/freeFireRedeemCodesRepository.ts";
import {
  getFreeFireMaxRedeemPage,
  getFreeFireMaxRedeemPageForAdmin,
  saveFreeFireMaxRedeemPage,
} from "../src/server/repositories/freeFireMaxRedeemCodesRepository.ts";
import { defaultLiveRedeemSchedule } from "../src/lib/redeemCodeSchedule.ts";
import { FREE_FIRE_MAX_REDEEM_SETTINGS_KEY } from "../src/lib/freeFireMaxRedeemCodes.ts";
import { FREE_FIRE_REDEEM_CODE_PATH } from "../src/lib/freeFireRedeemCodes.ts";
import { FREE_FIRE_MAX_REDEEM_CODE_PATH } from "../src/lib/freeFireMaxRedeemCodes.ts";

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
const email = (process.env.ADMIN_EMAIL || "admin@example.com").trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || "1234";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function testStaticIsolation() {
  assert(
    FREE_FIRE_REDEEM_CODE_PATH === "/free-fire-redeem-code",
    "unexpected FF public path",
  );
  assert(
    FREE_FIRE_MAX_REDEEM_CODE_PATH === "/free-fire-max-redeem-code",
    "unexpected FF Max public path",
  );
  assert(FREE_FIRE_MAX_REDEEM_SETTINGS_KEY === "settings:freeFireMaxRedeemCodes", "max key");
  assert(
    FREE_FIRE_MAX_REDEEM_SETTINGS_KEY !== "settings:freeFireRedeemCodes",
    "FF and Max must use different DB keys",
  );
  console.log("STATIC_ISOLATION_OK");
}

async function loginCookie() {
  const res = await fetch(`${base}/api/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) return null;
  const setCookie = res.headers.getSetCookie?.() ?? [];
  const cookie = setCookie.map((c) => c.split(";")[0]).join("; ");
  return cookie || null;
}

async function testAdminApiIsolation(cookie) {
  const ffMarker = `FF-ONLY-${Date.now()}`;
  const maxMarker = `MAX-ONLY-${Date.now()}`;
  const schedule = defaultLiveRedeemSchedule();

  async function getPage(apiPath) {
    const res = await fetch(`${base}${apiPath}`, { headers: { cookie }, cache: "no-store" });
    assert(res.ok, `GET ${apiPath} failed HTTP ${res.status}`);
    const json = await res.json();
    return json?.data?.page;
  }

  async function savePage(apiPath, page) {
    const res = await fetch(`${base}${apiPath}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({ action: "save", page }),
    });
    assert(res.ok, `POST ${apiPath} failed HTTP ${res.status}: ${await res.text()}`);
    return res.json();
  }

  const ffPage = await getPage("/api/admin/free-fire-redeem");
  const maxPage = await getPage("/api/admin/free-fire-max-redeem");
  assert(ffPage && maxPage, "missing admin pages");

  const ffBackupCodes = [...ffPage.codes];
  const maxBackupCodes = [...maxPage.codes];

  const ffCode = {
    id: ffMarker,
    title: `FF isolate ${ffMarker}`,
    code: ffMarker,
    status: "live",
    server: "global",
    ...schedule,
  };
  const maxCode = {
    id: maxMarker,
    title: `Max isolate ${maxMarker}`,
    code: maxMarker,
    status: "live",
    server: "global",
    ...schedule,
  };

  await savePage("/api/admin/free-fire-redeem", {
    ...ffPage,
    codes: [ffCode, ...ffPage.codes.filter((c) => c.id !== ffMarker)],
  });
  await savePage("/api/admin/free-fire-max-redeem", {
    ...maxPage,
    codes: [maxCode, ...maxPage.codes.filter((c) => c.id !== maxMarker)],
  });

  const ffReload = await getPage("/api/admin/free-fire-redeem");
  const maxReload = await getPage("/api/admin/free-fire-max-redeem");
  assert(ffReload.codes.some((c) => c.code === ffMarker), "FF marker missing on FF admin");
  assert(!maxReload.codes.some((c) => c.code === ffMarker), "FF marker leaked to Max admin");
  assert(maxReload.codes.some((c) => c.code === maxMarker), "Max marker missing on Max admin");
  assert(!ffReload.codes.some((c) => c.code === maxMarker), "Max marker leaked to FF admin");

  const [ffPublic, maxPublic] = await Promise.all([
    fetch(`${base}/free-fire-redeem-code`, { cache: "no-store" }).then((r) => r.text()),
    fetch(`${base}/free-fire-max-redeem-code`, { cache: "no-store" }).then((r) => r.text()),
  ]);
  assert(ffPublic.includes(ffMarker), "FF marker missing on FF public page");
  assert(!maxPublic.includes(ffMarker), "FF marker leaked to Max public page");
  assert(maxPublic.includes(maxMarker), "Max marker missing on Max public page");
  assert(!ffPublic.includes(maxMarker), "Max marker leaked to FF public page");

  // cleanup restore
  await savePage("/api/admin/free-fire-redeem", { ...ffPage, codes: ffBackupCodes });
  await savePage("/api/admin/free-fire-max-redeem", { ...maxPage, codes: maxBackupCodes });

  console.log("ADMIN_API_ISOLATION_OK");
}

async function testRepositoryIsolation() {
  if (!process.env.DATABASE_URL) {
    console.warn("REPO_ISOLATION_SKIP: no DATABASE_URL");
    return;
  }

  const ffMarker = `REPO-FF-${Date.now()}`;
  const maxMarker = `REPO-MAX-${Date.now()}`;
  const schedule = defaultLiveRedeemSchedule();

  const ffBefore = await getFreeFireRedeemPageForAdmin();
  const maxBefore = await getFreeFireMaxRedeemPageForAdmin();

  const ffCode = {
    id: ffMarker,
    title: ffMarker,
    code: ffMarker,
    status: "live",
    server: "global",
    ...schedule,
  };
  const maxCode = {
    id: maxMarker,
    title: maxMarker,
    code: maxMarker,
    status: "live",
    server: "global",
    ...schedule,
  };

  await saveFreeFireRedeemPage({
    ...ffBefore.page,
    codes: [ffCode, ...ffBefore.page.codes.filter((c) => c.id !== ffMarker)],
  });
  await saveFreeFireMaxRedeemPage({
    ...maxBefore.page,
    codes: [maxCode, ...maxBefore.page.codes.filter((c) => c.id !== maxMarker)],
  });

  const ffPublic = await getFreeFireRedeemPage();
  const maxPublic = await getFreeFireMaxRedeemPage();
  assert(ffPublic.codes.some((c) => c.code === ffMarker), "repo: FF code not on FF public read");
  assert(!maxPublic.codes.some((c) => c.code === ffMarker), "repo: FF code leaked to Max public read");
  assert(maxPublic.codes.some((c) => c.code === maxMarker), "repo: Max code not on Max public read");
  assert(!ffPublic.codes.some((c) => c.code === maxMarker), "repo: Max code leaked to FF public read");

  await saveFreeFireRedeemPage({ ...ffBefore.page, codes: ffBefore.page.codes });
  await saveFreeFireMaxRedeemPage({ ...maxBefore.page, codes: maxBefore.page.codes });

  console.log("REPO_ISOLATION_OK");
}

async function main() {
  testStaticIsolation();

  const cookie = await loginCookie();
  if (cookie) {
    await testAdminApiIsolation(cookie);
  } else {
    console.warn("ADMIN_API_ISOLATION_SKIP: login failed");
  }

  await testRepositoryIsolation();

  if (cookie && process.env.DATABASE_URL) {
    console.log("FF_VS_MAX_REDEEM_ALL_OK");
  } else if (process.env.DATABASE_URL) {
    console.log("FF_VS_MAX_REDEEM_REPO_OK");
  } else if (cookie) {
    console.log("FF_VS_MAX_REDEEM_API_OK");
  } else {
    console.log("FF_VS_MAX_REDEEM_STATIC_OK");
  }
}

main().catch((err) => {
  console.error("FF_VS_MAX_REDEEM_FAIL:", err.message);
  process.exit(1);
});
