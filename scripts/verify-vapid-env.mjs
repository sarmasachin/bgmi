import fs from "fs";
import path from "path";
import webpush from "web-push";

/** Load VAPID_* from env files the same way Next resolves (later file wins). */
function parseEnvFile(filePath, into) {
  if (!fs.existsSync(filePath)) return;
  const text = fs.readFileSync(filePath, "utf8");
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#") || !line.startsWith("VAPID_")) continue;
    const i = line.indexOf("=");
    if (i < 0) continue;
    let v = line.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    into[line.slice(0, i)] = v;
    into.__sources[line.slice(0, i)] = path.basename(filePath);
  }
}

const root = process.cwd();
const merged = { __sources: {} };
// Next production order (simplified): .env then .env.production then .env.local
// Actually Next: .env < .env.local < .env.production < .env.production.local
// and existing process.env wins — we only inspect files here.
for (const name of [
  ".env",
  ".env.local",
  ".env.production",
  ".env.production.local",
]) {
  parseEnvFile(path.join(root, name), merged);
}

const pub = merged.VAPID_PUBLIC_KEY || "";
const priv = merged.VAPID_PRIVATE_KEY || "";
const sub = merged.VAPID_SUBJECT || "";

console.log("Sources:");
console.log("  VAPID_PUBLIC_KEY  <-", merged.__sources.VAPID_PUBLIC_KEY || "(missing)");
console.log("  VAPID_PRIVATE_KEY <-", merged.__sources.VAPID_PRIVATE_KEY || "(missing)");
console.log("  VAPID_SUBJECT     <-", merged.__sources.VAPID_SUBJECT || "(missing)");
console.log("Lengths: public=", pub.length, "private=", priv.length);
console.log("Public prefix:", pub.slice(0, 28));

if (!pub || !priv) {
  console.error("FAIL: missing public or private key in env files");
  process.exit(1);
}

try {
  webpush.setVapidDetails(sub || "mailto:support@sensitivitysettings.com", pub, priv);
  console.log("setVapidDetails: OK (format loads)");
} catch (e) {
  console.error("FAIL setVapidDetails:", e instanceof Error ? e.message : e);
  process.exit(1);
}

// Compare with what the live process would get from process.env if already set
if (process.env.VAPID_PUBLIC_KEY || process.env.VAPID_PRIVATE_KEY) {
  console.log("NOTE: process.env already has VAPID_* (PM2 may override files)");
  console.log(
    "  process public prefix:",
    (process.env.VAPID_PUBLIC_KEY || "").slice(0, 28),
  );
  console.log(
    "  process private len:",
    (process.env.VAPID_PRIVATE_KEY || "").length,
  );
}
