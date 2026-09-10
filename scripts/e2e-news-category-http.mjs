/**
 * HTTP e2e: admin news-category URL guards + public listing/redirect.
 * Usage: npx tsx scripts/e2e-news-category-http.mjs
 */
import { createHmac } from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const base = process.env.E2E_BASE_URL || "http://127.0.0.1:3000";

function loadEnv() {
  for (const f of [".env.local", ".env"]) {
    const p = path.join(root, f);
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
      const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (!m) continue;
      let v = m[2].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      if (!process.env[m[1]]) process.env[m[1]] = v;
    }
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function mintAdminCookie(prisma) {
  const user = await prisma.adminUser.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });
  if (!user) return null;
  const secret =
    process.env.SESSION_SECRET?.trim()?.length >= 32
      ? process.env.SESSION_SECRET.trim()
      : "dev-only-session-secret-change-me!!";
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: user.id,
    email: user.email.trim().toLowerCase(),
    role: user.role || "superadmin",
    permissions: Array.isArray(user.permissions) ? user.permissions : [],
    iat: now,
    exp: now + 60 * 60,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", secret).update(body).digest("base64url");
  return `bgmi_admin_session=${body}.${sig}`;
}

async function jsonFetch(url, init) {
  const res = await fetch(url, init);
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

async function main() {
  loadEnv();
  console.log("=== e2e-news-category-http ===");
  let probe;
  try {
    probe = await fetch(base, { redirect: "manual" });
  } catch {
    throw new Error(`No server at ${base}`);
  }
  assert(probe.status > 0, "server did not respond");

  const prisma = new PrismaClient();
  const stamp = Date.now();
  const freeSlug = `e2e-http-cat-${stamp}`;
  let id = null;
  try {
    const cookie = await mintAdminCookie(prisma);
    assert(cookie, "no active admin user");
    const headers = {
      cookie,
      Origin: base,
      Referer: `${base}/admin/news-categories`,
      "Content-Type": "application/json",
    };

    const list = await jsonFetch(`${base}/api/admin/news-categories`, { headers });
    assert(list.res.status === 200 && Array.isArray(list.data.data), `list HTTP ${list.res.status}`);

    const contact = await jsonFetch(`${base}/api/admin/news-categories?slug=contact`, { headers });
    assert(contact.data.exists === true, "slug=contact must be taken");

    const bgmi = await jsonFetch(`${base}/api/admin/news-categories?slug=bgmi`, { headers });
    assert(bgmi.data.exists === true, "slug=bgmi must be taken");

    const fresh = await jsonFetch(`${base}/api/admin/news-categories?slug=${freeSlug}`, { headers });
    assert(fresh.data.exists === false, "fresh slug must be free");

    const siteClash = await jsonFetch(`${base}/api/admin/news-categories`, {
      method: "POST",
      headers,
      body: JSON.stringify({ slug: "contact", label: "Should Fail Contact" }),
    });
    assert(siteClash.res.status === 409, `POST contact HTTP ${siteClash.res.status}`);
    assert(String(siteClash.data.error || "").toLowerCase().includes("website"), siteClash.data.error);

    const catClash = await jsonFetch(`${base}/api/admin/news-categories`, {
      method: "POST",
      headers,
      body: JSON.stringify({ slug: "bgmi", label: "Should Fail Bgmi" }),
    });
    assert(catClash.res.status === 409, `POST bgmi HTTP ${catClash.res.status}`);

    const pageSite = await jsonFetch(`${base}/api/admin/pages`, {
      method: "POST",
      headers: { ...headers, Referer: `${base}/admin/pages` },
      body: JSON.stringify({ title: "Should Fail Contact Page", slug: "contact", status: "draft" }),
    });
    assert(pageSite.res.status === 409, `POST page contact HTTP ${pageSite.res.status}`);
    assert(String(pageSite.data.error || "").toLowerCase().includes("website"), pageSite.data.error);

    const created = await jsonFetch(`${base}/api/admin/news-categories`, {
      method: "POST",
      headers,
      body: JSON.stringify({ slug: freeSlug, label: `E2E HTTP ${stamp}` }),
    });
    assert(created.res.status === 200 && created.data.data?.id, `POST unique HTTP ${created.res.status}`);
    id = created.data.data.id;

    const dup = await jsonFetch(`${base}/api/admin/news-categories`, {
      method: "POST",
      headers,
      body: JSON.stringify({ slug: freeSlug, label: "Dup" }),
    });
    assert(dup.res.status === 409, `dup category HTTP ${dup.res.status}`);

    const pageClash = await jsonFetch(`${base}/api/admin/pages`, {
      method: "POST",
      headers: { ...headers, Referer: `${base}/admin/pages` },
      body: JSON.stringify({ title: `E2E HTTP Page ${stamp}`, slug: freeSlug, status: "draft" }),
    });
    assert(pageClash.res.status === 409, `page vs category HTTP ${pageClash.res.status}`);
    assert(String(pageClash.data.error || "").toLowerCase().includes("category"), pageClash.data.error);

    const keep = await jsonFetch(`${base}/api/admin/news-categories`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ id, slug: freeSlug, label: `E2E HTTP ${stamp} b` }),
    });
    assert(keep.res.status === 200, `PATCH same slug HTTP ${keep.res.status}`);

    const publicCat = await fetch(`${base}/${freeSlug}`, { redirect: "manual" });
    assert(publicCat.status === 200, `public /${freeSlug} HTTP ${publicCat.status}`);

    const ff = await fetch(`${base}/ff-max`, { redirect: "manual" });
    const loc = ff.headers.get("location") || "";
    assert(ff.status === 307 || ff.status === 308, `/ff-max redirect ${ff.status}`);
    assert(loc.includes("/news/ff-max"), `/ff-max location ${loc}`);

    const ffNews = await fetch(`${base}/news/ff-max`, { redirect: "manual" });
    assert(ffNews.status === 200, `/news/ff-max HTTP ${ffNews.status}`);

    const bgmiPage = await fetch(`${base}/bgmi`, { redirect: "manual" });
    assert(bgmiPage.status === 200, `/bgmi HTTP ${bgmiPage.status}`);

    const del = await fetch(`${base}/api/admin/news-categories?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers,
    });
    assert(del.ok, `DELETE HTTP ${del.status}`);
    id = null;
    console.log("PASS  HTTP admin create/block + public listing/redirect");
  } finally {
    if (id) {
      await prisma.newsCategory.delete({ where: { id } }).catch(() => {});
    }
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("FAIL", error.message);
  process.exit(1);
});
