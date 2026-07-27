import fs from "fs";
import path from "path";
import webpush from "web-push";
import { createECDH } from "crypto";

function b64UrlToBuffer(value) {
  const pad = value + "=".repeat((4 - (value.length % 4)) % 4);
  return Buffer.from(pad.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

function pairOk(publicKey, privateKey) {
  const ecdh = createECDH("prime256v1");
  ecdh.setPrivateKey(b64UrlToBuffer(privateKey));
  return (
    Buffer.compare(ecdh.getPublicKey(null, "uncompressed"), b64UrlToBuffer(publicKey)) === 0
  );
}

function upsertVapidInFile(filePath, lines) {
  let text = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
  if (text && !text.endsWith("\n")) text += "\n";
  const kept = text
    .split(/\r?\n/)
    .filter((line) => !/^\s*VAPID_(PUBLIC_KEY|PRIVATE_KEY|SUBJECT)=/.test(line))
    .join("\n")
    .replace(/\n+$/, "");
  const next = (kept ? kept + "\n" : "") + lines.join("\n") + "\n";
  fs.writeFileSync(filePath, next, "utf8");
}

const root = process.cwd();
const keys = webpush.generateVAPIDKeys();
const subject = "mailto:support@sensitivitysettings.com";
const lines = [
  `VAPID_PUBLIC_KEY="${keys.publicKey}"`,
  `VAPID_PRIVATE_KEY="${keys.privateKey}"`,
  `VAPID_SUBJECT="${subject}"`,
];

if (!pairOk(keys.publicKey, keys.privateKey)) {
  console.error("FAIL: generated keys do not match (unexpected)");
  process.exit(1);
}

for (const name of [".env", ".env.production"]) {
  const filePath = path.join(root, name);
  upsertVapidInFile(filePath, lines);
  console.log("Updated", name);
}

console.log("PAIR_OK", pairOk(keys.publicKey, keys.privateKey));
console.log("Public prefix:", keys.publicKey.slice(0, 24));
console.log("Done — no manual paste needed.");
