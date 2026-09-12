import fs from "fs";
import path from "path";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";

function loadDotEnv(f) {
  const p = path.join(process.cwd(), f);
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
      v = v.slice(1, -1);
    if (!process.env[k]) process.env[k] = v;
  }
}
loadDotEnv(".env");
loadDotEnv(".env.local");

const require = createRequire(import.meta.url);
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

const { DEFAULT_BGMI_APK_PAGE, isUsableHeroImageSrc } = await load("src/lib/bgmiApkPage.ts");
const { normalizeBgmiApkPage } = await load("src/lib/bgmiApkPageNormalize.ts");
const {
  getBgmiApkPage,
  getBgmiApkPageForAdmin,
  saveBgmiApkPage,
  clearBgmiApkPage,
} = await load("src/server/repositories/bgmiApkPageRepository.ts");

const before = await getBgmiApkPageForAdmin();
async function restore() {
  if (before.usingDefault) await clearBgmiApkPage();
  else await saveBgmiApkPage(before.page);
}

const TITLE_AS_URL =
  "Battlegrounds Mobile India - BGMI APK 4.6 Update Download (APK + OBB)";
const REAL_URL = "https://example.com/e2e-hero-clear.png";

try {
  console.log("\n== normalize empty / invalid ==");
  ok("default heroImage empty", DEFAULT_BGMI_APK_PAGE.heroImage === "");
  ok("empty stays empty", normalizeBgmiApkPage({ ...DEFAULT_BGMI_APK_PAGE, heroImage: "" }).heroImage === "");
  ok(
    "whitespace becomes empty",
    normalizeBgmiApkPage({ ...DEFAULT_BGMI_APK_PAGE, heroImage: "   " }).heroImage === "",
  );
  ok(
    "title-text URL cleared",
    normalizeBgmiApkPage({ ...DEFAULT_BGMI_APK_PAGE, heroImage: TITLE_AS_URL }).heroImage === "",
  );
  ok("real URL kept", normalizeBgmiApkPage({ ...DEFAULT_BGMI_APK_PAGE, heroImage: REAL_URL }).heroImage === REAL_URL);
  ok("usable helper rejects title", !isUsableHeroImageSrc(TITLE_AS_URL));
  ok("usable helper accepts url", isUsableHeroImageSrc(REAL_URL));

  console.log("\n== save empty after having URL (persist) ==");
  const withUrl = await saveBgmiApkPage({
    ...JSON.parse(JSON.stringify(DEFAULT_BGMI_APK_PAGE)),
    heroImage: REAL_URL,
    seoTitle: "E2E hero clear SEO",
  });
  ok("save URL first", withUrl.page.heroImage === REAL_URL);

  const cleared = await saveBgmiApkPage({
    ...JSON.parse(JSON.stringify(withUrl.page)),
    heroImage: "",
  });
  ok("save empty returns empty", cleared.page.heroImage === "");

  const admin = await getBgmiApkPageForAdmin();
  ok("admin reload empty", admin.page.heroImage === "" && !admin.usingDefault, JSON.stringify(admin.page.heroImage));

  const pub = await getBgmiApkPage();
  ok("public get empty", pub.heroImage === "");

  console.log("\n== simulate e2e restore overwrite (root cause demo) ==");
  const snapshotWithUrl = JSON.parse(JSON.stringify(withUrl.page)); // old tab / e2e before
  // user cleared (already empty in DB)
  ok("DB still empty before overwrite", (await getBgmiApkPage()).heroImage === "");
  // e2e restore OR old admin tab Save writes snapshot back
  const overwritten = await saveBgmiApkPage(snapshotWithUrl);
  ok(
    "overwrite puts URL back (this is the failure mode)",
    overwritten.page.heroImage === REAL_URL,
  );
  ok("admin sees URL again after overwrite", (await getBgmiApkPageForAdmin()).page.heroImage === REAL_URL);

  // clear again for clean restore of user state
  await saveBgmiApkPage({ ...overwritten.page, heroImage: "" });
} catch (e) {
  ok("threw", false, e instanceof Error ? e.message : String(e));
} finally {
  await restore();
  ok("restored prior DB state", true);
}

if (failures.length) {
  console.log("\nFAILED:", failures.join(", "));
  process.exit(1);
}
console.log("\nheroImage clear path OK; overwrite-from-stale-snapshot reproduced.");
