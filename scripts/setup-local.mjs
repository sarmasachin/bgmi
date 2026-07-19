import fs from "fs";
import path from "path";
import crypto from "crypto";
import webpush from "web-push";

const envPath = path.join(process.cwd(), ".env.local");
const keys = webpush.generateVAPIDKeys();

const sessionSecret = crypto.randomBytes(32).toString("hex");

const content = `DATABASE_URL="postgresql://postgres:postgres@localhost:5433/bgmi"
SESSION_SECRET="${sessionSecret}"
SMTP_HOST="localhost"
SMTP_PORT="1025"
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM="no-reply@localhost"
VAPID_PUBLIC_KEY="${keys.publicKey}"
VAPID_PRIVATE_KEY="${keys.privateKey}"
VAPID_SUBJECT="mailto:admin@example.com"
MEDIA_PROVIDER="s3"
MEDIA_BUCKET="bgmi-media"
MEDIA_CDN_BASE_URL="http://localhost:9000/bgmi-media"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
`;

fs.writeFileSync(envPath, content, "utf8");
console.log(".env.local created with local defaults.");
console.log("Next steps:");
console.log("1) docker compose up -d");
console.log("2) npm run prisma:push");
console.log("3) npm run seed:admin");
console.log("4) npm run dev");
