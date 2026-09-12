/**
 * E2E: BGMI APK pinned cards (#1–#5: Update, Errors, OBB, FPS, Ban Safety).
 * Save / update / public HTML / order. Restores DB after.
 * Run: E2E_BASE=http://127.0.0.1:3011 npx tsx scripts/e2e-bgmi-apk-pinned-cards.mjs
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

const UPDATE_ID = "latest-update-features";
const UPDATE_TITLE = "BGMI Latest Update Features & Patch Highlights";
const ERRORS_ID = "common-errors-fixes";
const ERRORS_TITLE = "Common Errors & Fixes (High-Intent Problem Solving)";
const OBB_ID = "obb-file-setup";
const OBB_TITLE = "OBB File Setup (Direct Search Intent)";
const FPS_ID = "fps-graphics-unlock";
const FPS_TITLE = "90 FPS / Graphics Unlock Guide";
const BAN_ID = "ban-prevention-safety";
const BAN_TITLE = "Ban Prevention & Account Safety Rules";
const E2E_ERRORS_SUMMARY = "E2E edited common errors summary — high intent fixes.";
const E2E_ERRORS_POINT = "E2E custom error fix point";
const E2E_UPDATE_SUMMARY = "E2E edited latest update summary.";
const E2E_OBB_SUMMARY = "E2E edited OBB setup summary — direct search intent.";
const E2E_FPS_SUMMARY = "E2E edited 90 FPS unlock guide summary.";
const E2E_BAN_SUMMARY = "E2E edited ban prevention and account safety summary.";

const PINNED_IDS = [UPDATE_ID, ERRORS_ID, OBB_ID, FPS_ID, BAN_ID];

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

function decodeHtml(s) {
  return String(s || "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .trim();
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

  console.log("\n== 1) Normalize / pinned order ==");
  {
    const def = normalizeBgmiApkPage(DEFAULT_BGMI_APK_PAGE);
    ok("#1 is Latest Update", def.cards[0]?.id === UPDATE_ID && def.cards[0]?.title === UPDATE_TITLE);
    ok("#2 is Common Errors", def.cards[1]?.id === ERRORS_ID && def.cards[1]?.title === ERRORS_TITLE);
    ok("#3 is OBB Setup", def.cards[2]?.id === OBB_ID && def.cards[2]?.title === OBB_TITLE);
    ok("#4 is FPS Unlock", def.cards[3]?.id === FPS_ID && def.cards[3]?.title === FPS_TITLE);
    ok("#5 is Ban Safety", def.cards[4]?.id === BAN_ID && def.cards[4]?.title === BAN_TITLE);
    ok("errors card has guide CTA", def.cards[1]?.ctaHref === "#bgmi-apk-guide");
    ok("obb card has guide CTA", def.cards[2]?.ctaHref === "#bgmi-apk-guide");
    ok("fps card has calculator CTA", def.cards[3]?.ctaHref === "/bgmi");
    ok("ban card has guide CTA", def.cards[4]?.ctaHref === "#bgmi-apk-guide");
    ok("errors card has 5+ fix points", (def.cards[1]?.points?.length || 0) >= 5);
    ok("obb card has 5+ setup points", (def.cards[2]?.points?.length || 0) >= 5);
    ok("fps card has 5+ guide points", (def.cards[3]?.points?.length || 0) >= 5);
    ok("ban card has 5+ safety points", (def.cards[4]?.points?.length || 0) >= 5);
    ok(
      "half-width pair after Ban: play then apk",
      def.cards[5]?.id === "play-store" && def.cards[6]?.id === "apk-button",
    );
    ok(
      "half-width pair: safe then device (no mid gap)",
      def.cards[7]?.id === "safe-download" && def.cards[8]?.id === "device",
    );

    const stripped = normalizeBgmiApkPage({
      ...DEFAULT_BGMI_APK_PAGE,
      cards: DEFAULT_BGMI_APK_PAGE.cards.filter((c) => !PINNED_IDS.includes(c.id)),
    });
    ok("missing all → prepend #1 update", stripped.cards[0]?.id === UPDATE_ID);
    ok("missing all → prepend #2 errors", stripped.cards[1]?.id === ERRORS_ID);
    ok("missing all → prepend #3 obb", stripped.cards[2]?.id === OBB_ID);
    ok("missing all → prepend #4 fps", stripped.cards[3]?.id === FPS_ID);
    ok("missing all → prepend #5 ban", stripped.cards[4]?.id === BAN_ID);
    ok(
      "prepend keeps total count",
      stripped.cards.length === DEFAULT_BGMI_APK_PAGE.cards.length,
      `count=${stripped.cards.length}`,
    );

    const onlyBanMissing = normalizeBgmiApkPage({
      ...DEFAULT_BGMI_APK_PAGE,
      cards: DEFAULT_BGMI_APK_PAGE.cards.filter((c) => c.id !== BAN_ID),
    });
    ok("only ban missing → still #5", onlyBanMissing.cards[4]?.id === BAN_ID);

    const reversed = normalizeBgmiApkPage({
      ...DEFAULT_BGMI_APK_PAGE,
      cards: [...DEFAULT_BGMI_APK_PAGE.cards].reverse(),
    });
    ok("reversed list → update still #1", reversed.cards[0]?.id === UPDATE_ID);
    ok("reversed list → errors still #2", reversed.cards[1]?.id === ERRORS_ID);
    ok("reversed list → obb still #3", reversed.cards[2]?.id === OBB_ID);
    ok("reversed list → fps still #4", reversed.cards[3]?.id === FPS_ID);
    ok("reversed list → ban still #5", reversed.cards[4]?.id === BAN_ID);
  }

  console.log("\n== 2) Save / update / reload ==");
  {
    const page = clone(DEFAULT_BGMI_APK_PAGE);
    page.cards = page.cards.filter((c) => !PINNED_IDS.includes(c.id));
    page.seoTitle = "E2E pinned cards SEO";
    const saved = await saveBgmiApkPage(page);
    ok("save prepends update #1", saved.page.cards[0]?.id === UPDATE_ID);
    ok("save prepends errors #2", saved.page.cards[1]?.id === ERRORS_ID);
    ok("save prepends obb #3", saved.page.cards[2]?.id === OBB_ID);
    ok("save prepends fps #4", saved.page.cards[3]?.id === FPS_ID);
    ok("save prepends ban #5", saved.page.cards[4]?.id === BAN_ID);

    const admin1 = await getBgmiApkPageForAdmin();
    ok(
      "admin reload #1–#5",
      admin1.page.cards[0]?.id === UPDATE_ID &&
        admin1.page.cards[1]?.id === ERRORS_ID &&
        admin1.page.cards[2]?.id === OBB_ID &&
        admin1.page.cards[3]?.id === FPS_ID &&
        admin1.page.cards[4]?.id === BAN_ID,
    );

    const edited = clone(admin1.page);
    edited.cards = edited.cards.map((c) => {
      if (c.id === UPDATE_ID) return { ...c, summary: E2E_UPDATE_SUMMARY };
      if (c.id === ERRORS_ID) {
        return {
          ...c,
          summary: E2E_ERRORS_SUMMARY,
          badge: "E2E-Fixes",
          points: [E2E_ERRORS_POINT, "E2E fix two", "E2E fix three", "E2E fix four", "E2E fix five"],
        };
      }
      if (c.id === OBB_ID) return { ...c, summary: E2E_OBB_SUMMARY };
      if (c.id === FPS_ID) return { ...c, summary: E2E_FPS_SUMMARY };
      if (c.id === BAN_ID) return { ...c, summary: E2E_BAN_SUMMARY };
      return c;
    });
    const savedEdit = await saveBgmiApkPage(edited);
    ok(
      "update keeps pinned order",
      savedEdit.page.cards[0]?.id === UPDATE_ID &&
        savedEdit.page.cards[1]?.id === ERRORS_ID &&
        savedEdit.page.cards[2]?.id === OBB_ID &&
        savedEdit.page.cards[3]?.id === FPS_ID &&
        savedEdit.page.cards[4]?.id === BAN_ID,
    );
    ok("update persists errors summary", savedEdit.page.cards[1]?.summary === E2E_ERRORS_SUMMARY);
    ok("update persists errors badge", savedEdit.page.cards[1]?.badge === "E2E-Fixes");
    ok("update persists errors point", savedEdit.page.cards[1]?.points?.[0] === E2E_ERRORS_POINT);
    ok("update persists update summary", savedEdit.page.cards[0]?.summary === E2E_UPDATE_SUMMARY);
    ok("update persists obb summary", savedEdit.page.cards[2]?.summary === E2E_OBB_SUMMARY);
    ok("update persists fps summary", savedEdit.page.cards[3]?.summary === E2E_FPS_SUMMARY);
    ok("update persists ban summary", savedEdit.page.cards[4]?.summary === E2E_BAN_SUMMARY);

    const admin2 = await getBgmiApkPageForAdmin();
    ok("admin reload edited errors", admin2.page.cards[1]?.summary === E2E_ERRORS_SUMMARY);
    ok("admin reload edited obb", admin2.page.cards[2]?.summary === E2E_OBB_SUMMARY);
    ok("admin reload edited fps", admin2.page.cards[3]?.summary === E2E_FPS_SUMMARY);
    ok("admin reload edited ban", admin2.page.cards[4]?.summary === E2E_BAN_SUMMARY);
    const pub = await getBgmiApkPage();
    ok("public get edited errors", pub.cards[1]?.summary === E2E_ERRORS_SUMMARY);
    ok("public get edited update", pub.cards[0]?.summary === E2E_UPDATE_SUMMARY);
    ok("public get edited obb", pub.cards[2]?.summary === E2E_OBB_SUMMARY);
    ok("public get edited fps", pub.cards[3]?.summary === E2E_FPS_SUMMARY);
    ok("public get edited ban", pub.cards[4]?.summary === E2E_BAN_SUMMARY);
    ok(
      "public get pinned ids",
      pub.cards[0]?.id === UPDATE_ID &&
        pub.cards[1]?.id === ERRORS_ID &&
        pub.cards[2]?.id === OBB_ID &&
        pub.cards[3]?.id === FPS_ID &&
        pub.cards[4]?.id === BAN_ID,
    );
  }

  console.log("\n== 3) Public HTML ==");
  {
    try {
      const res = await fetchText("/bgmi-apk");
      ok("GET /bgmi-apk 200", res.status === 200, `status=${res.status}`);
      if (res.status === 200) {
        const html = res.text;
        ok("no app error", !html.includes("Application error") && !html.includes("Internal Server Error"));
        ok(
          "update title on page",
          html.includes(UPDATE_TITLE) || html.includes(UPDATE_TITLE.replace(/&/g, "&amp;")),
        );
        ok(
          "errors title on page",
          html.includes(ERRORS_TITLE) || html.includes(ERRORS_TITLE.replace(/&/g, "&amp;")),
        );
        ok(
          "obb title on page",
          html.includes(OBB_TITLE) || html.includes(OBB_TITLE.replace(/&/g, "&amp;")),
        );
        ok(
          "fps title on page",
          html.includes(FPS_TITLE) || html.includes(FPS_TITLE.replace(/&/g, "&amp;")),
        );
        ok(
          "ban title on page",
          html.includes(BAN_TITLE) || html.includes(BAN_TITLE.replace(/&/g, "&amp;")),
        );
        ok("edited errors summary on page", html.includes(E2E_ERRORS_SUMMARY));
        ok("edited errors point on page", html.includes(E2E_ERRORS_POINT));
        ok("edited errors badge on page", html.includes("E2E-Fixes"));
        ok("edited update summary on page", html.includes(E2E_UPDATE_SUMMARY));
        ok("edited obb summary on page", html.includes(E2E_OBB_SUMMARY));
        ok("edited fps summary on page", html.includes(E2E_FPS_SUMMARY));
        ok("edited ban summary on page", html.includes(E2E_BAN_SUMMARY));
        ok(`heading id ${UPDATE_ID}`, html.includes(`id="bgmi-apk-card-${UPDATE_ID}"`));
        ok(`heading id ${ERRORS_ID}`, html.includes(`id="bgmi-apk-card-${ERRORS_ID}"`));
        ok(`heading id ${OBB_ID}`, html.includes(`id="bgmi-apk-card-${OBB_ID}"`));
        ok(`heading id ${FPS_ID}`, html.includes(`id="bgmi-apk-card-${FPS_ID}"`));
        ok(`heading id ${BAN_ID}`, html.includes(`id="bgmi-apk-card-${BAN_ID}"`));
        ok("guide CTA href", html.includes('href="#bgmi-apk-guide"'));

        const titles = [...html.matchAll(/class="ff-as-card-title"[^>]*>([^<]+)/g)].map((m) =>
          decodeHtml(m[1]),
        );
        ok("DOM card[0] Latest Update", titles[0] === UPDATE_TITLE, titles[0] || "none");
        ok("DOM card[1] Common Errors", titles[1] === ERRORS_TITLE, titles[1] || "none");
        ok("DOM card[2] OBB Setup", titles[2] === OBB_TITLE, titles[2] || "none");
        ok("DOM card[3] FPS Unlock", titles[3] === FPS_TITLE, titles[3] || "none");
        ok("DOM card[4] Ban Safety", titles[4] === BAN_TITLE, titles[4] || "none");
      }
    } catch (e) {
      ok("HTTP reachable", false, e.message);
    }
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
console.log("\nAll pinned-cards e2e checks passed.");
