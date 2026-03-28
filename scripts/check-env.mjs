import fs from "fs";
import path from "path";

function loadDotEnv(fileName) {
  const filePath = path.join(process.cwd(), fileName);
  if (!fs.existsSync(filePath)) return;
  const raw = fs.readFileSync(filePath, "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let val = trimmed.slice(idx + 1).trim();
    if ((val.startsWith("\"") && val.endsWith("\"")) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadDotEnv(".env");
loadDotEnv(".env.local");

const required = [
  "DATABASE_URL",
  "SMTP_HOST",
  "SMTP_PORT",
  "VAPID_PUBLIC_KEY",
  "VAPID_PRIVATE_KEY",
  "MEDIA_PROVIDER",
  "MEDIA_BUCKET",
  "MEDIA_CDN_BASE_URL",
];

const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.log("Missing env keys:");
  missing.forEach((key) => console.log(`- ${key}`));
  process.exit(1);
}

console.log("All required production env keys are present.");
