import { getDefaultAdvanceServerPage } from "@/src/lib/ffAdvanceServerPage";
import type {
  FfAdvanceServerPageContent,
  FfAsPageCard,
  FfAsPageFaq,
  FfAsPageTable,
} from "@/src/lib/advanceServerPageTypes";
import { prisma, tryPrisma, tryPrismaLong } from "@/src/server/dbSafe";

const KEY = "settings:advanceServerPage";

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

function findRawByIdOrTitle(list: unknown[], def: { id: string; title: string }): unknown {
  const byId = list.find((item) => isPlainObject(item) && item.id === def.id);
  if (byId) return byId;
  return list.find((item) => isPlainObject(item) && item.title === def.title);
}

function normalizeCard(raw: unknown, def: FfAsPageCard): FfAsPageCard {
  const row = isPlainObject(raw) ? raw : {};
  const out: FfAsPageCard = {
    id: def.id,
    badge: sanitizeString(row.badge, def.badge) || def.badge,
    icon: sanitizeString(row.icon, def.icon) || def.icon,
    title: sanitizeString(row.title, def.title) || def.title,
    summary: sanitizeString(row.summary, def.summary) || def.summary,
    points: sanitizeStringList(row.points, def.points),
  };

  if (def.pros) {
    out.pros = sanitizeStringList(row.pros, def.pros);
  }
  if (def.cons) {
    out.cons = sanitizeStringList(row.cons, def.cons);
  }
  if (def.links) {
    const linksRaw = Array.isArray(row.links) ? row.links : def.links;
    out.links = def.links.map((linkDef, index) => {
      const linkRow = isPlainObject(linksRaw[index]) ? linksRaw[index] : {};
      return {
        label: sanitizeString(linkRow.label, linkDef.label) || linkDef.label,
        href: sanitizeString(linkRow.href, linkDef.href) || linkDef.href,
      };
    });
  }

  return out;
}

function normalizeTable(raw: unknown, def: FfAsPageTable): FfAsPageTable {
  const row = isPlainObject(raw) ? raw : {};
  const columnsRaw = Array.isArray(row.columns) ? row.columns : def.columns;
  const columns = def.columns.map((colDef, index) => {
    const cell = columnsRaw[index];
    return sanitizeString(cell, colDef) || colDef;
  });

  const rowsRaw = Array.isArray(row.rows) ? row.rows : def.rows;
  const rows = def.rows.map((rowDef, rowIndex) => {
    const cellsRaw = Array.isArray(rowsRaw[rowIndex]) ? rowsRaw[rowIndex] : rowDef;
    return rowDef.map((cellDef, cellIndex) => {
      const cell = Array.isArray(cellsRaw) ? cellsRaw[cellIndex] : cellDef;
      return sanitizeString(cell, cellDef) || cellDef;
    });
  });

  return {
    id: def.id,
    badge: sanitizeString(row.badge, def.badge) || def.badge,
    icon: sanitizeString(row.icon, def.icon) || def.icon,
    title: sanitizeString(row.title, def.title) || def.title,
    summary: sanitizeString(row.summary, def.summary) || def.summary,
    columns,
    rows,
  };
}

function normalizeFaq(raw: unknown, def: FfAsPageFaq): FfAsPageFaq {
  const row = isPlainObject(raw) ? raw : {};
  return {
    id: def.id,
    question: sanitizeString(row.question, def.question) || def.question,
    answer: sanitizeString(row.answer, def.answer) || def.answer,
  };
}

