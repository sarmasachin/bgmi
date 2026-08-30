import {
  BGMI_LITE_STYLISH_NAME_PATH,
  cloneBgmiLiteStylishPage,
  DEFAULT_BGMI_LITE_STYLISH_PAGE,
  type BgmiLiteStylishNamePageContent,
} from "@/src/lib/bgmiLiteStylishNamePage";
import { prisma, tryPrisma, tryPrismaLong } from "@/src/server/dbSafe";

export const BGMI_LITE_STYLISH_SETTING_KEY = "settings:bgmiLiteStylishName";

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

type StylishFaq = BgmiLiteStylishNamePageContent["faqs"][number];
type StylishStep = BgmiLiteStylishNamePageContent["steps"][number];

function normalizeFaq(raw: unknown, index: number): StylishFaq | null {
  if (!isPlainObject(raw)) return null;
  const question = sanitizeString(raw.question);
  const answer = sanitizeString(raw.answer);
  if (!question || !answer) return null;
  return { id: sanitizeString(raw.id) || `faq-${index + 1}`, question, answer };
}

function normalizeStep(raw: unknown, index: number): StylishStep | null {
  if (!isPlainObject(raw)) return null;
  const title = sanitizeString(raw.title);
  const text = sanitizeString(raw.text);
  if (!title || !text) return null;
  return { title: title || `Step ${index + 1}`, text };
}

export function normalizeBgmiLiteStylishPage(raw: unknown): BgmiLiteStylishNamePageContent {
  const defaults = DEFAULT_BGMI_LITE_STYLISH_PAGE;
  if (!isPlainObject(raw)) return cloneBgmiLiteStylishPage(defaults);

  const faqsRaw = Array.isArray(raw.faqs) ? raw.faqs : defaults.faqs;
  const faqs = faqsRaw
    .map((row, index) => normalizeFaq(row, index))
    .filter((row): row is StylishFaq => Boolean(row));

  const stepsRaw = Array.isArray(raw.steps) ? raw.steps : defaults.steps;
  const steps = stepsRaw
    .map((row, index) => normalizeStep(row, index))
    .filter((row): row is StylishStep => Boolean(row));

  return {
    path: BGMI_LITE_STYLISH_NAME_PATH,
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
  };
}

export async function getBgmiLiteStylishPage(): Promise<BgmiLiteStylishNamePageContent> {
  const row = await tryPrisma(async () =>
    prisma.siteSetting.findUnique({ where: { key: BGMI_LITE_STYLISH_SETTING_KEY } }),
  );
  if (row === null || !row?.value) return cloneBgmiLiteStylishPage();
  return normalizeBgmiLiteStylishPage(row.value);
}

export async function getBgmiLiteStylishPageForAdmin(): Promise<{
  page: BgmiLiteStylishNamePageContent;
  usingDefault: boolean;
}> {
  const row = await tryPrisma(async () =>
    prisma.siteSetting.findUnique({ where: { key: BGMI_LITE_STYLISH_SETTING_KEY } }),
  );
  if (row === null || !row?.value) {
    return { page: cloneBgmiLiteStylishPage(), usingDefault: true };
  }
  return { page: normalizeBgmiLiteStylishPage(row.value), usingDefault: false };
}

export async function saveBgmiLiteStylishPage(
  raw: unknown,
): Promise<{ page: BgmiLiteStylishNamePageContent; usingDefault: boolean }> {
  const page = normalizeBgmiLiteStylishPage(raw);
  const saved = await tryPrismaLong(async () => {
    await prisma.siteSetting.upsert({
      where: { key: BGMI_LITE_STYLISH_SETTING_KEY },
      create: { key: BGMI_LITE_STYLISH_SETTING_KEY, value: page },
      update: { value: page },
    });
    return true;
  });
  if (saved === null && process.env.DATABASE_URL) throw new Error("DB_UNAVAILABLE");
  return { page, usingDefault: false };
}

export async function clearBgmiLiteStylishPage(): Promise<{
  page: BgmiLiteStylishNamePageContent;
  usingDefault: boolean;
}> {
  const deleted = await tryPrismaLong(async () => {
    await prisma.siteSetting.deleteMany({ where: { key: BGMI_LITE_STYLISH_SETTING_KEY } });
    return true;
  });
  if (deleted === null && process.env.DATABASE_URL) throw new Error("DB_UNAVAILABLE");
  return { page: cloneBgmiLiteStylishPage(), usingDefault: true };
}
