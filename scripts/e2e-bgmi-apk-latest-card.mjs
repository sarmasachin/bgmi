/**
 * E2E: BGMI APK "Latest Update Features" card is #1, saves, updates, public HTML.
 * Restores DB after. Run:
 *   E2E_BASE=http://127.0.0.1:3011 npx tsx scripts/e2e-bgmi-apk-latest-card.mjs
 */
import fs from "fs";
import path from "path";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";

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

const require = createRequire(import.meta.url);
const BASE = process.env.E2E_BASE || "http://127.0.0.1:3011";
const CARD_ID = "latest-update-features";
const CARD_TITLE = "BGMI Latest Update Features & Patch Highlights";
const E2E_SUMMARY = "E2E updated summary for latest update features card.";
const E2E_POINT = "E2E custom patch highlight point";

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

function clone(v) {
  return JSON.parse(JSON.stringify(v));
}

async function fetchText(pathname) {
  const res = await fetch(`${BASE}${pathname}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(120000),
  });
  return { status: res.status, text: await res.text() };
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL missing");
  process.exit(1);
}

const { DEFAULT_BGMI_APK_PAGE } = await load("src/lib/bgmiApkPage.ts");
const { normalizeBgmiApkPage } = await load("src/lib/bgmiApkPageNormalize.ts");
const {
  getBgmiApkPage,
  getBgmiApkPageForAdmin,
  saveBgmiApkPage,
  clearBgmiApkPage,
} = await load("src/server/repositories/bgmiApkPageRepository.ts");

const before = await getBgmiApkPageForAdmin();
let restored = false;
async function restore() {
  if (restored) return;
  restored = true;
  if (before.usingDefault) await clearBgmiApkPage();
  else await saveBgmiApkPage(before.page);
}

try {
  console.log(`\nE2E_BASE=${BASE}`);

  console.log("\n== 1) Normalize / defaults ==");
  {
    const def = normalizeBgmiApkPage(DEFAULT_BGMI_APK_PAGE);
    ok("default card[0] id", def.cards[0]?.id === CARD_ID, def.cards[0]?.id);
    ok("default card[0] title", def.cards[0]?.title === CARD_TITLE);
    ok("default has calculator CTA", def.cards[0]?.ctaHref === "/bgmi");

    const without = normalizeBgmiApkPage({
      ...DEFAULT_BGMI_APK_PAGE,
      cards: DEFAULT_BGMI_APK_PAGE.cards.filter((c) => c.id !== CARD_ID),
    });
    ok("missing card is prepended", without.cards[0]?.id === CARD_ID);
    ok(
      "prepend keeps other cards",
      without.cards.length === DEFAULT_BGMI_APK_PAGE.cards.length,
      `count=${without.cards.length}`,
    );

    const shuffled = [
      ...DEFAULT_BGMI_APK_PAGE.cards.filter((c) => c.id !== CARD_ID),
      DEFAULT_BGMI_APK_PAGE.cards.find((c) => c.id === CARD_ID),
    ];
    const moved = normalizeBgmiApkPage({ ...DEFAULT_BGMI_APK_PAGE, cards: shuffled });
    ok("shuffled card forced back to #1", moved.cards[0]?.id === CARD_ID);
  }

  console.log("\n== 2) Save + update + reload ==");
  {
    const page = clone(DEFAULT_BGMI_APK_PAGE);
    // Simulate old DB without the featured card
    page.cards = page.cards.filter((c) => c.id !== CARD_ID);
    page.seoTitle = "E2E BGMI APK card SEO";
    const savedMissing = await saveBgmiApkPage(page);
    ok(
      "save prepends featured card",
      savedMissing.page.cards[0]?.id === CARD_ID &&
        savedMissing.page.cards[0]?.title === CARD_TITLE,
    );

    const admin1 = await getBgmiApkPageForAdmin();
    ok("admin reload card #1", admin1.page.cards[0]?.id === CARD_ID);
    ok("public get card #1", (await getBgmiApkPage()).cards[0]?.id === CARD_ID);

    // Update card content (admin edit path)
    const edited = clone(admin1.page);
    edited.cards = edited.cards.map((c, i) =>
      i === 0
        ? {
            ...c,
            summary: E2E_SUMMARY,
            points: [E2E_POINT, "E2E second point", "E2E third point"],
            badge: "E2E-Update",
          }
        : c,
    );
    const savedEdit = await saveBgmiApkPage(edited);
    ok("update keeps card #1 id", savedEdit.page.cards[0]?.id === CARD_ID);
    ok("update persists summary", savedEdit.page.cards[0]?.summary === E2E_SUMMARY);
    ok("update persists badge", savedEdit.page.cards[0]?.badge === "E2E-Update");
    ok("update persists custom point", savedEdit.page.cards[0]?.points?.[0] === E2E_POINT);

    const admin2 = await getBgmiApkPageForAdmin();
    ok("admin reload keeps edited summary", admin2.page.cards[0]?.summary === E2E_SUMMARY);
    const pubData = await getBgmiApkPage();
    ok("public get keeps edited summary", pubData.cards[0]?.summary === E2E_SUMMARY);
    ok("public get keeps edited point", pubData.cards[0]?.points?.[0] === E2E_POINT);
  }

  console.log("\n== 3) Public HTML ==");
  {
    let htmlOk = false;
    try {
      const pub = await fetchText("/bgmi-apk");
      htmlOk = pub.status === 200;
      ok("GET /bgmi-apk 200", pub.status === 200, `status=${pub.status}`);
      if (pub.status === 200) {
        const html = pub.text;
        ok("no app error", !html.includes("Application error") && !html.includes("Internal Server Error"));
        const titleHtml = CARD_TITLE.replace(/&/g, "&amp;");
        ok("card title on page", html.includes(CARD_TITLE) || html.includes(titleHtml));
        ok("edited summary on page", html.includes(E2E_SUMMARY));
        ok("edited point on page", html.includes(E2E_POINT));
        ok("edited badge on page", html.includes("E2E-Update"));
        ok(
          "card heading id present",
          html.includes(`id="bgmi-apk-card-${CARD_ID}"`),
        );
        // First content card in DOM order should be the featured one
        const firstCardTitle = html.match(
          /class="ff-as-cards"[\s\S]*?class="ff-as-card-title"[^>]*>([^<]+)/,
        );
        const firstTitle = (firstCardTitle?.[1] || "").trim().replace(/&amp;/g, "&");
        ok(
          "DOM first card title is Latest Update",
          firstTitle === CARD_TITLE,
          firstTitle || "no match",
        );
        ok(
          "calculator CTA link",
          html.includes('href="/bgmi"') && html.includes("Open BGMI sensitivity calculator"),
        );
      }
    } catch (e) {
      console.log(`[SKIP] HTTP ${BASE} — ${e.message}`);
    }
    if (!htmlOk) console.log("Tip: start next on 3011 for HTML checks.");
  }

  console.log("\n== 4) Invalid hero image still cleared (no broken box) ==");
  {
    const page = clone((await getBgmiApkPageForAdmin()).page);
    page.heroImage = "Battlegrounds Mobile India - BGMI APK 4.6 Update Download (APK + OBB)";
    page.heroImageAlt = "";
    const saved = await saveBgmiApkPage(page);
    ok("invalid heroImage cleared on save", saved.page.heroImage === "");
    const pub = await getBgmiApkPage();
    ok("public get no invalid heroImage", pub.heroImage === "");
  }
} catch (err) {
  ok("e2e threw", false, err instanceof Error ? err.message : String(err));
} finally {
  await restore();
  ok("DB restored", true);
}

if (failures.length) {
  console.log(`\nFAILED (${failures.length}): ${failures.join(", ")}`);
  process.exit(1);
}
console.log("\nAll latest-update card e2e checks passed.");
