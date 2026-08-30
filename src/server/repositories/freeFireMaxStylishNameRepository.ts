import {
  cloneFreeFireMaxStylishNamePage,
  DEFAULT_FREE_FIRE_MAX_STYLISH_NAME_PAGE,
  FREE_FIRE_MAX_STYLISH_NAME_PATH,
  FREE_FIRE_MAX_STYLISH_NAME_SETTING_KEY,
} from "@/src/lib/freeFireMaxStylishNamePage";
import type { FreeFireStylishNamePageContent } from "@/src/lib/freeFireStylishNamePage";
import {
  cloneFreeFireStylishIdeaGroups,
  DEFAULT_FREE_FIRE_STYLISH_IDEA_GROUPS,
  type FreeFireStylishNameIdeaGroup,
  type FreeFireStylishNameIdeaItem,
} from "@/src/lib/freeFireStylishNameIdeasDefaults";
import { prisma, tryPrisma, tryPrismaLong } from "@/src/server/dbSafe";

const KEY = FREE_FIRE_MAX_STYLISH_NAME_SETTING_KEY;

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

type NameFaq = FreeFireStylishNamePageContent["faqs"][number];
type NameStep = FreeFireStylishNamePageContent["steps"][number];

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

function normalizeIdeaItem(raw: unknown, index: number): FreeFireStylishNameIdeaItem | null {
  if (!isPlainObject(raw)) return null;
  const value = sanitizeString(raw.value);
  const label = sanitizeString(raw.label) || value;
  if (!value) return null;
  return {
    id: sanitizeString(raw.id) || `idea-${index + 1}`,
    label,
    value,
  };
}

function normalizeIdeaGroup(raw: unknown, index: number): FreeFireStylishNameIdeaGroup | null {
  if (!isPlainObject(raw)) return null;
  const tab = sanitizeString(raw.tab) || `Tab ${index + 1}`;
  const itemsRaw = Array.isArray(raw.items) ? raw.items : [];
  const items = itemsRaw
    .map((row, i) => normalizeIdeaItem(row, i))
    .filter((row): row is FreeFireStylishNameIdeaItem => Boolean(row));
  if (!items.length) return null;
  return { tab, items };
}

export function normalizeFreeFireMaxStylishNamePage(raw: unknown): FreeFireStylishNamePageContent {
  const defaults = DEFAULT_FREE_FIRE_MAX_STYLISH_NAME_PAGE;
  if (!isPlainObject(raw)) return cloneFreeFireMaxStylishNamePage(defaults);

  const faqsRaw = Array.isArray(raw.faqs) ? raw.faqs : defaults.faqs;
  const faqs = faqsRaw
    .map((row, index) => normalizeFaq(row, index))
    .filter((row): row is NameFaq => Boolean(row));

  const stepsRaw = Array.isArray(raw.steps) ? raw.steps : defaults.steps;
  const steps = stepsRaw
    .map((row, index) => normalizeStep(row, index))
    .filter((row): row is NameStep => Boolean(row));

  const ideasRaw = Array.isArray(raw.ideaGroups) ? raw.ideaGroups : defaults.ideaGroups;
  const ideaGroups = ideasRaw
    .map((row, index) => normalizeIdeaGroup(row, index))
    .filter((row): row is FreeFireStylishNameIdeaGroup => Boolean(row));

  return {
    path: FREE_FIRE_MAX_STYLISH_NAME_PATH,
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
    ideaGroups: ideaGroups.length
      ? ideaGroups
      : cloneFreeFireStylishIdeaGroups(DEFAULT_FREE_FIRE_STYLISH_IDEA_GROUPS),
    articleHtml: sanitizeString(raw.articleHtml, defaults.articleHtml) || defaults.articleHtml,
    commentsLead:
      sanitizeString(raw.commentsLead, defaults.commentsLead) || defaults.commentsLead,
    faqTitle: sanitizeString(raw.faqTitle, defaults.faqTitle) || defaults.faqTitle,
    faqs: faqs.length ? faqs : defaults.faqs.map((f) => ({ ...f })),
    emptyStudioText:
      sanitizeString(raw.emptyStudioText, defaults.emptyStudioText) || defaults.emptyStudioText,
  };
}

export async function getFreeFireMaxStylishNamePage(): Promise<FreeFireStylishNamePageContent> {
  const row = await tryPrisma(async () => prisma.siteSetting.findUnique({ where: { key: KEY } }));
  if (row === null || !row?.value) return cloneFreeFireMaxStylishNamePage();
  return normalizeFreeFireMaxStylishNamePage(row.value);
}

export async function getFreeFireMaxStylishNamePageForAdmin(): Promise<{
  page: FreeFireStylishNamePageContent;
  usingDefault: boolean;
}> {
  const row = await tryPrisma(async () => prisma.siteSetting.findUnique({ where: { key: KEY } }));
  if (row === null || !row?.value) {
    return { page: cloneFreeFireMaxStylishNamePage(), usingDefault: true };
  }
  return { page: normalizeFreeFireMaxStylishNamePage(row.value), usingDefault: false };
}

export async function saveFreeFireMaxStylishNamePage(
  raw: unknown,
): Promise<{ page: FreeFireStylishNamePageContent; usingDefault: boolean }> {
  const page = normalizeFreeFireMaxStylishNamePage(raw);
  const saved = await tryPrismaLong(async () => {
    await prisma.siteSetting.upsert({
      where: { key: KEY },
      create: { key: KEY, value: page },
      update: { value: page },
    });
    return true;
  });
  if (saved === null && process.env.DATABASE_URL) throw new Error("DB_UNAVAILABLE");
  return { page, usingDefault: false };
}

export async function clearFreeFireMaxStylishNamePage(): Promise<{
  page: FreeFireStylishNamePageContent;
  usingDefault: boolean;
}> {
  const deleted = await tryPrismaLong(async () => {
    await prisma.siteSetting.deleteMany({ where: { key: KEY } });
    return true;
  });
  if (deleted === null && process.env.DATABASE_URL) throw new Error("DB_UNAVAILABLE");
  return { page: cloneFreeFireMaxStylishNamePage(), usingDefault: true };
}
