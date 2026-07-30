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

console.log("\n=== subscribe API (should be removed) ===");
const email = `verify-${Date.now()}@example.com`;
const res = await fetch(`${base}/api/subscribe/email`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, tags: ["deploy-verify"] }),
});
const body = await res.json().catch(() => ({}));
console.log({ status: res.status, body });
console.log(
  res.status === 404
    ? "PASS: public email subscribe API is gone"
    : "FAIL: /api/subscribe/email still responds — remove deploy / rebuild needed",
);

console.log("\n=== homepage footer sniff ===");
const html = await (await fetch(`${base}/`, { cache: "no-store" })).text();
const hasSubscribe =
  /Subscribe email|campaign-email|Email updates|site-footer-subscribe/i.test(html);
console.log(
  hasSubscribe
    ? "FAIL: footer email subscribe UI still in HTML"
    : "PASS: no footer email subscribe UI in HTML",
);
