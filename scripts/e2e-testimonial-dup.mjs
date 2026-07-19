/**
 * E2E: prove how many Testimonial rows one submit / double-submit creates.
 * Run: npx tsx scripts/e2e-testimonial-dup.mjs
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const BASE = process.env.E2E_BASE_URL || "http://127.0.0.1:3000";
const prisma = new PrismaClient();

const marker = `e2e-dup-${Date.now()}`;

async function countByMessage(message) {
  return prisma.testimonial.count({ where: { message } });
}

async function listByMessage(message) {
  return prisma.testimonial.findMany({
    where: { message },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, status: true, createdAt: true },
  });
}

async function postOnce(payload) {
  const res = await fetch(`${BASE}/api/testimonials`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

async function main() {
  console.log("BASE", BASE);
  console.log("marker", marker);

  // --- Case A: single submit ---
  const msgA = `${marker}-single`;
  const beforeA = await countByMessage(msgA);
  const single = await postOnce({
    name: "E2E Single",
    rating: 5,
    message: msgA,
    game: "bgmi",
    phoneModel: "E2E Phone",
    showName: true,
  });
  await new Promise((r) => setTimeout(r, 500));
  const afterA = await countByMessage(msgA);
  const rowsA = await listByMessage(msgA);

  console.log("\n=== CASE A: single POST ===");
  console.log("response", single.status, single.json);
  console.log("rows before→after", beforeA, "→", afterA);
  console.log("ids", rowsA.map((r) => r.id));
  console.log("PASS single creates exactly 1?", afterA - beforeA === 1);

  // --- Case B: parallel double POST (double-click simulation) ---
  const msgB = `${marker}-double`;
  const beforeB = await countByMessage(msgB);
  const payloadB = {
    name: "E2E Double",
    rating: 4,
    message: msgB,
    game: "bgmi",
    phoneModel: null,
    showName: true,
  };
  const [r1, r2] = await Promise.all([postOnce(payloadB), postOnce(payloadB)]);
  await new Promise((r) => setTimeout(r, 800));
  const afterB = await countByMessage(msgB);
  const rowsB = await listByMessage(msgB);

  console.log("\n=== CASE B: parallel double POST ===");
  console.log("response1", r1.status, r1.json);
  console.log("response2", r2.status, r2.json);
  console.log("rows before→after", beforeB, "→", afterB);
  console.log("ids", rowsB.map((r) => r.id));
  console.log("created delta", afterB - beforeB);
  console.log("PASS double creates exactly 1?", afterB - beforeB === 1);

  // --- Case C: sequential double POST (retry / impatient second click) ---
  const msgC = `${marker}-seq`;
  const beforeC = await countByMessage(msgC);
  const payloadC = {
    name: "E2E Seq",
    rating: 3,
    message: msgC,
    game: "pubg",
    phoneModel: "Seq",
    showName: false,
  };
  const s1 = await postOnce(payloadC);
  const s2 = await postOnce(payloadC);
  await new Promise((r) => setTimeout(r, 500));
  const afterC = await countByMessage(msgC);
  const rowsC = await listByMessage(msgC);

  console.log("\n=== CASE C: sequential double POST ===");
  console.log("response1", s1.status, s1.json);
  console.log("response2", s2.status, s2.json);
  console.log("rows before→after", beforeC, "→", afterC);
  console.log("ids", rowsC.map((r) => r.id));
  console.log("same id returned?", s1.json?.id && s1.json.id === s2.json.id);
  console.log("PASS seq creates exactly 1?", afterC - beforeC === 1);

  // --- Existing duplicate clusters in DB (real data) ---
  const recent = await prisma.testimonial.findMany({
    orderBy: { createdAt: "desc" },
    take: 80,
    select: {
      id: true,
      name: true,
      message: true,
      rating: true,
      game: true,
      status: true,
      createdAt: true,
    },
  });
  const clusters = new Map();
  for (const row of recent) {
    const key = `${row.name}|${row.rating}|${row.message}|${row.game}`;
    if (!clusters.has(key)) clusters.set(key, []);
    clusters.get(key).push(row);
  }
  const dups = [...clusters.entries()].filter(([, rows]) => rows.length > 1);

  console.log("\n=== EXISTING DUPLICATE CLUSTERS (last 80 rows) ===");
  console.log("duplicate groups found:", dups.length);
  for (const [key, rows] of dups.slice(0, 10)) {
    const times = rows.map((r) => r.createdAt.toISOString());
    const gapsMs = [];
    for (let i = 1; i < rows.length; i++) {
      gapsMs.push(rows[i].createdAt.getTime() - rows[0].createdAt.getTime());
    }
    console.log({
      count: rows.length,
      status: rows.map((r) => r.status),
      times,
      gapFromFirstMs: gapsMs,
      preview: key.slice(0, 120),
    });
  }

  // cleanup e2e rows
  await prisma.testimonial.deleteMany({
    where: { message: { startsWith: marker } },
  });
  console.log("\nCleaned e2e rows with marker", marker);

  const allPass =
    afterA - beforeA === 1 && afterB - beforeB === 1 && afterC - beforeC === 1;
  console.log("\n=== SUMMARY ===");
  console.log(allPass ? "ALL PASS" : "FAIL — duplicates still possible");
  process.exit(allPass ? 0 : 1);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
