import {
  PUBG_MOBILE_LITE_NAME_PATH,
  clonePubgMobileLiteNamePage,
  DEFAULT_PUBG_MOBILE_LITE_NAME_PAGE,
  type PubgMobileLiteNamePageContent,
} from "@/src/lib/pubgMobileLiteNamePage";
import { prisma, tryPrisma, tryPrismaLong } from "@/src/server/dbSafe";

export const PUBG_MOBILE_LITE_NAME_SETTING_KEY = "settings:pubgMobileLiteName";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function sanitizeString(value: unknown, fallback = ""): string {
  if (typeof value !== "string") return fallback;
  return value.trim();
}

function sanitizeStringList(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  const list = value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
  return list.length ? list : fallback;
}

type NameFaq = PubgMobileLiteNamePageContent["faqs"][number];
type NameStep = PubgMobileLiteNamePageContent["steps"][number];

function normalizeFaq(raw: unknown, index: number): NameFaq | null {
  if (!isPlainObject(raw)) return null;
  const question = sanitizeString(raw.question);
  const answer = sanitizeString(raw.answer);
  if (!question || !answer) return null;
  return { id: sanitizeString(raw.id) || `faq-${index + 1}`, question, answer };
}

function normalizeStep(raw: unknown, index: number): NameStep | null {
  if (!isPlainObject(raw)) return null;
  const title = sanitizeString(raw.title);
  const text = sanitizeString(raw.text);
  if (!title || !text) return null;
  return { title: title || `Step ${index + 1}`, text };
}

export function normalizePubgMobileLiteNamePage(raw: unknown): PubgMobileLiteNamePageContent {
  const defaults = DEFAULT_PUBG_MOBILE_LITE_NAME_PAGE;
  if (!isPlainObject(raw)) return clonePubgMobileLiteNamePage(defaults);

  const faqsRaw = Array.isArray(raw.faqs) ? raw.faqs : defaults.faqs;
  const faqs = faqsRaw
    .map((row, index) => normalizeFaq(row, index))
    .filter((row): row is NameFaq => Boolean(row));

  const stepsRaw = Array.isArray(raw.steps) ? raw.steps : defaults.steps;
  const steps = stepsRaw
    .map((row, index) => normalizeStep(row, index))
    .filter((row): row is NameStep => Boolean(row));

  return {
    path: PUBG_MOBILE_LITE_NAME_PATH,
    seoTitle: sanitizeString(raw.seoTitle, defaults.seoTitle) || defaults.seoTitle,
    seoDescription:
      sanitizeString(raw.seoDescription, defaults.seoDescription) || defaults.seoDescription,
    seoKeywords: sanitizeStringList(raw.seoKeywords, defaults.seoKeywords),
    title: sanitizeString(raw.title, defaults.title) || defaults.title,
    subtitle: sanitizeString(raw.subtitle, defaults.subtitle) || defaults.subtitle,
    tipText: sanitizeString(raw.tipText, defaults.tipText) || defaults.tipText,
    stepsHeading:
      sanitizeString(raw.stepsHeading, defaults.stepsHeading) || defaults.stepsHeading,
    steps: steps.length ? steps : defaults.steps.map((s) => ({ ...s })),
    ideasHeading:
      sanitizeString(raw.ideasHeading, defaults.ideasHeading) || defaults.ideasHeading,
    articleHtml: sanitizeString(raw.articleHtml, defaults.articleHtml) || defaults.articleHtml,
    commentsLead:
      sanitizeString(raw.commentsLead, defaults.commentsLead) || defaults.commentsLead,
    faqTitle: sanitizeString(raw.faqTitle, defaults.faqTitle) || defaults.faqTitle,
    faqs: faqs.length ? faqs : defaults.faqs.map((f) => ({ ...f })),
    emptyStudioText:
      sanitizeString(raw.emptyStudioText, defaults.emptyStudioText) || defaults.emptyStudioText,
  };
}

export async function getPubgMobileLiteNamePage(): Promise<PubgMobileLiteNamePageContent> {
  const row = await tryPrisma(async () =>
    prisma.siteSetting.findUnique({ where: { key: PUBG_MOBILE_LITE_NAME_SETTING_KEY } }),
  );
  if (row === null || !row?.value) return clonePubgMobileLiteNamePage();
  return normalizePubgMobileLiteNamePage(row.value);
}

export async function getPubgMobileLiteNamePageForAdmin(): Promise<{
  page: PubgMobileLiteNamePageContent;
  usingDefault: boolean;
}> {
  const row = await tryPrisma(async () =>
    prisma.siteSetting.findUnique({ where: { key: PUBG_MOBILE_LITE_NAME_SETTING_KEY } }),
  );
  if (row === null || !row?.value) {
    return { page: clonePubgMobileLiteNamePage(), usingDefault: true };
  }
  return { page: normalizePubgMobileLiteNamePage(row.value), usingDefault: false };
}

export async function savePubgMobileLiteNamePage(
  raw: unknown,
): Promise<{ page: PubgMobileLiteNamePageContent; usingDefault: boolean }> {
  const page = normalizePubgMobileLiteNamePage(raw);
  const saved = await tryPrismaLong(async () => {
    await prisma.siteSetting.upsert({
      where: { key: PUBG_MOBILE_LITE_NAME_SETTING_KEY },
      create: { key: PUBG_MOBILE_LITE_NAME_SETTING_KEY, value: page },
      update: { value: page },
    });
    return true;
  });
  if (saved === null && process.env.DATABASE_URL) throw new Error("DB_UNAVAILABLE");
  return { page, usingDefault: false };
}

export async function clearPubgMobileLiteNamePage(): Promise<{
  page: PubgMobileLiteNamePageContent;
  usingDefault: boolean;
}> {
  const deleted = await tryPrismaLong(async () => {
    await prisma.siteSetting.deleteMany({ where: { key: PUBG_MOBILE_LITE_NAME_SETTING_KEY } });
    return true;
  });
  if (deleted === null && process.env.DATABASE_URL) throw new Error("DB_UNAVAILABLE");
  return { page: clonePubgMobileLiteNamePage(), usingDefault: true };
}
