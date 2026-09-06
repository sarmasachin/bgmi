/**
 * One-shot e2e for /pubg-redeem-code. Restores DB after.
 * Run: npx tsx scripts/e2e-pubg-redeem-check.mjs
 */
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const BASE = process.env.E2E_BASE || "http://127.0.0.1:3000";
const LIVE = "E2EPUBG9X7Q";
const EXPIRED = "E2EPUBGOLD1";

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

const repo = await load("src/server/repositories/pubgRedeemCodesRepository.ts");
const pageMod = await load("src/lib/pubgRedeemCodes.ts");
const dbMod = await load("src/db/client.ts");
const {
  getPubgRedeemPageForAdmin,
  savePubgRedeemPage,
  clearPubgRedeemPage,
} = repo;
const { clonePubgRedeemPage, PUBG_REDEEM_PAGE_KEY } = pageMod;
const { prisma } = dbMod;

const before = await getPubgRedeemPageForAdmin();
let restored = false;

async function restore() {
  if (restored) return;
  restored = true;
  if (before.usingDefault) await clearPubgRedeemPage();
  else await savePubgRedeemPage(before.page);
  await prisma.pageComment.deleteMany({
    where: { message: { contains: "E2E comment for PUBG redeem" } },
  });
}

try {
  console.log("\n== 0) Keys + empty public HTML ==");
  {
    ok("pageKey is pubg-redeem-code", PUBG_REDEEM_PAGE_KEY === "pubg-redeem-code");
    const idle = await fetchText("/pubg-redeem-code");
    ok("empty public 200", idle.status === 200);
    ok("h1 PUBG Mobile Redeem Codes", idle.text.includes(">PUBG Mobile Redeem Codes<") || idle.text.includes("PUBG Mobile Redeem Codes"));
    ok("idle freshness banner", idle.text.includes("lite-redeem-freshness--idle") && idle.text.includes("No new codes today"));
    ok("empty live copy", idle.text.includes("No live codes"));
    ok("no expired archive yet", !idle.text.includes("Expired archive"));
    ok("FAQ JSON-LD", idle.text.includes('"@type":"FAQPage"'));
    ok("WebPage JSON-LD", idle.text.includes('"@type":"WebPage"'));
    ok("Breadcrumb JSON-LD", idle.text.includes('"@type":"BreadcrumbList"'));
    ok("canonical link", idle.text.includes('rel="canonical"') && idle.text.includes("/pubg-redeem-code"));
    ok("og:title present", idle.text.includes("og:title"));
    ok("guide id", idle.text.includes('id="pubg-redeem-guide"'));
    ok("breadcrumb PUBG Mobile", idle.text.includes(">PUBG Mobile<") || idle.text.includes("PUBG Mobile"));
    ok("comments pageKey", idle.text.includes("pubg-redeem-code"));
    ok("not Lite h1", !idle.text.includes("PUBG Mobile Lite Redeem Codes</h1>"));
    ok("no ItemList when empty", !idle.text.includes('"@type":"ItemList"'));
  }

  console.log("\n== 1) HTTP gates ==");
  {
    const pub = await fetchHead("/pubg-redeem-code");
    ok("public 200 (not redirect to lite)", pub.status === 200 && !String(pub.location || "").includes("lite"));

    const lite = await fetchHead("/pubg-mobile-lite-redeem-code");
    ok("lite redeem still 200", lite.status === 200);

    const admin = await fetchHead("/admin/pubg-redeem");
    ok(
      "admin unauth → login",
      admin.status === 307 || admin.status === 302,
      `status=${admin.status} loc=${admin.location || ""}`,
    );

    const apiHead = await fetchHead("/api/admin/pubg-redeem");
    ok("admin API HEAD unauth 401", apiHead.status === 401);

    const apiGet = await fetch(`${BASE}/api/admin/pubg-redeem`, { cache: "no-store" });
    ok("admin API GET unauth 401", apiGet.status === 401);

    const apiPost = await fetch(`${BASE}/api/admin/pubg-redeem`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "save", page: {} }),
    });
    ok(
      "admin API POST unauth blocked",
      apiPost.status === 401 || apiPost.status === 403,
      `status=${apiPost.status}`,
    );
  }

  console.log("\n== 2) Save live + expired via repo (same as admin save) ==");
  {
    const page = clonePubgRedeemPage();
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
    page.path = "/hacked-pubg-redeem";
    const saved = await savePubgRedeemPage(page);
    ok("save returns live+expired", saved.page.codes.length === 2 && saved.usingDefault === false);
    ok("path locked to /pubg-redeem-code", saved.page.path === "/pubg-redeem-code");
    ok("evil path ignored", saved.page.path !== "/hacked-pubg-redeem");
  }

  console.log("\n== 3) Public HTML after save ==");
  {
    const pub = await fetchText("/pubg-redeem-code");
    ok("public 200 after save", pub.status === 200);
    ok("title PUBG Mobile Redeem Codes", pub.text.includes("PUBG Mobile Redeem Codes"));
    ok("canonical /pubg-redeem-code", pub.text.includes("/pubg-redeem-code"));
    ok("live code visible", pub.text.includes(LIVE));
    ok("live title visible", pub.text.includes("E2E Live Crate"));
    ok("copy button present", pub.text.includes("Copy Code"));
    ok("expired code in archive", pub.text.includes(EXPIRED) && pub.text.includes("Expired archive"));
    ok("updated-today freshness", pub.text.includes("lite-redeem-freshness--ok"));
    ok("idle banner hidden after save", !pub.text.includes("lite-redeem-freshness--idle"));
    ok("FAQ present", pub.text.includes("How do I redeem a PUBG Mobile code?"));
    ok(
      "comments form present",
      pub.text.includes("Post comment") &&
        (pub.text.includes('pageKey":"pubg-redeem-code') || pub.text.includes("pubg-redeem-code")),
    );
    ok(
      "nav Redeem Code under PUBG Mobile",
      pub.text.includes('href="/pubg-redeem-code"') && pub.text.includes("Redeem Code"),
    );
    ok("not lite-only copy", !pub.text.includes("PUBG Mobile Lite Redeem Codes</h1>"));
    ok("ItemList JSON-LD after live save", pub.text.includes('"@type":"ItemList"') && pub.text.includes("E2E Live Crate"));
    ok("guide still present", pub.text.includes('id="pubg-redeem-guide"'));
  }

  console.log("\n== 4) Isolation vs Lite / BGMI / sensitivity codes ==");
  {
    const lite = await fetchText("/pubg-mobile-lite-redeem-code");
    ok("lite still 200", lite.status === 200);
    ok("lite does not show PUBG e2e live code", !lite.text.includes(LIVE));
    ok("lite does not show PUBG e2e expired code", !lite.text.includes(EXPIRED));

    const bgmi = await fetchText("/bgmi-redeem-code");
    ok("bgmi redeem still 200", bgmi.status === 200);
    ok("bgmi does not show PUBG e2e live code", !bgmi.text.includes(LIVE));

    const codes = await fetchText("/pubg-mobile-codes");
    ok("sensitivity codes still 200", codes.status === 200);
    ok("sensitivity codes page not showing e2e redeem", !codes.text.includes(LIVE));

    const apk = await fetchText("/pubg-apk");
    ok("pubg apk still 200", apk.status === 200);
    ok("pubg apk not showing e2e redeem", !apk.text.includes(LIVE));
  }

  console.log("\n== 5) Comments API ==");
  {
    const bad = await fetch(`${BASE}/api/page-comments?pageKey=not-a-real-page`);
    ok("unknown pageKey GET 400", bad.status === 400);

    const badPost = await fetch(`${BASE}/api/page-comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pageKey: "not-a-real-page",
        name: "E2E Checker",
        message: "Should not accept this pageKey.",
      }),
    });
    ok(
      "unknown pageKey POST rejected",
      badPost.status === 400 || badPost.status === 404,
      `status=${badPost.status}`,
    );

    const getOk = await fetch(`${BASE}/api/page-comments?pageKey=${PUBG_REDEEM_PAGE_KEY}`);
    const getJson = await getOk.json();
    ok("GET comments 200 + array", getOk.status === 200 && Array.isArray(getJson.data));

    const post = await fetch(`${BASE}/api/page-comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pageKey: PUBG_REDEEM_PAGE_KEY,
        name: "E2E Checker",
        message: "E2E comment for PUBG redeem — should stay pending.",
      }),
    });
    const postJson = await post.json();
    ok(
      "POST comment pending",
      post.status === 200 && postJson.ok === true && postJson.status === "pending",
      `status=${post.status} body=${JSON.stringify(postJson)}`,
    );

    const pub = await fetchText("/pubg-redeem-code");
    ok("pending comment not on public list", !pub.text.includes("E2E comment for PUBG redeem"));
  }

  console.log("\n== 6) Reset / restore defaults ==");
  {
    await clearPubgRedeemPage();
    const pub = await fetchText("/pubg-redeem-code");
    ok("after reset live code gone", pub.status === 200 && !pub.text.includes(LIVE));
    ok("after reset expired code gone", !pub.text.includes(EXPIRED));
    ok("empty live message back", pub.text.includes("No live codes") || pub.text.includes("No new codes today"));
  }

  console.log("\n== 7) Sitemap + robots ==");
  {
    const sm = await fetchText("/sitemap-pages.xml");
    ok("sitemap-pages lists /pubg-redeem-code", sm.status === 200 && sm.text.includes("/pubg-redeem-code"));
    ok("sitemap still lists /bgmi-redeem-code", sm.text.includes("/bgmi-redeem-code"));
    ok("sitemap still lists /pubg-apk", sm.text.includes("/pubg-apk"));
    const idx = await fetchText("/sitemap.xml");
    ok("sitemap index points to pages", idx.status === 200 && idx.text.includes("/sitemap-pages.xml"));
    const robots = await fetchText("/robots.txt");
    ok("robots does not disallow /pubg-redeem-code", !robots.text.includes("Disallow: /pubg-redeem-code"));
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
console.log("\nAll PUBG redeem e2e checks passed.");
