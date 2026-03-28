import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

const SLOTS = [
  { slotKey: "home_above_calculator", title: "Home — above calculator" },
  { slotKey: "home_between_tool_and_article", title: "Home — between tool & article" },
  { slotKey: "news_list_top", title: "News list — top" },
  { slotKey: "news_list_bottom", title: "News list — bottom" },
  { slotKey: "news_detail_top", title: "News article — below title" },
  { slotKey: "news_detail_mid", title: "News article — below content" },
  { slotKey: "news_detail_bottom", title: "News article — above rating" },
];

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

async function main() {
  for (const s of SLOTS) {
    await prisma.adSlot.upsert({
      where: { slotKey: s.slotKey },
      create: { slotKey: s.slotKey, title: s.title, code: null, isEnabled: false },
      update: {},
    });
  }
  console.log(`Upserted ${SLOTS.length} ad slots.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
