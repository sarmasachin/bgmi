/**
 * Local-only: seed dummy approved Free Fire testimonials for layout checks.
 *   node scripts/seed-dummy-testimonials.mjs
 *   node scripts/seed-dummy-testimonials.mjs 4   # 3+ triggers marquee
 */
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

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
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadDotEnv(".env");
loadDotEnv(".env.local");

const pool = [
  {
    name: "Pranjal Thakur",
    email: "pranjal.dummy@example.com",
    rating: 5,
    message: "Best Calculator 💯 working",
    phoneModel: "Poco X6",
    showName: true,
  },
  {
    name: "akrambarodi404@gmail.com",
    email: "akrambarodi404@gmail.com",
    rating: 5,
    message: "اريد حساسية خارقة فقط احمر وسريع ومكتملة فقط احر",
    phoneModel: null,
    showName: true,
  },
  {
    name: "Rahul Sharma",
    email: "rahul.dummy@example.com",
    rating: 5,
    message: "Sensi presets work well on my Redmi phone. Thanks!",
    phoneModel: "Redmi Note 13",
    showName: true,
  },
  {
    name: "Ayesha Khan",
    email: "ayesha.dummy@example.com",
    rating: 4,
    message: "Easy to use Free Fire calculator. Drag feel is good.",
    phoneModel: "iPhone 13",
    showName: true,
  },
  {
    name: "Vikram",
    email: "vikram.dummy@example.com",
    rating: 5,
    message: "Finally proper settings for 90 FPS. Working well.",
    phoneModel: "IQOO Neo 9",
    showName: true,
  },
];

async function main() {
  const count = Math.min(5, Math.max(1, Number(process.argv[2] || 2) || 2));
  const now = new Date();

  await prisma.testimonial.deleteMany({
    where: { email: { endsWith: "@example.com" } },
  });
  await prisma.testimonial.deleteMany({
    where: { email: "akrambarodi404@gmail.com", message: { contains: "اريد" } },
  });

  const rows = pool.slice(0, count).map((item) => ({
    ...item,
    game: "freefire",
    status: "approved",
    approvedAt: now,
  }));

  await prisma.testimonial.createMany({ data: rows });

  const approved = await prisma.testimonial.findMany({
    where: { status: "approved", game: "freefire" },
    orderBy: { approvedAt: "desc" },
    select: { name: true, message: true, rating: true },
  });

  console.log(`Seeded ${rows.length} dummy freefire testimonials (approved).`);
  console.log(
    approved.length < 3
      ? "Mode: STATIC row (<3) — check one-line layout"
      : "Mode: MARQUEE (3+) — check auto horizontal scroll",
  );
  console.table(approved);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
