import { getDefaultPageCards } from "@/src/lib/homeCardsDefaults";
import type { FfHomeCards, PageCardsVariant } from "@/src/lib/homeCardsTypes";
import { pageCardsVariantToSitemapPath } from "@/src/lib/sitemapLastmod";
import { prisma, tryPrisma, tryPrismaLong } from "@/src/server/dbSafe";
import { bumpSitemapLastmod } from "@/src/server/repositories/sitemapLastmodRepository";

const KEY_BY_VARIANT: Record<PageCardsVariant, string> = {
  freefire: "settings:homeCards:freefire",
  "freefire-max": "settings:homeCards:freefire-max",
  bgmi: "settings:homeCards:bgmi",
  pubg: "settings:homeCards:pubg",
  "pubg-mobile-codes": "settings:homeCards:pubg-mobile-codes",
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/** Deep-merge plain objects; arrays from override replace entirely when present. */
function deepMerge<T>(base: T, override: unknown): T {
  if (!isPlainObject(base) || !isPlainObject(override)) {
    return (override === undefined ? base : (override as T)) as T;
  }
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(override)) {
    if (value === undefined) continue;
    const prev = out[key];
    if (Array.isArray(value)) {
      out[key] = value;
    } else if (isPlainObject(value) && isPlainObject(prev)) {
      out[key] = deepMerge(prev, value);
    } else {
      out[key] = value;
    }
  }
  return out as T;
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

/** Normalize admin payload against defaults (keep shape stable). */
export function normalizeFfHomeCards(
  raw: unknown,
  defaults: FfHomeCards = getDefaultPageCards("freefire"),
): FfHomeCards {
  if (!isPlainObject(raw)) return defaults;
  const merged = deepMerge(defaults, raw);

  merged.hero.title = sanitizeString(merged.hero?.title, defaults.hero.title) || defaults.hero.title;
  if (/no\s*recoil/i.test(merged.hero.title)) {
    merged.hero.title = defaults.hero.title;
  }

  const seoDescription =
    sanitizeString(merged.seo?.description, defaults.seo.description) || defaults.seo.description;
  let seoKeywords = sanitizeStringList(merged.seo?.keywords, defaults.seo.keywords);
  if (/no\s*recoil/i.test(seoDescription)) {
    merged.seo = {
      description: defaults.seo.description,
      keywords: defaults.seo.keywords.filter((k) => !/no\s*recoil/i.test(k)),
    };
  } else {
    seoKeywords = seoKeywords.filter((k) => !/no\s*recoil/i.test(k));
    merged.seo = {
      description: seoDescription,
      keywords: seoKeywords.length ? seoKeywords : defaults.seo.keywords,
    };
  }

  merged.patchStrip = {
    ...defaults.patchStrip,
    ...merged.patchStrip,
    code: sanitizeString(merged.patchStrip?.code, defaults.patchStrip.code),
    label: sanitizeString(merged.patchStrip?.label, defaults.patchStrip.label),
    dateLabel: sanitizeString(merged.patchStrip?.dateLabel, defaults.patchStrip.dateLabel),
    dateIso: sanitizeString(merged.patchStrip?.dateIso, defaults.patchStrip.dateIso),
    typeLabel: sanitizeString(merged.patchStrip?.typeLabel, defaults.patchStrip.typeLabel),
    summary: sanitizeString(merged.patchStrip?.summary, defaults.patchStrip.summary),
    articlePath: sanitizeString(merged.patchStrip?.articlePath, defaults.patchStrip.articlePath),
    newsListPath: sanitizeString(merged.patchStrip?.newsListPath, defaults.patchStrip.newsListPath),
    primaryCta: sanitizeString(merged.patchStrip?.primaryCta, defaults.patchStrip.primaryCta),
    secondaryCta: sanitizeString(merged.patchStrip?.secondaryCta, defaults.patchStrip.secondaryCta),
  };

  const defaultModes = defaults.playModes.modes;
  const modesRaw = Array.isArray(merged.playModes?.modes) ? merged.playModes.modes : defaultModes;
  merged.playModes = {
    title: sanitizeString(merged.playModes?.title, defaults.playModes.title) || defaults.playModes.title,
    lead: sanitizeString(merged.playModes?.lead, defaults.playModes.lead) || defaults.playModes.lead,
    modes: defaultModes.map((def, index) => {
      const row = modesRaw[index] as Record<string, unknown> | undefined;
      return {
        id: def.id,
        role: def.role,
        icon: sanitizeString(row?.icon, def.icon) || def.icon,
        label: sanitizeString(row?.label, def.label) || def.label,
        blurb: sanitizeString(row?.blurb, def.blurb) || def.blurb,
      };
    }),
  };

  for (const key of ["nextUpdate", "advanceServer"] as const) {
    const def = defaults[key];
    const cur = merged[key];
    merged[key] = {
      ...def,
      ...cur,
      badge: sanitizeString(cur?.badge, def.badge),
      code: sanitizeString(cur?.code, def.code),
      title: sanitizeString(cur?.title, def.title),
      meta: sanitizeString(cur?.meta, def.meta),
      metaIso: sanitizeString(cur?.metaIso, def.metaIso ?? ""),
      summary: sanitizeString(cur?.summary, def.summary),
      features: sanitizeStringList(cur?.features, def.features),
      note: sanitizeString(cur?.note, def.note),
      primaryPath: sanitizeString(cur?.primaryPath, def.primaryPath ?? ""),
      primaryCta: sanitizeString(cur?.primaryCta, def.primaryCta),
      secondaryPath: sanitizeString(cur?.secondaryPath, def.secondaryPath),
      secondaryCta: sanitizeString(cur?.secondaryCta, def.secondaryCta),
      officialUrl: sanitizeString(cur?.officialUrl, def.officialUrl ?? ""),
    };
  }

  merged.roleTips = {
    title: sanitizeString(merged.roleTips?.title, defaults.roleTips.title) || defaults.roleTips.title,
    items: defaults.roleTips.items.map((def, index) => {
      const row = Array.isArray(merged.roleTips?.items)
        ? (merged.roleTips.items[index] as Record<string, unknown> | undefined)
        : undefined;
      return {
        role: def.role,
        icon: sanitizeString(row?.icon, def.icon) || def.icon,
        title: sanitizeString(row?.title, def.title) || def.title,
        tips: sanitizeStringList(row?.tips, def.tips),
        buttonLabel: sanitizeString(row?.buttonLabel, def.buttonLabel) || def.buttonLabel,
      };
    }),
  };

  merged.season = {
    ...defaults.season,
    ...merged.season,
    badge: sanitizeString(merged.season?.badge, defaults.season.badge),
    title: sanitizeString(merged.season?.title, defaults.season.title),
    summary: sanitizeString(merged.season?.summary, defaults.season.summary),
    dateLabel: sanitizeString(merged.season?.dateLabel, defaults.season.dateLabel),
    dateIso: sanitizeString(merged.season?.dateIso, defaults.season.dateIso),
    ctaPath: sanitizeString(merged.season?.ctaPath, defaults.season.ctaPath),
    ctaLabel: sanitizeString(merged.season?.ctaLabel, defaults.season.ctaLabel),
    secondaryPath: sanitizeString(merged.season?.secondaryPath, defaults.season.secondaryPath),
    secondaryLabel: sanitizeString(merged.season?.secondaryLabel, defaults.season.secondaryLabel),
  };

  const proItemsRaw = Array.isArray(merged.proTips?.items) ? merged.proTips.items : defaults.proTips.items;
  merged.proTips = {
    title: sanitizeString(merged.proTips?.title, defaults.proTips.title) || defaults.proTips.title,
    lead: sanitizeString(merged.proTips?.lead, defaults.proTips.lead) || defaults.proTips.lead,
    ctaLabel:
      sanitizeString(merged.proTips?.ctaLabel, defaults.proTips.ctaLabel) || defaults.proTips.ctaLabel,
    items: defaults.proTips.items.map((def, index) => {
      const row = proItemsRaw[index] as Record<string, unknown> | undefined;
      return {
        id: def.id,
        icon: sanitizeString(row?.icon, def.icon) || def.icon,
        title: sanitizeString(row?.title, def.title) || def.title,
        tip: sanitizeString(row?.tip, def.tip) || def.tip,
      };
    }),
  };

  const stepsRaw = Array.isArray(merged.howItWorks?.steps)
    ? merged.howItWorks.steps
    : defaults.howItWorks.steps;
  merged.howItWorks = {
    title: sanitizeString(merged.howItWorks?.title, defaults.howItWorks.title) || defaults.howItWorks.title,
    subtitle:
      sanitizeString(merged.howItWorks?.subtitle, defaults.howItWorks.subtitle) ||
      defaults.howItWorks.subtitle,
    steps: defaults.howItWorks.steps.map((def, index) => {
      const row = stepsRaw[index] as Record<string, unknown> | undefined;
      return {
        icon: sanitizeString(row?.icon, def.icon) || def.icon,
        title: sanitizeString(row?.title, def.title) || def.title,
        bullets: sanitizeStringList(row?.bullets, def.bullets),
      };
    }),
  };

  const vsRaw = Array.isArray(merged.comparison?.vsRows)
    ? merged.comparison.vsRows
    : defaults.comparison.vsRows;
  const ramRaw = Array.isArray(merged.comparison?.ramRows)
    ? merged.comparison.ramRows
    : defaults.comparison.ramRows;
  merged.comparison = {
    title: sanitizeString(merged.comparison?.title, defaults.comparison.title) || defaults.comparison.title,
    ctaBeforeLink:
      sanitizeString(merged.comparison?.ctaBeforeLink, defaults.comparison.ctaBeforeLink) ||
      defaults.comparison.ctaBeforeLink,
    ctaLinkLabel:
      sanitizeString(merged.comparison?.ctaLinkLabel, defaults.comparison.ctaLinkLabel) ||
      defaults.comparison.ctaLinkLabel,
    ctaHref:
      sanitizeString(merged.comparison?.ctaHref, defaults.comparison.ctaHref) || defaults.comparison.ctaHref,
    ramTitle:
      sanitizeString(merged.comparison?.ramTitle, defaults.comparison.ramTitle) ||
      defaults.comparison.ramTitle,
    note: sanitizeString(merged.comparison?.note, defaults.comparison.note) || defaults.comparison.note,
    vsRows: defaults.comparison.vsRows.map((def, index) => {
      const row = vsRaw[index] as Record<string, unknown> | undefined;
      return {
        icon: sanitizeString(row?.icon, def.icon) || def.icon,
        point: sanitizeString(row?.point, def.point) || def.point,
        freefire: sanitizeString(row?.freefire, def.freefire) || def.freefire,
        freefireMax: sanitizeString(row?.freefireMax, def.freefireMax) || def.freefireMax,
      };
    }),
    ramRows: defaults.comparison.ramRows.map((def, index) => {
      const row = ramRaw[index] as Record<string, unknown> | undefined;
      return {
        icon: sanitizeString(row?.icon, def.icon) || def.icon,
        ram: sanitizeString(row?.ram, def.ram) || def.ram,
        general: sanitizeString(row?.general, def.general) || def.general,
        redDot: sanitizeString(row?.redDot, def.redDot) || def.redDot,
        scope2x: sanitizeString(row?.scope2x, def.scope2x) || def.scope2x,
        scope4x: sanitizeString(row?.scope4x, def.scope4x) || def.scope4x,
        sniper: sanitizeString(row?.sniper, def.sniper) || def.sniper,
        freeLook: sanitizeString(row?.freeLook, def.freeLook) || def.freeLook,
      };
    }),
  };

  function normalizeExploreCard(
    cur: unknown,
    def: FfHomeCards["explore"]["freefire"],
  ): FfHomeCards["explore"]["freefire"] {
    const row = isPlainObject(cur) ? cur : {};
    return {
      title: sanitizeString(row.title, def.title) || def.title,
      text: sanitizeString(row.text, def.text) || def.text,
      points: sanitizeStringList(row.points, def.points),
      buttonLabel: sanitizeString(row.buttonLabel, def.buttonLabel) || def.buttonLabel,
      href: sanitizeString(row.href, def.href) || def.href,
    };
  }

  merged.explore = {
    title: sanitizeString(merged.explore?.title, defaults.explore.title) || defaults.explore.title,
    freefire: normalizeExploreCard(merged.explore?.freefire, defaults.explore.freefire),
    freefireMax: normalizeExploreCard(merged.explore?.freefireMax, defaults.explore.freefireMax),
  };

  return merged;
}

export function isPageCardsVariant(value: unknown): value is PageCardsVariant {
  return (
    value === "freefire" ||
    value === "freefire-max" ||
    value === "bgmi" ||
    value === "pubg" ||
    value === "pubg-mobile-codes"
  );
}

export async function getFfPageCards(variant: PageCardsVariant): Promise<FfHomeCards> {
  const defaults = getDefaultPageCards(variant);
  const key = KEY_BY_VARIANT[variant];
  const row = await tryPrisma(async () => prisma.siteSetting.findUnique({ where: { key } }));
  if (row === null || !row?.value) return defaults;
  return normalizeFfHomeCards(row.value, defaults);
}

/** @deprecated Prefer getFfPageCards("freefire") */
export async function getFfHomeCards(): Promise<FfHomeCards> {
  return getFfPageCards("freefire");
}

export async function getFfPageCardsForAdmin(variant: PageCardsVariant): Promise<{
  cards: FfHomeCards;
  usingDefault: boolean;
}> {
  const defaults = getDefaultPageCards(variant);
  const key = KEY_BY_VARIANT[variant];
  const row = await tryPrisma(async () => prisma.siteSetting.findUnique({ where: { key } }));
  if (row === null || !row?.value) {
    return { cards: defaults, usingDefault: true };
  }
  return { cards: normalizeFfHomeCards(row.value, defaults), usingDefault: false };
}

/** @deprecated Prefer getFfPageCardsForAdmin("freefire") */
export async function getFfHomeCardsForAdmin(): Promise<{
  cards: FfHomeCards;
  usingDefault: boolean;
}> {
  return getFfPageCardsForAdmin("freefire");
}

export async function saveFfPageCards(
  variant: PageCardsVariant,
  raw: unknown,
): Promise<{ cards: FfHomeCards; usingDefault: boolean }> {
  const cards = normalizeFfHomeCards(raw, getDefaultPageCards(variant));
  const key = KEY_BY_VARIANT[variant];
  const saved = await tryPrismaLong(async () => {
    await prisma.siteSetting.upsert({
      where: { key },
      create: { key, value: cards },
      update: { value: cards },
    });
    return true;
  });
  if (saved === null && process.env.DATABASE_URL) throw new Error("DB_UNAVAILABLE");
  const path = pageCardsVariantToSitemapPath(variant);
  if (path) bumpSitemapLastmod([path]);
  return { cards, usingDefault: false };
}

/** @deprecated Prefer saveFfPageCards("freefire", raw) */
export async function saveFfHomeCards(raw: unknown): Promise<{ cards: FfHomeCards; usingDefault: boolean }> {
  return saveFfPageCards("freefire", raw);
}

export async function clearFfPageCards(
  variant: PageCardsVariant,
): Promise<{ cards: FfHomeCards; usingDefault: boolean }> {
  const key = KEY_BY_VARIANT[variant];
  const deleted = await tryPrismaLong(async () => {
    await prisma.siteSetting.deleteMany({ where: { key } });
    return true;
  });
  if (deleted === null && process.env.DATABASE_URL) throw new Error("DB_UNAVAILABLE");
  const path = pageCardsVariantToSitemapPath(variant);
  if (path) bumpSitemapLastmod([path]);
  return { cards: getDefaultPageCards(variant), usingDefault: true };
}

/** @deprecated Prefer clearFfPageCards("freefire") */
export async function clearFfHomeCards(): Promise<{ cards: FfHomeCards; usingDefault: boolean }> {
  return clearFfPageCards("freefire");
}
