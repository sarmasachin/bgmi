import fs from "fs";
import path from "path";
import { webcrypto } from "crypto";

const BASE = process.argv[2] || "http://127.0.0.1:3000";

for (const f of [".env.local", ".env"]) {
  const p = path.join(process.cwd(), f);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^SESSION_SECRET=(.*)$/);
    if (!m) continue;
    let v = m[1].trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    process.env.SESSION_SECRET = v;
  }
}

const secret =
  process.env.SESSION_SECRET?.trim() || "dev-only-session-secret-change-me!!";

function b64url(buf) {
  return Buffer.from(buf)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

async function makeToken() {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: "e2e-admin",
    email: "e2e@test.local",
    iat: now,
    exp: now + 3600,
  };
  const body = b64url(Buffer.from(JSON.stringify(payload)));
  const key = await webcrypto.subtle.importKey(
    "raw",
    Buffer.from(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await webcrypto.subtle.sign("HMAC", key, Buffer.from(body));
  return `${body}.${b64url(Buffer.from(sig))}`;
}

async function main() {
  const marker = `e2e-report-${Date.now()}`;
  const email = `e2e.report.${Date.now()}@example.com`;

  console.log("BASE", BASE);
  console.log("1) POST /api/contact (report)...");
  const createRes = await fetch(`${BASE}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "E2E Tester",
      email,
      subject: `Report an issue: ${marker}`,
      message:
        "Automated E2E report message for status workflow testing. Please ignore.",
      topic: "report",
    }),
  });
  const createJson = await createRes.json().catch(() => ({}));
  console.log("   status", createRes.status, createJson);
  if (!createRes.ok) throw new Error("contact create failed");

  const token = await makeToken();
  const cookie = `bgmi_admin_session=${token}`;

  console.log("2) GET /api/admin/contact...");
  const listRes = await fetch(`${BASE}/api/admin/contact`, {
    headers: { Cookie: cookie },
  });
  const listJson = await listRes.json().catch(() => ({}));
  console.log(
    "   status",
    listRes.status,
    "count",
    Array.isArray(listJson.data) ? listJson.data.length : "n/a",
  );
  if (!listRes.ok) throw new Error(`admin list failed: ${JSON.stringify(listJson)}`);

  const item =
    (listJson.data || []).find((r) => r.id === createJson.id) ||
    (listJson.data || []).find((r) => String(r.subject || "").includes(marker));
  if (!item) {
    console.log(
      "   sample",
      (listJson.data || []).slice(0, 3).map((r) => ({
        id: r.id,
        subject: r.subject,
        status: r.status,
        topic: r.topic,
      })),
    );
    throw new Error("created message not found in admin list");
  }
  console.log("   found", {
    id: item.id,
    status: item.status,
    topic: item.topic,
    subject: item.subject,
  });

  const mutHeaders = {
    "Content-Type": "application/json",
    Cookie: cookie,
    Origin: BASE,
    Referer: `${BASE}/admin/contact`,
  };

  console.log("3) PATCH in_progress etaHours=24...");
  const progRes = await fetch(`${BASE}/api/admin/contact`, {
    method: "PATCH",
    headers: mutHeaders,
    body: JSON.stringify({ id: item.id, status: "in_progress", etaHours: 24 }),
  });
  const progJson = await progRes.json().catch(() => ({}));
  console.log("   status", progRes.status, {
    ok: progJson.ok,
    emailSent: progJson.emailSent,
    emailWarning: progJson.emailWarning,
    dataStatus: progJson.data?.status,
    eta: progJson.data?.etaHours,
  });
  if (!progRes.ok) throw new Error("in_progress failed");
  if (progJson.data?.status !== "in_progress") throw new Error("status not in_progress");
  if (progJson.data?.etaHours !== 24) throw new Error("etaHours not 24");

  console.log("4) PATCH solved...");
  const solRes = await fetch(`${BASE}/api/admin/contact`, {
    method: "PATCH",
    headers: mutHeaders,
    body: JSON.stringify({ id: item.id, status: "solved" }),
  });
  const solJson = await solRes.json().catch(() => ({}));
  console.log("   status", solRes.status, {
    ok: solJson.ok,
    emailSent: solJson.emailSent,
    emailWarning: solJson.emailWarning,
    dataStatus: solJson.data?.status,
  });
  if (!solRes.ok) throw new Error("solved failed");
  if (solJson.data?.status !== "solved") throw new Error("status not solved");

  console.log("5) PATCH in_progress without eta (expect 400)...");
  const badRes = await fetch(`${BASE}/api/admin/contact`, {
    method: "PATCH",
    headers: mutHeaders,
    body: JSON.stringify({ id: item.id, status: "in_progress" }),
  });
  const badJson = await badRes.json().catch(() => ({}));
  console.log("   status", badRes.status, badJson);
  if (badRes.status !== 400) throw new Error("expected 400 without etaHours");

  console.log("6) PATCH in_progress etaHours=48...");
  const prog48 = await fetch(`${BASE}/api/admin/contact`, {
    method: "PATCH",
    headers: mutHeaders,
    body: JSON.stringify({ id: item.id, status: "in_progress", etaHours: 48 }),
  });
  const prog48Json = await prog48.json().catch(() => ({}));
  console.log("   status", prog48.status, {
    ok: prog48Json.ok,
    eta: prog48Json.data?.etaHours,
    emailSent: prog48Json.emailSent,
  });
  if (!prog48.ok || prog48Json.data?.etaHours !== 48) {
    throw new Error("48h in_progress failed");
  }

  console.log("7) Admin contact page HTML...");
  const pageRes = await fetch(`${BASE}/admin/contact`, {
    headers: { Cookie: cookie },
    redirect: "manual",
  });
  const html = await pageRes.text();
  const hasDropdown = /In Progress|in_progress/.test(html);
  const hasEta = /24 hours|48 hours/.test(html);
  console.log("   status", pageRes.status, { hasDropdown, hasEta, len: html.length });
  if (pageRes.status !== 200) throw new Error("admin contact page not 200");
  if (!hasDropdown) throw new Error("admin UI missing In Progress option");

  console.log("\nE2E RESULT: PASS");
}

main().catch((e) => {
  console.error("\nE2E RESULT: FAIL", e.message);
  process.exit(1);
});
