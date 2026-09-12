/**
 * E2E: clearing heroImageAlt must persist (not snap back to default).
 * Restores DB after. Run: npx tsx scripts/e2e-bgmi-apk-alt-clear.mjs
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
const BASE = process.env.E2E_BASE || "http://127.0.0.1:3000";
const DEFAULT_ALT = "BGMI download guide — Play Store and APK options";
const E2E_MARKER = "E2E-BGMI-APK-ALT-CLEAR";

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

const { normalizeBgmiApkPage } = await load("src/lib/bgmiApkPageNormalize.ts");
const { DEFAULT_BGMI_APK_PAGE } = await load("src/lib/bgmiApkPage.ts");
const {
  getBgmiApkPage,
  getBgmiApkPageForAdmin,
  saveBgmiApkPage,
  clearBgmiApkPage,
} = await load("src/server/repositories/bgmiApkPageRepository.ts");

console.log("\n== 1) Normalize unit ==");
{
  const cleared = normalizeBgmiApkPage({
    ...DEFAULT_BGMI_APK_PAGE,
    heroImageAlt: "",
  });
  ok("empty string stays empty", cleared.heroImageAlt === "");

  const whitespace = normalizeBgmiApkPage({
    ...DEFAULT_BGMI_APK_PAGE,
    heroImageAlt: "   ",
  });
  ok("whitespace-only becomes empty", whitespace.heroImageAlt === "");

  const custom = normalizeBgmiApkPage({
    ...DEFAULT_BGMI_APK_PAGE,
    heroImageAlt: "Custom alt text",
  });
  ok("custom alt kept", custom.heroImageAlt === "Custom alt text");

  const missing = normalizeBgmiApkPage({});
  ok(
    "missing field still defaults",
    missing.heroImageAlt === DEFAULT_ALT,
    JSON.stringify(missing.heroImageAlt),
  );
}

if (!process.env.DATABASE_URL) {
  console.log("\nSKIP DB/HTTP — no DATABASE_URL");
  process.exit(failures.length ? 1 : 0);
}

const before = await getBgmiApkPageForAdmin();
let restored = false;

async function restore() {
  if (restored) return;
  restored = true;
  if (before.usingDefault) await clearBgmiApkPage();
  else await saveBgmiApkPage(before.page);
}

try {
  console.log("\n== 2) DB save/reload empty alt ==");
  const e2eHeroUrl = "/icon.png?v=e2e-alt-clear";
  const draft = {
    ...JSON.parse(JSON.stringify(before.page)),
    heroImage: e2eHeroUrl,
    heroImageAlt: "",
    subtitleEn: `${before.page.subtitleEn || ""}\n${E2E_MARKER}`.trim(),
  };
  const saved = await saveBgmiApkPage(draft);
  ok("save returns empty alt", saved.page.heroImageAlt === "");
  ok("save keeps test hero URL", saved.page.heroImage === e2eHeroUrl);

  const reloadedAdmin = await getBgmiApkPageForAdmin();
  ok(
    "admin reload keeps empty alt",
    reloadedAdmin.page.heroImageAlt === "" && !reloadedAdmin.usingDefault,
    `alt=${JSON.stringify(reloadedAdmin.page.heroImageAlt)}`,
  );

  const reloadedPublic = await getBgmiApkPage();
  ok(
    "public get keeps empty alt",
    reloadedPublic.heroImageAlt === "",
    `alt=${JSON.stringify(reloadedPublic.heroImageAlt)}`,
  );
  ok(
    "default alt string not forced back",
    reloadedPublic.heroImageAlt !== DEFAULT_ALT,
  );

  console.log("\n== 3) Public HTTP (if server up) ==");
  let httpOk = false;
  try {
    const res = await fetch(`${BASE}/bgmi-apk`, {
      cache: "no-store",
      signal: AbortSignal.timeout(120000),
    });
    const html = await res.text();
    httpOk = res.ok;
    ok("GET /bgmi-apk 200", res.status === 200, `status=${res.status}`);

    if (res.ok) {
      const featureImgs = [...html.matchAll(/<img[^>]*class="ff-as-feature-image"[^>]*>/g)].map(
        (m) => m[0],
      );
      if (!featureImgs.length) {
        // React may put class before/after other attrs
        featureImgs.push(
          ...[...html.matchAll(/<img[^>]*ff-as-feature-image[^>]*>/g)].map((m) => m[0]),
        );
      }
      ok("hero img rendered (URL set)", featureImgs.length > 0, `count=${featureImgs.length}`);
      if (featureImgs.length) {
        const tag = featureImgs[0];
        ok(
          "hero img alt is not default string",
          !tag.includes(DEFAULT_ALT),
          tag.slice(0, 160),
        );
        const emptyAlt = /\salt=(""|'')/.test(tag) || /\salt=\{?""\}?/.test(tag);
        ok("hero img uses empty alt attr", emptyAlt, tag.slice(0, 160));
        ok("hero img src is e2e URL", tag.includes(e2eHeroUrl), tag.slice(0, 160));
      }

      // Body must not surface the default alt as visible broken-image text
      // (only check near feature image region if present).
      ok(
        "page HTML has no default alt as visible hero text trap",
        !featureImgs.some((t) => t.includes(DEFAULT_ALT)),
      );

      // OG may still use page.tsx fallback — intentional for social cards
      const ogAlt = html.match(/property="og:image:alt"\s+content="([^"]*)"/i);
      if (ogAlt) {
        ok(
          "og:image:alt present (social fallback ok)",
          Boolean(ogAlt[1]?.trim()),
          ogAlt[1].slice(0, 80),
        );
      } else {
        ok("og:image:alt tag optional/absent ok", true);
      }

      ok(
        "page did not hard-error",
        !html.includes("Application error") && !html.includes("Internal Server Error"),
      );
    }
  } catch (err) {
    console.log(`[SKIP] HTTP — server not reachable at ${BASE} (${err.message})`);
  }

  if (!httpOk) {
    console.log(`Tip: start \`npx next dev -p 3010\` and re-run with E2E_BASE=${BASE}`);
  }
} finally {
  await restore();
  const after = await getBgmiApkPageForAdmin();
  ok(
    "DB restored",
    before.usingDefault
      ? after.usingDefault
      : after.page.heroImageAlt === before.page.heroImageAlt,
    `now alt=${JSON.stringify(after.page.heroImageAlt)}`,
  );
}

console.log(`\n${failures.length ? "FAILED" : "OK"} — ${failures.length} failure(s)`);
if (failures.length) {
  console.log(failures.join("\n"));
  process.exit(1);
}
