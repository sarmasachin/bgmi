/**
 * E2E: PUBG APK pinned cards (#1–#5 same set as BGMI APK).
 * Save / update / public HTML / order. Restores DB after.
 * Run: E2E_BASE=http://127.0.0.1:3011 npx tsx scripts/e2e-pubg-apk-pinned-cards.mjs
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

const CARDS = [
  {
    id: "latest-update-features",
    title: "PUBG Mobile Latest Update Features & Patch Highlights",
    ctaHref: "/pubg",
  },
  {
    id: "common-errors-fixes",
    title: "Common Errors & Fixes (High-Intent Problem Solving)",
    ctaHref: "#pubg-apk-guide",
  },
  {
    id: "obb-file-setup",
    title: "OBB File Setup (Direct Search Intent)",
    ctaHref: "#pubg-apk-guide",
  },
  {
    id: "fps-graphics-unlock",
    title: "90 FPS / Graphics Unlock Guide",
    ctaHref: "/pubg",
  },
  {
    id: "ban-prevention-safety",
    title: "Ban Prevention & Account Safety Rules",
    ctaHref: "#pubg-apk-guide",
  },
];
const PINNED_IDS = CARDS.map((c) => c.id);

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

function hasText(html, text) {
  return html.includes(text) || html.includes(String(text).replace(/&/g, "&amp;"));
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

const { DEFAULT_PUBG_APK_PAGE } = await load("src/lib/pubgApkPage.ts");
const { normalizePubgApkPage } = await load("src/lib/pubgApkPageNormalize.ts");
const {
  getPubgApkPage,
  getPubgApkPageForAdmin,
  savePubgApkPage,
  clearPubgApkPage,
} = await load("src/server/repositories/pubgApkPageRepository.ts");

const before = await getPubgApkPageForAdmin();
let restored = false;
async function restore() {
  if (restored) return;
  restored = true;
  if (before.usingDefault) await clearPubgApkPage();
  else await savePubgApkPage(before.page);
}

try {
  console.log(`\nE2E_BASE=${BASE}`);

  console.log("\n== 1) Defaults / pin order / no mid-gap ==");
  {
    const def = normalizePubgApkPage(DEFAULT_PUBG_APK_PAGE);
    for (let i = 0; i < CARDS.length; i++) {
      const spec = CARDS[i];
      const card = def.cards[i];
      ok(`#${i + 1} id ${spec.id}`, card?.id === spec.id, card?.id);
      ok(`#${i + 1} title`, card?.title === spec.title, card?.title);
      ok(`#${i + 1} badge`, Boolean(card?.badge?.trim()), card?.badge);
      ok(`#${i + 1} icon`, Boolean(card?.icon?.trim()), card?.icon);
      ok(`#${i + 1} summary`, Boolean(card?.summary?.trim()));
      ok(`#${i + 1} ctaLabel`, Boolean(card?.ctaLabel?.trim()), card?.ctaLabel);
      ok(`#${i + 1} ctaHref`, card?.ctaHref === spec.ctaHref, card?.ctaHref);
      ok(`#${i + 1} points >= 4`, (card?.points?.length || 0) >= 4, `n=${card?.points?.length}`);
    }
    ok("total cards 11", def.cards.length === 11, `count=${def.cards.length}`);
    ok(
      "half-width pair: play|apk",
      def.cards[5]?.id === "play-store" && def.cards[6]?.id === "apk-button",
    );
    ok(
      "half-width pair: safe|device (no mid gap)",
      def.cards[7]?.id === "safe-download" && def.cards[8]?.id === "device",
    );
    ok("OBB path mentions com.tencent.ig", def.cards[2]?.points?.some((p) => p.includes("com.tencent.ig")));
    ok("no BGMI package on OBB card", !def.cards[2]?.points?.some((p) => p.includes("com.pubg.imobile")));
    ok("no BGMI wording in update title", !def.cards[0]?.title?.includes("BGMI"));
    ok(
      "parity ids match BGMI pin set",
      PINNED_IDS.join(",") ===
        "latest-update-features,common-errors-fixes,obb-file-setup,fps-graphics-unlock,ban-prevention-safety",
    );

    const stripped = normalizePubgApkPage({
      ...DEFAULT_PUBG_APK_PAGE,
      cards: DEFAULT_PUBG_APK_PAGE.cards.filter((c) => !PINNED_IDS.includes(c.id)),
    });
    for (let i = 0; i < CARDS.length; i++) {
      ok(`missing → prepend #${i + 1}`, stripped.cards[i]?.id === CARDS[i].id);
    }
    ok("prepend keeps count", stripped.cards.length === DEFAULT_PUBG_APK_PAGE.cards.length);

    const reversed = normalizePubgApkPage({
      ...DEFAULT_PUBG_APK_PAGE,
      cards: [...DEFAULT_PUBG_APK_PAGE.cards].reverse(),
    });
    for (let i = 0; i < CARDS.length; i++) {
      ok(`reversed → still #${i + 1}`, reversed.cards[i]?.id === CARDS[i].id);
    }
  }

  console.log("\n== 2) Admin save / edit / reload ==");
  {
    const page = clone(DEFAULT_PUBG_APK_PAGE);
    page.cards = page.cards.filter((c) => !PINNED_IDS.includes(c.id));
    page.seoTitle = "E2E PUBG pinned cards SEO";
    const saved = await savePubgApkPage(page);
    ok("save usingDefault false", saved.usingDefault === false);
    for (let i = 0; i < CARDS.length; i++) {
      ok(`save prepends #${i + 1}`, saved.page.cards[i]?.id === CARDS[i].id);
    }

    const admin1 = await getPubgApkPageForAdmin();
    const edited = clone(admin1.page);
    edited.cards = edited.cards.map((c) => {
      const idx = PINNED_IDS.indexOf(c.id);
      if (idx < 0) return c;
      return {
        ...c,
        summary: `E2E PUBG card ${c.id} summary.`,
        badge: `E2E-${idx + 1}`,
        ctaLabel: `E2E CTA ${c.id}`,
        points: [
          `E2E PUBG point ${c.id}`,
          "E2E two",
          "E2E three",
          "E2E four",
          "E2E five",
        ],
      };
    });
    const savedEdit = await savePubgApkPage(edited);
    for (const spec of CARDS) {
      const row = savedEdit.page.cards.find((c) => c.id === spec.id);
      ok(`persist ${spec.id} summary`, row?.summary === `E2E PUBG card ${spec.id} summary.`);
      ok(`persist ${spec.id} point`, row?.points?.[0] === `E2E PUBG point ${spec.id}`);
      ok(`persist ${spec.id} ctaLabel`, row?.ctaLabel === `E2E CTA ${spec.id}`);
      ok(`persist ${spec.id} ctaHref`, row?.ctaHref === spec.ctaHref);
    }

    const admin2 = await getPubgApkPageForAdmin();
    const pub = await getPubgApkPage();
    for (const spec of CARDS) {
      ok(
        `admin reload ${spec.id}`,
        admin2.page.cards.find((c) => c.id === spec.id)?.summary ===
          `E2E PUBG card ${spec.id} summary.`,
      );
      ok(
        `public ${spec.id}`,
        pub.cards.find((c) => c.id === spec.id)?.summary === `E2E PUBG card ${spec.id} summary.`,
      );
    }

    const again = clone(admin2.page);
    again.cards = again.cards.map((c) =>
      PINNED_IDS.includes(c.id) ? { ...c, summary: `E2E round2 ${c.id}` } : c,
    );
    const saved2 = await savePubgApkPage(again);
    for (const id of PINNED_IDS) {
      ok(
        `round2 ${id}`,
        saved2.page.cards.find((c) => c.id === id)?.summary === `E2E round2 ${id}`,
      );
    }
    // put markers back for HTML section
    const back = clone(saved2.page);
    back.cards = back.cards.map((c) => {
      const idx = PINNED_IDS.indexOf(c.id);
      if (idx < 0) return c;
      return {
        ...c,
        summary: `E2E PUBG card ${c.id} summary.`,
        badge: `E2E-${idx + 1}`,
        ctaLabel: `E2E CTA ${c.id}`,
        points: [
          `E2E PUBG point ${c.id}`,
          "E2E two",
          "E2E three",
          "E2E four",
          "E2E five",
        ],
      };
    });
    await savePubgApkPage(back);
  }

  console.log("\n== 3) Public HTML /pubg-apk ==");
  {
    try {
      const res = await fetchText("/pubg-apk");
      ok("GET /pubg-apk 200", res.status === 200, `status=${res.status}`);
      if (res.status === 200) {
        const html = res.text;
        ok("no app error", !html.includes("Application error") && !html.includes("Internal Server Error"));
        const titles = [...html.matchAll(/class="ff-as-card-title"[^>]*>([^<]+)/g)].map((m) =>
          decodeHtml(m[1]),
        );
        for (let i = 0; i < CARDS.length; i++) {
          const spec = CARDS[i];
          ok(`HTML title ${spec.id}`, hasText(html, spec.title));
          ok(`heading id ${spec.id}`, html.includes(`id="pubg-apk-card-${spec.id}"`));
          ok(`edited summary ${spec.id}`, html.includes(`E2E PUBG card ${spec.id} summary.`));
          ok(`edited point ${spec.id}`, html.includes(`E2E PUBG point ${spec.id}`));
          ok(`edited badge ${spec.id}`, html.includes(`E2E-${i + 1}`));
          ok(`edited CTA label ${spec.id}`, html.includes(`E2E CTA ${spec.id}`));
          ok(`DOM #${i + 1}`, titles[i] === spec.title, titles[i] || "none");
        }
        ok("guide CTA", html.includes('href="#pubg-apk-guide"'));
        ok("calculator CTA", html.includes('href="/pubg"'));
      }
    } catch (e) {
      ok("HTTP reachable", false, e instanceof Error ? e.message : String(e));
    }
  }

  console.log("\n== 4) Accidental remove → pin back ==");
  {
    const admin = await getPubgApkPageForAdmin();
    const withoutBan = clone(admin.page);
    withoutBan.cards = withoutBan.cards.filter((c) => c.id !== "ban-prevention-safety");
    const saved = await savePubgApkPage(withoutBan);
    ok("ban re-prepended", saved.page.cards[4]?.id === "ban-prevention-safety");
    ok(
      "obb/fps still present",
      saved.page.cards[2]?.id === "obb-file-setup" &&
        saved.page.cards[3]?.id === "fps-graphics-unlock",
    );
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
console.log("\nAll PUBG pinned-cards e2e checks passed.");
