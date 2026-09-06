/**
 * One-shot e2e for /bgmi-redeem-code. Restores DB after.
 * Run: npx tsx scripts/e2e-bgmi-redeem-check.mjs
 */
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const BASE = process.env.E2E_BASE || "http://127.0.0.1:3000";
const LIVE = "E2EBGMI9X7Q";
const EXPIRED = "E2EBGMIOLD1";

async function load(rel) {
  try {
    return await import(pathToFileURL(resolve(rel)).href);
  } catch {
    require("tsx/cjs");
    return require(resolve(rel));
  }
}

const failures = [];
function ok(name, pass, detail = "") {
  console.log(`[${pass ? "PASS" : "FAIL"}] ${name}${detail ? ` — ${detail}` : ""}`);
  if (!pass) failures.push(name);
}

async function fetchText(path) {
  const res = await fetch(`${BASE}${path}`, { cache: "no-store" });
  const text = await res.text();
  return { status: res.status, location: res.headers.get("location"), text };
}

async function fetchHead(path) {
  const res = await fetch(`${BASE}${path}`, { method: "HEAD", redirect: "manual", cache: "no-store" });
  return { status: res.status, location: res.headers.get("location") };
}

const repo = await load("src/server/repositories/bgmiRedeemCodesRepository.ts");
const pageMod = await load("src/lib/bgmiRedeemCodes.ts");
const dbMod = await load("src/db/client.ts");
const {
  getBgmiRedeemPageForAdmin,
  saveBgmiRedeemPage,
  clearBgmiRedeemPage,
} = repo;
const { cloneBgmiRedeemPage, BGMI_REDEEM_PAGE_KEY } = pageMod;
const { prisma } = dbMod;

const before = await getBgmiRedeemPageForAdmin();
let restored = false;

async function restore() {
  if (restored) return;
  restored = true;
  if (before.usingDefault) await clearBgmiRedeemPage();
  else await saveBgmiRedeemPage(before.page);
  await prisma.pageComment.deleteMany({
    where: { message: { contains: "E2E comment for BGMI redeem" } },
  });
}

try {
  console.log("\n== 1) HTTP gates ==");
  {
    const pub = await fetchHead("/bgmi-redeem-code");
    ok("public 200 (not redirect to lite)", pub.status === 200 && !String(pub.location || "").includes("lite"));

    const lite = await fetchHead("/bgmi-lite-redeem-code");
    ok("lite redeem still 200", lite.status === 200);

    const admin = await fetchHead("/admin/bgmi-redeem");
    ok(
      "admin unauth → login",
      admin.status === 307 || admin.status === 302,
      `status=${admin.status} loc=${admin.location || ""}`,
    );

    const api = await fetchHead("/api/admin/bgmi-redeem");
    ok("admin API unauth 401", api.status === 401);
  }

  console.log("\n== 2) Save live + expired via repo (same as admin save) ==");
  {
    const page = cloneBgmiRedeemPage();
    page.codes = [
      {
        id: "e2e-live",
        title: "E2E Live Crate",
        code: LIVE,
        status: "live",
        releasedLabel: "Released: 6 Sep, 2:00 PM IST",
        expiresLabel: "Expires: 13 Sep, 11:59 PM IST",
      },
      {
        id: "e2e-expired",
        title: "E2E Expired Crate",
        code: EXPIRED,
        status: "expired",
        expiredOnLabel: "Expired on: 1 Sep, 12:00 PM IST",
      },
    ];
    const saved = await saveBgmiRedeemPage(page);
    ok("save returns live+expired", saved.page.codes.length === 2 && saved.usingDefault === false);
    ok("path locked to /bgmi-redeem-code", saved.page.path === "/bgmi-redeem-code");
  }

  console.log("\n== 3) Public HTML after save ==");
  {
    const pub = await fetchText("/bgmi-redeem-code");
    ok("public 200 after save", pub.status === 200);
    ok("title BGMI Redeem Codes", pub.text.includes("BGMI Redeem Codes"));
    ok("canonical /bgmi-redeem-code", pub.text.includes("/bgmi-redeem-code"));
    ok("live code visible", pub.text.includes(LIVE));
    ok("live title visible", pub.text.includes("E2E Live Crate"));
    ok("copy button present", pub.text.includes("Copy Code"));
    ok("expired code in archive", pub.text.includes(EXPIRED) && pub.text.includes("Expired archive"));
    ok("updated-today freshness", pub.text.includes("lite-redeem-freshness--ok"));
    ok("idle banner hidden after save", !pub.text.includes("lite-redeem-freshness--idle"));
    ok("FAQ present", pub.text.includes("How do I redeem a BGMI code?"));
    ok("comments form present", pub.text.includes("Post comment") && pub.text.includes('pageKey":"bgmi-redeem-code') || pub.text.includes("bgmi-redeem-code"));
    ok("nav Redeem Code under BGMI", pub.text.includes('href="/bgmi-redeem-code">Redeem Code'));
    ok("not lite-only copy", !pub.text.includes("BGMI Lite Redeem Codes</h1>"));
  }

  console.log("\n== 4) Isolation vs Lite ==");
  {
    const lite = await fetchText("/bgmi-lite-redeem-code");
    ok("lite still 200", lite.status === 200);
    ok("lite does not show BGMI e2e live code", !lite.text.includes(LIVE));
    ok("lite does not show BGMI e2e expired code", !lite.text.includes(EXPIRED));
  }

  console.log("\n== 5) Comments API ==");
  {
    const bad = await fetch(`${BASE}/api/page-comments?pageKey=not-a-real-page`);
    ok("unknown pageKey GET 400", bad.status === 400);

    const getOk = await fetch(`${BASE}/api/page-comments?pageKey=${BGMI_REDEEM_PAGE_KEY}`);
    const getJson = await getOk.json();
    ok("GET comments 200 + array", getOk.status === 200 && Array.isArray(getJson.data));

    const post = await fetch(`${BASE}/api/page-comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pageKey: BGMI_REDEEM_PAGE_KEY,
        name: "E2E Checker",
        message: "E2E comment for BGMI redeem — should stay pending.",
      }),
    });
    const postJson = await post.json();
    ok(
      "POST comment pending",
      post.status === 200 && postJson.ok === true && postJson.status === "pending",
      `status=${post.status} body=${JSON.stringify(postJson)}`,
    );

    const pub = await fetchText("/bgmi-redeem-code");
    ok("pending comment not on public list", !pub.text.includes("E2E comment for BGMI redeem"));
  }

  console.log("\n== 6) Reset / restore defaults ==");
  {
    await clearBgmiRedeemPage();
    const pub = await fetchText("/bgmi-redeem-code");
    ok("after reset live code gone", pub.status === 200 && !pub.text.includes(LIVE));
    ok("after reset expired code gone", !pub.text.includes(EXPIRED));
    ok("empty live message back", pub.text.includes("No live codes") || pub.text.includes("No new codes today"));
  }

  console.log("\n== 7) Sitemap ==");
  {
    const sm = await fetchText("/sitemap-pages.xml");
    ok("sitemap-pages lists /bgmi-redeem-code", sm.status === 200 && sm.text.includes("/bgmi-redeem-code"));
  }
} catch (err) {
  ok("e2e threw", false, err instanceof Error ? err.message : String(err));
} finally {
  await restore();
  console.log("\nDB restored.");
}

if (failures.length) {
  console.log(`\nFAILED (${failures.length}): ${failures.join(", ")}`);
  process.exit(1);
}
console.log("\nAll BGMI redeem e2e checks passed.");
