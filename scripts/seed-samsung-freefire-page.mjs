import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();
const SLUG = "sensitivity-free-fire-headshot-samsung";

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

function siteOrigin() {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || "").trim().replace(/\/+$/, "");
  if (/^https?:\/\//i.test(raw) && !/localhost|127\.0\.0\.1/i.test(raw)) {
    return raw.replace("://www.", "://");
  }
  return "https://sensitivitysettings.com";
}

loadDotEnv(".env");
loadDotEnv(".env.local");

async function main() {
  const existing = await prisma.pageTemplate.findUnique({
    where: { slug: SLUG },
    select: { id: true },
  });
  if (existing) {
    console.log("Samsung page already in admin. Article left as saved.");
    return;
  }

  const filePath = path.join(process.cwd(), "scripts", "data", "samsung-freefire-page.json");
  const page = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const created = await prisma.pageTemplate.create({
    data: {
      title: page.title,
      slug: SLUG,
      status: "published",
      seoTitle: page.seoTitle,
      seoDescription: page.seoDescription,
      canonicalUrl: `${siteOrigin()}/${SLUG}`,
      ogImageUrl: page.ogImageUrl,
      publishAsNews: false,
      content: page.content,
    },
    select: { id: true, slug: true, status: true },
  });
  console.log(`Created Samsung page for admin: ${created.slug} (${created.status})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
