import { prisma } from "@/src/server/dbSafe";

function normalizeTags(tags?: string[]) {
  const cleaned = (tags ?? [])
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  return Array.from(new Set(cleaned.length ? cleaned : ["all"]));
}

export type EmailSubscriberRow = {
  id: string;
  email: string;
  tags: string[];
  isActive: boolean;
  createdAt: string;
};

function mapRow(row: {
  id: string;
  email: string;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
}): EmailSubscriberRow {
  return {
    id: row.id,
    email: row.email,
    tags: row.tags,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function upsertEmailSubscriber(input: {
  email: string;
  tags?: string[];
  /**
   * When false (default for sync/track), never revive an admin-removed subscriber.
   * Footer/email opt-in should pass true so the user can subscribe again.
   */
  reactivate?: boolean;
}) {
  const email = input.email.trim().toLowerCase();
  const incoming = normalizeTags(input.tags);
  const reactivate = input.reactivate === true;
  if (!email) throw new Error("INVALID_EMAIL");

  try {
    const existing = await prisma.emailSubscriber.findUnique({ where: { email } });
    // Admin removed this email from campaigns — keep it out unless user opts in again.
    if (existing && !existing.isActive && !reactivate) {
      return mapRow(existing);
    }
    const tags = normalizeTags([...(existing?.tags ?? []), ...incoming]);
    const row = await prisma.emailSubscriber.upsert({
      where: { email },
      create: { email, tags, isActive: true },
      update: { tags, isActive: true },
    });
    return mapRow(row);
  } catch (error) {
    console.error("[email-sub] upsertEmailSubscriber failed:", error);
    throw new Error("DB_UNAVAILABLE");
  }
}

/** Best-effort: never throw to callers (rating/contact/etc. must not fail). */
export async function trackEmailForCampaigns(
  email: string | null | undefined,
  source: string,
) {
  const normalized = (email ?? "").trim().toLowerCase();
  if (!normalized || !normalized.includes("@")) return;
  try {
    await upsertEmailSubscriber({
      email: normalized,
      tags: ["all", source.trim().toLowerCase() || "site"],
      reactivate: false,
    });
  } catch (error) {
    console.warn("[email-sub] trackEmailForCampaigns skipped:", error);
  }
}

export async function listActiveEmailSubscribersForSegment(segment: string) {
  const seg = segment.trim().toLowerCase();
  try {
    const rows = await prisma.emailSubscriber.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
    if (!seg || seg === "all" || seg === "*") return rows;
    return rows.filter((row) =>
      row.tags.some((tag) => tag.trim().toLowerCase() === seg),
    );
  } catch (error) {
    console.error("[email-sub] listActiveEmailSubscribersForSegment failed:", error);
    throw new Error("DB_UNAVAILABLE");
  }
}

export async function countActiveEmailSubscribers() {
  try {
    return await prisma.emailSubscriber.count({ where: { isActive: true } });
  } catch (error) {
    console.error("[email-sub] countActiveEmailSubscribers failed:", error);
    throw new Error("DB_UNAVAILABLE");
  }
}

export async function listEmailSubscribers(limit = 300) {
  try {
    const rows = await prisma.emailSubscriber.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: Math.min(500, Math.max(1, limit)),
    });
    return rows.map(mapRow);
  } catch (error) {
    console.error("[email-sub] listEmailSubscribers failed:", error);
    throw new Error("DB_UNAVAILABLE");
  }
}

export async function deactivateEmailSubscriber(email: string) {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;
  try {
    await prisma.emailSubscriber.updateMany({
      where: { email: normalized },
      data: { isActive: false },
    });
    return true;
  } catch (error) {
    console.error("[email-sub] deactivateEmailSubscriber failed:", error);
    throw new Error("DB_UNAVAILABLE");
  }
}

/**
 * Pull emails already saved elsewhere on the site into EmailSubscriber
 * so Campaign Management can list + email all of them.
 */
export async function syncSiteEmailsIntoSubscribers() {
  try {
    const [ratings, testimonials, contacts, comments] = await Promise.all([
      prisma.homeRating.findMany({
        where: { email: { not: null } },
        select: { email: true },
        orderBy: { createdAt: "desc" },
        take: 500,
      }),
      prisma.testimonial.findMany({
        where: { email: { not: null } },
        select: { email: true },
        orderBy: { createdAt: "desc" },
        take: 500,
      }),
      prisma.contactMessage.findMany({
        select: { email: true },
        orderBy: { createdAt: "desc" },
        take: 500,
      }),
      prisma.pageComment.findMany({
        where: { email: { not: null } },
        select: { email: true },
        orderBy: { createdAt: "desc" },
        take: 500,
      }),
    ]);

    const jobs: Array<Promise<unknown>> = [];
    for (const row of ratings) {
      if (row.email) jobs.push(trackEmailForCampaigns(row.email, "rating"));
    }
    for (const row of testimonials) {
      if (row.email) jobs.push(trackEmailForCampaigns(row.email, "testimonial"));
    }
    for (const row of contacts) {
      if (row.email) jobs.push(trackEmailForCampaigns(row.email, "contact"));
    }
    for (const row of comments) {
      if (row.email) jobs.push(trackEmailForCampaigns(row.email, "comment"));
    }
    await Promise.all(jobs);
  } catch (error) {
    console.warn("[email-sub] syncSiteEmailsIntoSubscribers failed:", error);
  }
}
