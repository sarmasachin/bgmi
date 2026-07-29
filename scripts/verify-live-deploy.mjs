#!/usr/bin/env node
/**
 * Run ON THE SERVER after deploy:
 *   node scripts/verify-live-deploy.mjs
 * Or remotely:
 *   node scripts/verify-live-deploy.mjs https://sensitivitysettings.com
 */
import { execSync } from "child_process";

const base = (process.argv[2] || "http://127.0.0.1:3001").replace(/\/$/, "");

function sh(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8" }).trim();
  } catch (e) {
    return `ERR: ${e.message}`;
  }
}

console.log("=== git ===");
console.log("HEAD:", sh("git log -1 --oneline"));
console.log("origin/main:", sh("git log -1 --oneline origin/main"));

console.log("\n=== subscribe API ===");
const email = `verify-${Date.now()}@example.com`;
const res = await fetch(`${base}/api/subscribe/email`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, tags: ["deploy-verify"] }),
});
const body = await res.json().catch(() => ({}));
console.log({ status: res.status, body, email });

const hasEmailSentField = Object.prototype.hasOwnProperty.call(body, "emailSent");
console.log("\n=== checks ===");
console.log(
  hasEmailSentField
    ? "PASS: new subscribe thank-you code is live (emailSent field present)"
    : "FAIL: OLD subscribe code still live (no emailSent) — git pull + rebuild + pm2 restart needed",
);

if (hasEmailSentField && body.emailSent === false) {
  console.log("WARN: code is new but SMTP failed:", body.emailError || "(no reason)");
}
if (hasEmailSentField && body.emailSent === true) {
  console.log("PASS: welcome email reported sent");
}

console.log("\n=== homepage footer sniff ===");
const html = await (await fetch(`${base}/`, { cache: "no-store" })).text();
const hasTitle = /site-footer-col-title[^>]*>\s*Email updates/i.test(html);
console.log(
  hasTitle
    ? "FAIL: visible 'Email updates' title still in HTML — old SiteFooter"
    : "PASS: no visible Email updates title in HTML",
);
