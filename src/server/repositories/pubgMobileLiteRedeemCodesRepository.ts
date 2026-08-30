import {
  clonePubgMobileLiteRedeemPage,
  DEFAULT_PUBG_MOBILE_LITE_REDEEM_PAGE,
  type PubgMobileLiteRedeemCodeItem,
  type PubgMobileLiteRedeemCodePageContent,
  type PubgMobileLiteRedeemFaqItem,
} from "@/src/lib/pubgMobileLiteRedeemCodes";
import {
  DEFAULT_PUBG_MOBILE_LITE_REDEEM_UI,
  type PubgMobileLiteRedeemUiLabels,
} from "@/src/lib/pubgMobileLiteRedeemUiDefaults";
import { prisma, tryPrisma, tryPrismaLong } from "@/src/server/dbSafe";

const KEY = "settings:pubgMobileLiteRedeemCodes";

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

function slugId(title: string, code: string, index: number): string {
  const base = `${title}-${code}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return base || `code-${index + 1}`;
}

function normalizeCode(raw: unknown, index: number): PubgMobileLiteRedeemCodeItem | null {
  if (!isPlainObject(raw)) return null;
  const title = sanitizeString(raw.title);
  const code = sanitizeString(raw.code);
  if (!title || !code) return null;
  const statusRaw = sanitizeString(raw.status, "live").toLowerCase();
  const status: "live" | "expired" = statusRaw === "expired" ? "expired" : "live";
  const id = sanitizeString(raw.id) || slugId(title, code, index);
  const item: PubgMobileLiteRedeemCodeItem = { id, title, code, status };
  const releasedLabel = sanitizeString(raw.releasedLabel);
  const expiresLabel = sanitizeString(raw.expiresLabel);
  const expiredOnLabel = sanitizeString(raw.expiredOnLabel);
  if (releasedLabel) item.releasedLabel = releasedLabel;
  if (expiresLabel) item.expiresLabel = expiresLabel;
  if (expiredOnLabel) item.expiredOnLabel = expiredOnLabel;
  return item;
}

function normalizeFaq(raw: unknown, index: number): PubgMobileLiteRedeemFaqItem | null {
  if (!isPlainObject(raw)) return null;
  const question = sanitizeString(raw.question);
  const answer = sanitizeString(raw.answer);
  if (!question || !answer) return null;
  const id = sanitizeString(raw.id) || `faq-${index + 1}`;
  return { id, question, answer };
}

function normalizeUi(raw: unknown): PubgMobileLiteRedeemUiLabels {
  const defaults = DEFAULT_PUBG_MOBILE_LITE_REDEEM_UI;
  const src = isPlainObject(raw) ? raw : {};
  const pick = (key: keyof PubgMobileLiteRedeemUiLabels) =>
    sanitizeString(src[key], defaults[key]) || defaults[key];
  return {
    liveBadge: pick("liveBadge"),
    expiredBadge: pick("expiredBadge"),
    inactiveLabel: pick("inactiveLabel"),
    copyLabel: pick("copyLabel"),
    copiedLabel: pick("copiedLabel"),
    copyFailedLabel: pick("copyFailedLabel"),
    copyAriaCopied: pick("copyAriaCopied"),
    copyAriaFailed: pick("copyAriaFailed"),
    copyHint: pick("copyHint"),
    expiredStatusLabel: pick("expiredStatusLabel"),
    loadMoreLive: pick("loadMoreLive"),
    loadMoreExpired: pick("loadMoreExpired"),
    emptyLiveToday: pick("emptyLiveToday"),
    emptyLiveIdle: pick("emptyLiveIdle"),
    emptyExpired: pick("emptyExpired"),
    freshnessIdleTitle: pick("freshnessIdleTitle"),
    freshnessIdleText: pick("freshnessIdleText"),
    updatedLabelPrefix: pick("updatedLabelPrefix"),
    faqTitle: pick("faqTitle"),
    breadcrumbName: pick("breadcrumbName"),
    socialImage: pick("socialImage"),
    socialImageAlt: pick("socialImageAlt"),
  };
}

export function normalizePubgMobileLiteRedeemPage(
  raw: unknown,
): PubgMobileLiteRedeemCodePageContent {
  const defaults = DEFAULT_PUBG_MOBILE_LITE_REDEEM_PAGE;
  if (!isPlainObject(raw)) return clonePubgMobileLiteRedeemPage(defaults);

  const codesRaw = Array.isArray(raw.codes) ? raw.codes : defaults.codes;
  const codes = codesRaw
    .map((row, index) => normalizeCode(row, index))
    .filter((row): row is PubgMobileLiteRedeemCodeItem => Boolean(row));

  const faqsRaw = Array.isArray(raw.faqs) ? raw.faqs : defaults.faqs;
  const faqs = faqsRaw
    .map((row, index) => normalizeFaq(row, index))
    .filter((row): row is PubgMobileLiteRedeemFaqItem => Boolean(row));

  return {
    path: defaults.path,
    seoTitle: sanitizeString(raw.seoTitle, defaults.seoTitle) || defaults.seoTitle,
    seoDescription:
      sanitizeString(raw.seoDescription, defaults.seoDescription) || defaults.seoDescription,
    seoKeywords: sanitizeStringList(raw.seoKeywords, defaults.seoKeywords),
    title: sanitizeString(raw.title, defaults.title) || defaults.title,
    intro: sanitizeString(raw.intro, defaults.intro) || defaults.intro,
    sectionHeading:
      sanitizeString(raw.sectionHeading, defaults.sectionHeading) || defaults.sectionHeading,
    archiveHeading:
      sanitizeString(raw.archiveHeading, defaults.archiveHeading) || defaults.archiveHeading,
    closing: sanitizeString(raw.closing, defaults.closing) || defaults.closing,
    articleHtml: sanitizeString(raw.articleHtml, defaults.articleHtml) || defaults.articleHtml,
    commentsLead:
      sanitizeString(raw.commentsLead, defaults.commentsLead) || defaults.commentsLead,
    ui: normalizeUi(raw.ui),
    faqs: faqs.length ? faqs : defaults.faqs.map((f) => ({ ...f })),
    codes: codes.length ? codes : defaults.codes.map((c) => ({ ...c })),
  };
}

export async function getPubgMobileLiteRedeemPage(): Promise<PubgMobileLiteRedeemCodePageContent> {
  const row = await tryPrisma(async () => prisma.siteSetting.findUnique({ where: { key: KEY } }));
  if (row === null || !row?.value) {
    return clonePubgMobileLiteRedeemPage();
  }
  return normalizePubgMobileLiteRedeemPage(row.value);
}

export async function getPubgMobileLiteRedeemUpdatedAt(): Promise<Date | null> {
  const row = await tryPrismaLong(async () =>
    prisma.siteSetting.findUnique({
      where: { key: KEY },
      select: { updatedAt: true },
    }),
  );
  return row?.updatedAt ?? null;
}

export async function getPubgMobileLiteRedeemPageForAdmin(): Promise<{
  page: PubgMobileLiteRedeemCodePageContent;
  usingDefault: boolean;
}> {
  const row = await tryPrisma(async () => prisma.siteSetting.findUnique({ where: { key: KEY } }));
  if (row === null || !row?.value) {
    return { page: clonePubgMobileLiteRedeemPage(), usingDefault: true };
  }
  return { page: normalizePubgMobileLiteRedeemPage(row.value), usingDefault: false };
}

export async function savePubgMobileLiteRedeemPage(
  raw: unknown,
): Promise<{ page: PubgMobileLiteRedeemCodePageContent; usingDefault: boolean }> {
  const page = normalizePubgMobileLiteRedeemPage(raw);
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

export async function clearPubgMobileLiteRedeemPage(): Promise<{
  page: PubgMobileLiteRedeemCodePageContent;
  usingDefault: boolean;
}> {
  const deleted = await tryPrismaLong(async () => {
    await prisma.siteSetting.deleteMany({ where: { key: KEY } });
    return true;
  });
  if (deleted === null && process.env.DATABASE_URL) throw new Error("DB_UNAVAILABLE");
  return { page: clonePubgMobileLiteRedeemPage(), usingDefault: true };
}
