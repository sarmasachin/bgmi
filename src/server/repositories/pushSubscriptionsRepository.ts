import { prisma } from "@/src/server/dbSafe";

function normalizeTags(tags?: string[]) {
  const cleaned = (tags ?? [])
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  return Array.from(new Set(cleaned.length ? cleaned : ["all"]));
}

export async function upsertPushSubscription(input: {
  endpoint: string;
  p256dh: string;
  auth: string;
  tags?: string[];
}) {
  const endpoint = input.endpoint.trim();
  const p256dh = input.p256dh.trim();
  const auth = input.auth.trim();
  const tags = normalizeTags(input.tags);
  if (!endpoint || !p256dh || !auth) throw new Error("INVALID_SUBSCRIPTION");

  try {
    return await prisma.pushSubscription.upsert({
      where: { endpoint },
      create: { endpoint, p256dh, auth, tags },
      update: { p256dh, auth, tags },
    });
  } catch (error) {
    console.error("[push] upsertPushSubscription failed:", error);
    throw new Error("DB_UNAVAILABLE");
  }
}

export async function listPushSubscriptionsForSegment(segment: string) {
  const seg = segment.trim().toLowerCase();
  try {
    const rows = await prisma.pushSubscription.findMany({
      orderBy: { createdAt: "desc" },
    });
    if (!seg || seg === "all" || seg === "*") return rows;
    return rows.filter((row) =>
      row.tags.some((tag) => tag.trim().toLowerCase() === seg),
    );
  } catch (error) {
    console.error("[push] listPushSubscriptionsForSegment failed:", error);
    throw new Error("DB_UNAVAILABLE");
  }
}

export async function countPushSubscriptions() {
  try {
    return await prisma.pushSubscription.count();
  } catch (error) {
    console.error("[push] countPushSubscriptions failed:", error);
    throw new Error("DB_UNAVAILABLE");
  }
}

export async function deletePushSubscriptionByEndpoint(endpoint: string) {
  try {
    await prisma.pushSubscription.deleteMany({ where: { endpoint } });
  } catch (error) {
    console.error("[push] deletePushSubscriptionByEndpoint failed:", error);
  }
}