export function normalizeAdvanceServerPage(raw: unknown): FfAdvanceServerPageContent {
  const defaults = getDefaultAdvanceServerPage();
  if (!isPlainObject(raw)) return defaults;

  const heroLayoutRaw = sanitizeString(raw.heroLayout, defaults.heroLayout);
  const heroLayout = heroLayoutRaw === "center" ? "center" : "split";

  const pillsRaw = Array.isArray(raw.pills) ? raw.pills : defaults.pills;
  const countdownRaw = isPlainObject(raw.countdown) ? raw.countdown : {};
  const cardsRaw = Array.isArray(raw.cards) ? raw.cards : defaults.cards;
  const tablesRaw = Array.isArray(raw.tables) ? raw.tables : defaults.tables;
  const faqsRaw = Array.isArray(raw.faqs) ? raw.faqs : defaults.faqs;

  const seoTitleRaw = sanitizeString(raw.seoTitle, defaults.seoTitle) || defaults.seoTitle;
  const subtitleRaw = sanitizeString(raw.subtitleEn, defaults.subtitleEn) || defaults.subtitleEn;
  const heroTitleRaw = sanitizeString(raw.heroTitle, defaults.heroTitle) || defaults.heroTitle;
  const subtitleEn = /^Garena opens\b/i.test(subtitleRaw) ? defaults.subtitleEn : subtitleRaw;

  /** Soft-migrate old APK / short / soft-guide titles to the current hero title. */
  const looksLikeLegacyTitle =
    /apk\s*download|download\s*apk|fan-made info guide|Advance Server Guide \| What It Is|FREE FIRE ADVANCE SERVER/i.test(
      `${seoTitleRaw} ${heroTitleRaw}`,
    );
  const rawJson = JSON.stringify(raw);
  const hasPublisherUrl = /garena\.com|ff-advance\.ff|Official Garena/i.test(rawJson);
  /** Soft-migrate “how to get / download APK” style copy that looks like a download hub. */
  const looksLikeLegacyRiskyCopy =
    /How do I get an activation code|Where do I download the Advance Server APK|How to Download and Install Free Fire Advance Server APK|How to Access Advance Server Activation Code|Get Activation Code|OB55 Download APK|Download APK:/i.test(
      rawJson,
    );
  const heroTitle = looksLikeLegacyTitle ? defaults.heroTitle : heroTitleRaw;
  const seoTitle = looksLikeLegacyTitle ? defaults.seoTitle : seoTitleRaw;
  const useContentDefaults = hasPublisherUrl || looksLikeLegacyRiskyCopy;
  const seoDescriptionRaw =
    sanitizeString(raw.seoDescription, defaults.seoDescription) || defaults.seoDescription;
  const seoDescription =
    useContentDefaults || /Download APK|Get Activation Code|OB55 APK Download/i.test(seoDescriptionRaw)
      ? defaults.seoDescription
      : seoDescriptionRaw;
  const seoKeywords = useContentDefaults
    ? defaults.seoKeywords
    : sanitizeStringList(raw.seoKeywords, defaults.seoKeywords);
  const heroImageAltRaw =
    sanitizeString(raw.heroImageAlt, defaults.heroImageAlt) || defaults.heroImageAlt;
  const heroImageAlt =
    useContentDefaults || /APK download/i.test(heroImageAltRaw)
      ? defaults.heroImageAlt
      : heroImageAltRaw;

  return {
    path: defaults.path,
    title: useContentDefaults
      ? defaults.title
      : sanitizeString(raw.title, defaults.title) || defaults.title,
    heroTitle,
    seoTitle,
    seoDescription,
    seoKeywords,
    heroImageAlt,
    subtitleEn,
    apkCta: "",
    officialUrl: "",
    heroImage: sanitizeString(raw.heroImage, defaults.heroImage) || defaults.heroImage,
    heroLayout,
    pills: useContentDefaults
      ? defaults.pills
      : defaults.pills.map((def, index) => {
          const row = isPlainObject(pillsRaw[index]) ? pillsRaw[index] : {};
          return { label: sanitizeString(row.label, def.label) || def.label };
        }),
    countdown: {
      label: (() => {
        const label =
          sanitizeString(countdownRaw.label, defaults.countdown.label) || defaults.countdown.label;
        return /Free Fire Advance Server Open|Download APK/i.test(label)
          ? defaults.countdown.label
          : label;
      })(),
      targetIso:
        sanitizeString(countdownRaw.targetIso, defaults.countdown.targetIso) ||
        defaults.countdown.targetIso,
      dateText: (() => {
        const dateText =
          sanitizeString(countdownRaw.dateText, defaults.countdown.dateText) ||
          defaults.countdown.dateText;
        return useContentDefaults || /Free Fire Next OB55|Download APK/i.test(dateText)
          ? defaults.countdown.dateText
          : dateText;
      })(),
    },
    cards: useContentDefaults
      ? defaults.cards
      : defaults.cards.map((def) => normalizeCard(findRawByIdOrTitle(cardsRaw, def), def)),
    tables: useContentDefaults
      ? defaults.tables
      : defaults.tables.map((def, index) => normalizeTable(tablesRaw[index], def)),
    faqs: useContentDefaults
      ? defaults.faqs
      : defaults.faqs.map((def, index) => normalizeFaq(faqsRaw[index], def)),
  };
}

export async function getAdvanceServerPage(): Promise<FfAdvanceServerPageContent> {
  const defaults = getDefaultAdvanceServerPage();
  const row = await tryPrisma(async () => prisma.siteSetting.findUnique({ where: { key: KEY } }));
  if (row === null || !row?.value) return defaults;
  return normalizeAdvanceServerPage(row.value);
}

/** Real DB update time for sitemap / JSON-LD — never a fake UTC "today". */
export async function getAdvanceServerUpdatedAt(): Promise<Date | null> {
  const row = await tryPrismaLong(async () =>
    prisma.siteSetting.findUnique({
      where: { key: KEY },
      select: { updatedAt: true },
    }),
  );
  return row?.updatedAt ?? null;
}

export async function getAdvanceServerPageForAdmin(): Promise<{
  page: FfAdvanceServerPageContent;
  usingDefault: boolean;
}> {
  const row = await tryPrisma(async () => prisma.siteSetting.findUnique({ where: { key: KEY } }));
  if (row === null || !row?.value) {
    return { page: getDefaultAdvanceServerPage(), usingDefault: true };
  }
  return { page: normalizeAdvanceServerPage(row.value), usingDefault: false };
}

export async function saveAdvanceServerPage(
  raw: unknown,
): Promise<{ page: FfAdvanceServerPageContent; usingDefault: boolean }> {
  const page = normalizeAdvanceServerPage(raw);
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

export async function clearAdvanceServerPage(): Promise<{
  page: FfAdvanceServerPageContent;
  usingDefault: boolean;
}> {
  const deleted = await tryPrismaLong(async () => {
    await prisma.siteSetting.deleteMany({ where: { key: KEY } });
    return true;
  });
  if (deleted === null && process.env.DATABASE_URL) throw new Error("DB_UNAVAILABLE");
  return { page: getDefaultAdvanceServerPage(), usingDefault: true };
}
