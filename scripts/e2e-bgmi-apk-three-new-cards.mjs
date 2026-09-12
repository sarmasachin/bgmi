/**
 * E2E cross-check: 3 new BGMI APK cards (OBB, FPS, Ban).
 * Covers defaults, pin/prepend, admin save/edit/reload, public HTML, CTAs.
 * Restores DB after. Run:
 *   E2E_BASE=http://127.0.0.1:3011 npx tsx scripts/e2e-bgmi-apk-three-new-cards.mjs
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
    id: "obb-file-setup",
    index: 2,
    title: "OBB File Setup (Direct Search Intent)",
    badge: "OBB",
    icon: "fa-file-zipper",
    ctaHref: "#bgmi-apk-guide",
    e2eSummary: "E2E OBB summary saved from admin path.",
    e2ePoint: "E2E OBB custom bullet point one",
    e2eBadge: "E2E-OBB",
    e2eCtaLabel: "E2E OBB CTA",
  },
  {
    id: "fps-graphics-unlock",
    index: 3,
    title: "90 FPS / Graphics Unlock Guide",
    badge: "FPS",
    icon: "fa-gauge-high",
    ctaHref: "/bgmi",
    e2eSummary: "E2E FPS summary saved from admin path.",
    e2ePoint: "E2E FPS custom bullet point one",
    e2eBadge: "E2E-FPS",
    e2eCtaLabel: "E2E FPS CTA",
  },
  {
    id: "ban-prevention-safety",
    index: 4,
    title: "Ban Prevention and Account Safety Rules",
    // default title uses & — check both in HTML
    defaultTitle: "Ban Prevention & Account Safety Rules",
    badge: "Ban",
    icon: "fa-user-shield",
    ctaHref: "#bgmi-apk-guide",
    e2eSummary: "E2E Ban summary saved from admin path.",
    e2ePoint: "E2E Ban custom bullet point one",
    e2eBadge: "E2E-Ban",
    e2eCtaLabel: "E2E Ban CTA",
  },
];

const NEW_IDS = CARDS.map((c) => c.id);

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
  console.log("Cross-check: OBB + FPS + Ban cards (admin save + public)\n");

  console.log("== 1) Defaults complete (no missing fields) ==");
  {
    const def = normalizeBgmiApkPage(DEFAULT_BGMI_APK_PAGE);
    for (const spec of CARDS) {
      const card = def.cards[spec.index];
      const expectedTitle = spec.defaultTitle || spec.title;
      ok(`${spec.id} at index ${spec.index}`, card?.id === spec.id, card?.id);
      ok(`${spec.id} title`, card?.title === expectedTitle, card?.title);
      ok(`${spec.id} badge`, card?.badge === spec.badge, card?.badge);
      ok(`${spec.id} icon`, card?.icon === spec.icon, card?.icon);
      ok(`${spec.id} summary non-empty`, Boolean(card?.summary?.trim()));
      ok(`${spec.id} points >= 5`, (card?.points?.length || 0) >= 5, `n=${card?.points?.length}`);
      ok(`${spec.id} ctaLabel`, Boolean(card?.ctaLabel?.trim()), card?.ctaLabel);
      ok(`${spec.id} ctaHref`, card?.ctaHref === spec.ctaHref, card?.ctaHref);
    }
    ok("total cards >= 11", def.cards.length >= 11, `count=${def.cards.length}`);
    ok(
      "no mid-gap pairs after pinned",
      def.cards[5]?.id === "play-store" &&
        def.cards[6]?.id === "apk-button" &&
        def.cards[7]?.id === "safe-download" &&
        def.cards[8]?.id === "device",
    );
  }

  console.log("\n== 2) Old DB without 3 cards → prepend on normalize/admin load ==");
  {
    const stripped = normalizeBgmiApkPage({
      ...DEFAULT_BGMI_APK_PAGE,
      cards: DEFAULT_BGMI_APK_PAGE.cards.filter((c) => !NEW_IDS.includes(c.id)),
    });
    for (const spec of CARDS) {
      ok(`prepend ${spec.id}`, stripped.cards[spec.index]?.id === spec.id);
    }

    const saveMissing = await saveBgmiApkPage({
      ...clone(DEFAULT_BGMI_APK_PAGE),
      cards: DEFAULT_BGMI_APK_PAGE.cards.filter((c) => !NEW_IDS.includes(c.id)),
      seoTitle: "E2E three-new-cards missing save",
    });
    for (const spec of CARDS) {
      ok(`save missing → ${spec.id}`, saveMissing.page.cards[spec.index]?.id === spec.id);
    }
    const adminAfterMissing = await getBgmiApkPageForAdmin();
    for (const spec of CARDS) {
      ok(
        `admin load missing → ${spec.id}`,
        adminAfterMissing.page.cards[spec.index]?.id === spec.id,
      );
    }
  }

  console.log("\n== 3) Admin-style edit each card + save (same path as admin UI) ==");
  {
    const admin0 = await getBgmiApkPageForAdmin();
    const edited = clone(admin0.page);
    edited.seoTitle = "E2E three-new-cards admin edit";
    edited.cards = edited.cards.map((c) => {
      const spec = CARDS.find((s) => s.id === c.id);
      if (!spec) return c;
      return {
        ...c,
        badge: spec.e2eBadge,
        summary: spec.e2eSummary,
        points: [
          spec.e2ePoint,
          "E2E point two",
          "E2E point three",
          "E2E point four",
          "E2E point five",
        ],
        ctaLabel: spec.e2eCtaLabel,
        ctaHref: spec.ctaHref,
      };
    });

    const saved = await saveBgmiApkPage(edited);
    ok("save ok usingDefault false", saved.usingDefault === false);

    for (const spec of CARDS) {
      const row = saved.page.cards.find((c) => c.id === spec.id);
      ok(`saved ${spec.id} badge`, row?.badge === spec.e2eBadge);
      ok(`saved ${spec.id} summary`, row?.summary === spec.e2eSummary);
      ok(`saved ${spec.id} point[0]`, row?.points?.[0] === spec.e2ePoint);
      ok(`saved ${spec.id} ctaLabel`, row?.ctaLabel === spec.e2eCtaLabel);
      ok(`saved ${spec.id} ctaHref`, row?.ctaHref === spec.ctaHref);
      ok(`saved ${spec.id} still index ${spec.index}`, saved.page.cards[spec.index]?.id === spec.id);
    }

    const admin1 = await getBgmiApkPageForAdmin();
    const pub = await getBgmiApkPage();
    for (const spec of CARDS) {
      ok(
        `admin reload ${spec.id}`,
        admin1.page.cards.find((c) => c.id === spec.id)?.summary === spec.e2eSummary,
      );
      ok(
        `public get ${spec.id}`,
        pub.cards.find((c) => c.id === spec.id)?.summary === spec.e2eSummary,
      );
      ok(
        `public get ${spec.id} point`,
        pub.cards.find((c) => c.id === spec.id)?.points?.[0] === spec.e2ePoint,
      );
    }
  }

  console.log("\n== 4) Second save round-trip (edit again, ensure not stuck) ==");
  {
    const admin = await getBgmiApkPageForAdmin();
    const again = clone(admin.page);
    again.cards = again.cards.map((c) => {
      if (c.id === "obb-file-setup") return { ...c, summary: "E2E OBB summary round two." };
      if (c.id === "fps-graphics-unlock") return { ...c, summary: "E2E FPS summary round two." };
      if (c.id === "ban-prevention-safety") return { ...c, summary: "E2E Ban summary round two." };
      return c;
    });
    const saved2 = await saveBgmiApkPage(again);
    ok(
      "round2 OBB",
      saved2.page.cards.find((c) => c.id === "obb-file-setup")?.summary ===
        "E2E OBB summary round two.",
    );
    ok(
      "round2 FPS",
      saved2.page.cards.find((c) => c.id === "fps-graphics-unlock")?.summary ===
        "E2E FPS summary round two.",
    );
    ok(
      "round2 Ban",
      saved2.page.cards.find((c) => c.id === "ban-prevention-safety")?.summary ===
        "E2E Ban summary round two.",
    );
    // restore e2e markers for HTML section
    const back = clone(saved2.page);
    back.cards = back.cards.map((c) => {
      const spec = CARDS.find((s) => s.id === c.id);
      if (!spec) return c;
      return {
        ...c,
        badge: spec.e2eBadge,
        summary: spec.e2eSummary,
        points: [
          spec.e2ePoint,
          "E2E point two",
          "E2E point three",
          "E2E point four",
          "E2E point five",
        ],
        ctaLabel: spec.e2eCtaLabel,
        ctaHref: spec.ctaHref,
      };
    });
    await saveBgmiApkPage(back);
  }

  console.log("\n== 5) Public /bgmi-apk HTML ==");
  {
    try {
      const res = await fetchText("/bgmi-apk");
      ok("GET /bgmi-apk 200", res.status === 200, `status=${res.status}`);
      if (res.status !== 200) throw new Error(`status ${res.status}`);
      const html = res.text;
      ok("no app error", !html.includes("Application error") && !html.includes("Internal Server Error"));

      const titles = [...html.matchAll(/class="ff-as-card-title"[^>]*>([^<]+)/g)].map((m) =>
        decodeHtml(m[1]),
      );

      for (const spec of CARDS) {
        const expectedTitle = spec.defaultTitle || spec.title;
        ok(`HTML title ${spec.id}`, hasText(html, expectedTitle));
        ok(`HTML heading id ${spec.id}`, html.includes(`id="bgmi-apk-card-${spec.id}"`));
        ok(`HTML edited summary ${spec.id}`, html.includes(spec.e2eSummary));
        ok(`HTML edited point ${spec.id}`, html.includes(spec.e2ePoint));
        ok(`HTML edited badge ${spec.id}`, html.includes(spec.e2eBadge));
        ok(`HTML edited CTA label ${spec.id}`, html.includes(spec.e2eCtaLabel));
        ok(
          `DOM order ${spec.id}`,
          titles[spec.index] === expectedTitle,
          titles[spec.index] || "none",
        );
      }

      ok("HTML guide CTA present", html.includes('href="#bgmi-apk-guide"'));
      ok("HTML calculator CTA present", html.includes('href="/bgmi"'));
    } catch (e) {
      ok("HTTP reachable", false, e instanceof Error ? e.message : String(e));
    }
  }

  console.log("\n== 6) Miss check: strip one card on save → still pinned back ==");
  {
    const admin = await getBgmiApkPageForAdmin();
    const withoutBan = clone(admin.page);
    withoutBan.cards = withoutBan.cards.filter((c) => c.id !== "ban-prevention-safety");
    const saved = await saveBgmiApkPage(withoutBan);
    ok("ban re-prepended after accidental remove", saved.page.cards[4]?.id === "ban-prevention-safety");
    ok(
      "obb/fps still present after ban strip",
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
console.log("\nAll three-new-cards e2e checks passed.");
