import {
  cloneFreeFireMaxRedeemPage,
  DEFAULT_FREE_FIRE_MAX_REDEEM_PAGE,
  FREE_FIRE_MAX_REDEEM_SETTINGS_KEY,
} from "@/src/lib/freeFireMaxRedeemCodes";
import {
  type FreeFireRedeemCodeItem,
  type FreeFireRedeemCodePageContent,
  type FreeFireRedeemFaqItem,
} from "@/src/lib/freeFireRedeemCodes";
import {
  DEFAULT_FREE_FIRE_REDEEM_UI,
  type FreeFireRedeemUiLabels,
} from "@/src/lib/freeFireRedeemUiDefaults";
import {
  coerceFreeFireRedeemServer,
  normalizeRedeemServersList,
  type FreeFireRedeemServerConfig,
} from "@/src/lib/freeFireRedeemServers";
import { attachRedeemScheduleFromRaw } from "@/src/lib/redeemCodeSchedule";
import { prisma, tryPrismaLong } from "@/src/server/dbSafe";

const KEY = FREE_FIRE_MAX_REDEEM_SETTINGS_KEY;

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

function normalizeCode(
  raw: unknown,
  index: number,
  servers: FreeFireRedeemServerConfig[],
): FreeFireRedeemCodeItem | null {
  if (!isPlainObject(raw)) return null;
  const title = sanitizeString(raw.title);
  const code = sanitizeString(raw.code);
  if (!title || !code) return null;
  const statusRaw = sanitizeString(raw.status, "live").toLowerCase();
  const status: "live" | "expired" = statusRaw === "expired" ? "expired" : "live";
  const id = sanitizeString(raw.id) || slugId(title, code, index);
  const item: FreeFireRedeemCodeItem = {
    id,
    title,
    code,
    status,
    server: coerceFreeFireRedeemServer(raw.server, servers),
  };
  attachRedeemScheduleFromRaw(item, raw, sanitizeString);
  return item;
}

function normalizeFaq(raw: unknown, index: number): FreeFireRedeemFaqItem | null {
  if (!isPlainObject(raw)) return null;
  const question = sanitizeString(raw.question);
  const answer = sanitizeString(raw.answer);
  if (!question || !answer) return null;
  const id = sanitizeString(raw.id) || `faq-${index + 1}`;
  return { id, question, answer };
}

function normalizeUi(raw: unknown): FreeFireRedeemUiLabels {
  const defaults = DEFAULT_FREE_FIRE_MAX_REDEEM_PAGE.ui;
  const src = isPlainObject(raw) ? raw : {};
  const pick = (key: keyof FreeFireRedeemUiLabels) =>
    sanitizeString(src[key], defaults[key]) || defaults[key] || DEFAULT_FREE_FIRE_REDEEM_UI[key];
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

export function normalizeFreeFireMaxRedeemPage(raw: unknown): FreeFireRedeemCodePageContent {
  const defaults = DEFAULT_FREE_FIRE_MAX_REDEEM_PAGE;
  if (!isPlainObject(raw)) return cloneFreeFireMaxRedeemPage(defaults);

  const hasServersField = Array.isArray(raw.servers);
  const servers = normalizeRedeemServersList(hasServersField ? raw.servers : defaults.servers);

  const hasCodesField = Array.isArray(raw.codes);
  const codes = (hasCodesField ? raw.codes : defaults.codes)
    .map((row, index) => normalizeCode(row, index, servers))
    .filter((row): row is FreeFireRedeemCodeItem => Boolean(row));

  const hasFaqsField = Array.isArray(raw.faqs);
  const faqs = (hasFaqsField ? raw.faqs : defaults.faqs)
    .map((row, index) => normalizeFaq(row, index))
    .filter((row): row is FreeFireRedeemFaqItem => Boolean(row));

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
    servers: hasServersField ? servers : defaults.servers.map((s) => ({ ...s })),
    faqs: hasFaqsField ? faqs : defaults.faqs.map((f) => ({ ...f })),
    // Allow saving an empty list — do not revive built-in dummy codes.
    codes: hasCodesField ? codes : defaults.codes.map((c) => ({ ...c })),
  };
}

export async function getFreeFireMaxRedeemPage(): Promise<FreeFireRedeemCodePageContent> {
  const row = await tryPrismaLong(async () =>
    prisma.siteSetting.findUnique({ where: { key: KEY } }),
  );
  if (row === null || !row?.value) {
    return cloneFreeFireMaxRedeemPage();
  }
  return normalizeFreeFireMaxRedeemPage(row.value);
}

export async function getFreeFireMaxRedeemUpdatedAt(): Promise<Date | null> {
  const row = await tryPrismaLong(async () =>
    prisma.siteSetting.findUnique({
      where: { key: KEY },
      select: { updatedAt: true },
    }),
  );
  return row?.updatedAt ?? null;
}

export async function getFreeFireMaxRedeemPageForAdmin(): Promise<{
  page: FreeFireRedeemCodePageContent;
  usingDefault: boolean;
}> {
  const row = await tryPrismaLong(async () =>
    prisma.siteSetting.findUnique({ where: { key: KEY } }),
  );
  if (row === null || !row?.value) {
    return { page: cloneFreeFireMaxRedeemPage(), usingDefault: true };
  }
  return { page: normalizeFreeFireMaxRedeemPage(row.value), usingDefault: false };
}

export async function saveFreeFireMaxRedeemPage(
  raw: unknown,
): Promise<{ page: FreeFireRedeemCodePageContent; usingDefault: boolean }> {
  const page = normalizeFreeFireMaxRedeemPage(raw);
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

export async function clearFreeFireMaxRedeemPage(): Promise<{
  page: FreeFireRedeemCodePageContent;
  usingDefault: boolean;
}> {
  const deleted = await tryPrismaLong(async () => {
    await prisma.siteSetting.deleteMany({ where: { key: KEY } });
    return true;
  });
  if (deleted === null && process.env.DATABASE_URL) throw new Error("DB_UNAVAILABLE");
  return { page: cloneFreeFireMaxRedeemPage(), usingDefault: true };
}
