import {
  defaultContactSeo,
  defaultNewsListingSeo,
  type ContactSeo,
  type ContactSeoTopic,
  type ContactTopicSeo,
  type NewsListingSeo,
} from "@/src/lib/listingSeoDefaults";
import { prisma, tryPrisma, tryPrismaLong } from "@/src/server/dbSafe";
import { bumpSitemapLastmod } from "@/src/server/repositories/sitemapLastmodRepository";

const NEWS_KEY = "settings:newsListingSeo";
const CONTACT_KEY = "settings:contactSeo";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function sanitizeTopic(raw: unknown, fallback: ContactTopicSeo): ContactTopicSeo {
  if (!isPlainObject(raw)) return fallback;
  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  const description = typeof raw.description === "string" ? raw.description.trim() : "";
  return {
    title: title || fallback.title,
    description: description || fallback.description,
  };
}

export function normalizeNewsListingSeo(raw: unknown): NewsListingSeo {
  if (!isPlainObject(raw)) return { ...defaultNewsListingSeo };
  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  const description = typeof raw.description === "string" ? raw.description.trim() : "";
  return {
    title: title || defaultNewsListingSeo.title,
    description: description || defaultNewsListingSeo.description,
  };
}

export function normalizeContactSeo(raw: unknown): ContactSeo {
  if (!isPlainObject(raw)) {
    return {
      general: { ...defaultContactSeo.general },
      report: { ...defaultContactSeo.report },
      feedback: { ...defaultContactSeo.feedback },
    };
  }
  return {
    general: sanitizeTopic(raw.general, defaultContactSeo.general),
    report: sanitizeTopic(raw.report, defaultContactSeo.report),
    feedback: sanitizeTopic(raw.feedback, defaultContactSeo.feedback),
  };
}

export async function getNewsListingSeo(): Promise<NewsListingSeo> {
  const row = await tryPrisma(async () => prisma.siteSetting.findUnique({ where: { key: NEWS_KEY } }));
  if (row === null || !row?.value) return { ...defaultNewsListingSeo };
  return normalizeNewsListingSeo(row.value);
}

export async function getNewsListingSeoForAdmin(): Promise<{
  seo: NewsListingSeo;
  usingDefault: boolean;
}> {
  const row = await tryPrisma(async () => prisma.siteSetting.findUnique({ where: { key: NEWS_KEY } }));
  if (row === null || !row?.value) {
    return { seo: { ...defaultNewsListingSeo }, usingDefault: true };
  }
  return { seo: normalizeNewsListingSeo(row.value), usingDefault: false };
}

export async function saveNewsListingSeo(
  raw: unknown,
): Promise<{ seo: NewsListingSeo; usingDefault: boolean }> {
  const seo = normalizeNewsListingSeo(raw);
  const saved = await tryPrismaLong(async () => {
    await prisma.siteSetting.upsert({
      where: { key: NEWS_KEY },
      create: { key: NEWS_KEY, value: seo },
      update: { value: seo },
    });
    return true;
  });
  if (saved === null && process.env.DATABASE_URL) throw new Error("DB_UNAVAILABLE");
  bumpSitemapLastmod(["/news"]);
  return { seo, usingDefault: false };
}

export async function getContactSeo(): Promise<ContactSeo> {
  const row = await tryPrisma(async () =>
    prisma.siteSetting.findUnique({ where: { key: CONTACT_KEY } }),
  );
  if (row === null || !row?.value) {
    return {
      general: { ...defaultContactSeo.general },
      report: { ...defaultContactSeo.report },
      feedback: { ...defaultContactSeo.feedback },
    };
  }
  return normalizeContactSeo(row.value);
}

export async function getContactSeoForAdmin(): Promise<{
  seo: ContactSeo;
  usingDefault: boolean;
}> {
  const row = await tryPrisma(async () =>
    prisma.siteSetting.findUnique({ where: { key: CONTACT_KEY } }),
  );
  if (row === null || !row?.value) {
    return {
      seo: {
        general: { ...defaultContactSeo.general },
        report: { ...defaultContactSeo.report },
        feedback: { ...defaultContactSeo.feedback },
      },
      usingDefault: true,
    };
  }
  return { seo: normalizeContactSeo(row.value), usingDefault: false };
}

export async function saveContactSeo(raw: unknown): Promise<{ seo: ContactSeo; usingDefault: boolean }> {
  const seo = normalizeContactSeo(raw);
  const saved = await tryPrismaLong(async () => {
    await prisma.siteSetting.upsert({
      where: { key: CONTACT_KEY },
      create: { key: CONTACT_KEY, value: seo },
      update: { value: seo },
    });
    return true;
  });
  if (saved === null && process.env.DATABASE_URL) throw new Error("DB_UNAVAILABLE");
  bumpSitemapLastmod(["/contact"]);
  return { seo, usingDefault: false };
}

export function isContactSeoTopic(value: unknown): value is ContactSeoTopic {
  return value === "general" || value === "report" || value === "feedback";
}
