import { performance } from "node:perf_hooks";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: [] });

async function measure(label, fn) {
  const t0 = performance.now();
  try {
    await fn();
    console.log(`${label}: OK ${Math.round(performance.now() - t0)}ms`);
  } catch (e) {
    console.log(`${label}: FAIL ${Math.round(performance.now() - t0)}ms`);
    console.log(`  ${e.message.split("\n")[0]}`);
  }
}

await measure("single findUnique", () => prisma.siteSetting.findUnique({ where: { key: "settings:seo" } }));
await measure("findMany settings", () =>
  prisma.siteSetting.findMany({ where: { key: { in: ["settings:seo", "settings:theme", "settings:navigation"] } } }),
);
await measure("homeRating aggregate", () => prisma.homeRating.aggregate({ _avg: { value: true }, _count: { value: true } }));

await prisma.$disconnect();
