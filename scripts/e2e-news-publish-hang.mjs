/**
 * E2E: why admin "Publishing…" hangs after news publish.
 * Usage: node scripts/e2e-news-publish-hang.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const LIVE = "https://sensitivitysettings.com";
const SLUG = "become-a-tester-test-ff-sensi-pro-best";
const TITLE_HINT = "Become a Tester";

function loadEnv() {
  for (const f of [".env.local", ".env"]) {
    const p = path.join(root, f);
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
      const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (!m) continue;
      let v = m[2].trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      if (!process.env[m[1]]) process.env[m[1]] = v;
    }
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function timedFetch(url, opts = {}) {
  const started = Date.now();
  try {
    const res = await fetch(url, { redirect: "follow", ...opts });
    const text = await res.text();
    return {
      url,
      ok: res.ok,
      status: res.status,
      ms: Date.now() - started,
      bytes: text.length,
      text,
    };
  } catch (error) {
    return {
      url,
      ok: false,
      status: 0,
      ms: Date.now() - started,
      bytes: 0,
      text: "",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function sourceContains(rel, needle) {
  return fs.readFileSync(path.join(root, rel), "utf8").includes(needle);
}

loadEnv();

const checks = [];
function pass(name, detail) {
  checks.push({ name, ok: true, detail });
  console.log(`PASS  ${name}${detail ? ` — ${detail}` : ""}`);
}
function fail(name, detail) {
  checks.push({ name, ok: false, detail });
  console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
}

async function main() {
  const campaignSrc = fs.readFileSync(
    path.join(root, "src/server/services/campaignService.ts"),
    "utf8",
  );
  const newsRoute = fs.readFileSync(
    path.join(root, "app/api/admin/news/route.ts"),
    "utf8",
  );
  const pushSrc = fs.readFileSync(
    path.join(root, "src/server/services/pushService.ts"),
    "utf8",
  );
  const clientSrc = fs.readFileSync(
    path.join(root, "app/admin/news/AdminNewsClient.tsx"),
    "utf8",
  );

  /after\(async \(\) => \{[\s\S]*deliverEmail/.test(campaignSrc)
    ? pass("email campaigns are backgrounded with after()")
    : fail("email campaigns are backgrounded with after()");

  /const delivery = await deliverPush\(/.test(campaignSrc)
    ? pass("push campaigns AWAIT deliverPush (blocks the HTTP request)")
    : fail("push campaigns AWAIT deliverPush (blocks the HTTP request)");

  /await maybeSendPublishPush\(/.test(newsRoute)
    ? pass("news PATCH waits for maybeSendPublishPush before responding")
    : fail("news PATCH waits for maybeSendPublishPush before responding");

  /timeout:\s*\d+/.test(pushSrc)
    ? pass("web-push sendNotification sets a timeout")
    : fail(
        "web-push sendNotification sets a timeout",
        "missing — dead FCM endpoints can hang PATCH forever",
      );

  const statusFn = clientSrc.slice(
    clientSrc.indexOf("async function setNewsStatus"),
    clientSrc.indexOf("function closeConfirmModal"),
  );
  /AbortController/.test(statusFn)
    ? pass("admin publish fetch has an abort timeout")
    : fail(
        "admin publish fetch has an abort timeout",
        "setNewsStatus has none — modal stays on Publishing…",
      );

  const home = await timedFetch(`${LIVE}/`);
  home.ok && home.ms < 5000
    ? pass("live homepage responds", `${home.status} in ${home.ms}ms`)
    : fail("live homepage responds", `${home.status} in ${home.ms}ms ${home.error || ""}`);

  const article = await timedFetch(
    `${LIVE}/free-fire/${SLUG}`,
  );
  const articleHasTitle = article.text.includes(TITLE_HINT);
  article.ok
    ? pass("live tester article URL responds", `${article.status} in ${article.ms}ms ${article.bytes}b`)
    : fail("live tester article URL responds", `${article.status} in ${article.ms}ms`);
  articleHasTitle
    ? pass("live article HTML contains the tester title (publish already saved)")
    : fail(
        "live article HTML contains the tester title (publish already saved)",
        "title missing — still draft or different slug",
      );

  const newsHub = await timedFetch(`${LIVE}/news`);
  newsHub.text.includes(TITLE_HINT) || newsHub.text.includes("FF Sensi Pro")
    ? pass("news hub lists the tester article", `${newsHub.ms}ms`)
    : fail("news hub lists the tester article", `${newsHub.ms}ms`);

  const prisma = new PrismaClient();
  try {
    const t0 = Date.now();
    const rows = await prisma.newsPost.findMany({
      where: {
        OR: [
          { slug: { contains: "become-a-tester" } },
          { title: { contains: "Sensi Pro" } },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        publishedAt: true,
        updatedAt: true,
        primaryCategory: true,
      },
    });
    pass("local DB news query", `${Date.now() - t0}ms, ${rows.length} row(s)`);
    if (rows.length) {
      console.log("  local rows:", JSON.stringify(rows, null, 2));
    }

    const t1 = Date.now();
    const auto = await prisma.siteSetting.findUnique({
      where: { key: "settings:autoNotify" },
    });
    const autoMs = Date.now() - t1;
    const newsOnPublish = Boolean(auto?.value && auto.value.newsOnPublish === true);
    pass(
      "local autoNotify setting",
      `${autoMs}ms newsOnPublish=${newsOnPublish} raw=${JSON.stringify(auto?.value ?? null)}`,
    );

    const t2 = Date.now();
    const pushCount = await prisma.pushSubscription.count();
    pass("local push subscriber count", `${Date.now() - t2}ms count=${pushCount}`);
    if (newsOnPublish && pushCount > 0) {
      pass(
        "hang recipe present locally",
        `publish waits on ${pushCount} sequential web-push calls with no timeout`,
      );
    }
  } catch (error) {
    fail(
      "local DB reachable",
      error instanceof Error ? error.message : String(error),
    );
  } finally {
    await prisma.$disconnect();
  }

  const failed = checks.filter((c) => !c.ok);
  console.log(`\nSummary: ${checks.length - failed.length}/${checks.length} passed`);
  if (failed.length) {
    failed.forEach((f) => console.error(` - ${f.name}: ${f.detail ?? ""}`));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
