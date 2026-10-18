import type { ApkHeroButton, ApkHeroCountdown } from "@/src/lib/apkHeroCta";
import {
  DEFAULT_PUBG_MOBILE_LITE_APK_PAGE,
  type PubgMobileLiteApkCard,
  type PubgMobileLiteApkPageContent,
} from "@/src/lib/pubgMobileLiteApkPage";
import { sanitizeHtml } from "@/src/lib/sanitizeHtml";

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

function slugId(raw: string, fallback: string) {
  const slug = raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return slug || fallback;
}

function normalizeHeroButton(raw: unknown, fallback: ApkHeroButton): ApkHeroButton {
  const row = isPlainObject(raw) ? raw : {};
  return {
    label: sanitizeString(row.label, fallback.label) || fallback.label,
    href: sanitizeString(row.href, fallback.href),
    visible: typeof row.visible === "boolean" ? row.visible : fallback.visible,
  };
}

function normalizeCountdown(raw: unknown, fallback: ApkHeroCountdown): ApkHeroCountdown {
  const row = isPlainObject(raw) ? raw : {};
  return {
    visible: typeof row.visible === "boolean" ? row.visible : fallback.visible,
    label: sanitizeString(row.label, fallback.label) || fallback.label,
    targetIso: sanitizeString(row.targetIso, fallback.targetIso),
    dateText: sanitizeString(row.dateText, fallback.dateText) || fallback.dateText,
    liveMessage: sanitizeString(row.liveMessage, fallback.liveMessage) || fallback.liveMessage,
  };
}

function normalizePills(raw: unknown, defaults: Array<{ label: string }>) {
  const list = Array.isArray(raw) ? raw : defaults;
  const out: Array<{ label: string }> = [];
  for (const item of list) {
    const row = isPlainObject(item) ? item : {};
    const label = sanitizeString(row.label);
    if (label) out.push({ label });
  }
  return out.length ? out : defaults.map((p) => ({ ...p }));
}

function normalizeCard(
  raw: unknown,
  index: number,
  fallback: PubgMobileLiteApkCard,
): PubgMobileLiteApkCard | null {
  const row = isPlainObject(raw) ? raw : {};
  const title = sanitizeString(row.title);
  if (!title) return null;
  const points = sanitizeStringList(row.points, fallback.points);
  return {
    id: sanitizeString(row.id) || slugId(title, `card-${index + 1}`),
    badge: sanitizeString(row.badge, fallback.badge) || fallback.badge,
    icon: sanitizeString(row.icon, fallback.icon) || fallback.icon,
    title,
    summary: sanitizeString(row.summary, fallback.summary) || fallback.summary,
    points,
    ctaLabel: sanitizeString(row.ctaLabel),
    ctaHref: sanitizeString(row.ctaHref),
  };
}

function normalizeCards(
  raw: unknown,
  defaults: PubgMobileLiteApkCard[],
): PubgMobileLiteApkCard[] {
  const list = Array.isArray(raw) ? raw : defaults;
  const out: PubgMobileLiteApkCard[] = [];
  for (let i = 0; i < list.length; i++) {
    const card = normalizeCard(list[i], i, defaults[i] ?? defaults[0]);
    if (card) out.push(card);
  }
  return out.length ? out : defaults.map((c) => ({ ...c, points: [...c.points] }));
}

function normalizeFaqs(
  raw: unknown,
  defaults: PubgMobileLiteApkPageContent["faqs"],
): PubgMobileLiteApkPageContent["faqs"] {
  const list = Array.isArray(raw) ? raw : defaults;
  const out: PubgMobileLiteApkPageContent["faqs"] = [];
  for (let i = 0; i < list.length; i++) {
    const row = isPlainObject(list[i]) ? list[i] : {};
    const question = sanitizeString(row.question);
    const answer = sanitizeString(row.answer);
    if (!question || !answer) continue;
    out.push({
      id: sanitizeString(row.id) || slugId(question, `faq-${i + 1}`),
      question,
      answer,
    });
  }
  return out.length ? out : defaults.map((f) => ({ ...f }));
}

function normalizeInstall(
  raw: unknown,
  defaults: PubgMobileLiteApkPageContent["install"],
): PubgMobileLiteApkPageContent["install"] {
  const row = isPlainObject(raw) ? raw : {};
  return {
    title: sanitizeString(row.title, defaults.title) || defaults.title,
    intro: sanitizeString(row.intro, defaults.intro) || defaults.intro,
    steps: sanitizeStringList(row.steps, defaults.steps),
    guideHref: sanitizeString(row.guideHref, defaults.guideHref) || defaults.guideHref,
    guideLabel: sanitizeString(row.guideLabel, defaults.guideLabel) || defaults.guideLabel,
  };
}

function normalizeFacts(
  raw: unknown,
  defaults: PubgMobileLiteApkPageContent["facts"],
): PubgMobileLiteApkPageContent["facts"] {
  const row = isPlainObject(raw) ? raw : {};
  const rowsRaw = Array.isArray(row.rows) ? row.rows : defaults.rows;
  const rows: Array<{ label: string; value: string }> = [];
  for (const item of rowsRaw) {
    const cell = isPlainObject(item) ? item : {};
    const label = sanitizeString(cell.label);
    const value = sanitizeString(cell.value);
    if (!label) continue;
    rows.push({ label, value: value || "—" });
  }
  return {
    title: sanitizeString(row.title, defaults.title) || defaults.title,
    rows: rows.length ? rows : defaults.rows.map((r) => ({ ...r })),
    note: sanitizeString(row.note, defaults.note) || defaults.note,
  };
}

function cloneDefaultPage(): PubgMobileLiteApkPageContent {
  const defaults = DEFAULT_PUBG_MOBILE_LITE_APK_PAGE;
  return {
    ...defaults,
    pills: defaults.pills.map((p) => ({ ...p })),
    heroButtons: {
      playStore: { ...defaults.heroButtons.playStore },
      apk: { ...defaults.heroButtons.apk },
    },
    countdown: { ...defaults.countdown },
    cards: defaults.cards.map((c) => ({ ...c, points: [...c.points] })),
    install: {
      ...defaults.install,
      steps: [...defaults.install.steps],
    },
    facts: {
      ...defaults.facts,
      rows: defaults.facts.rows.map((r) => ({ ...r })),
    },
    faqs: defaults.faqs.map((f) => ({ ...f })),
    seoKeywords: [...defaults.seoKeywords],
  };
}

export function normalizePubgMobileLiteApkPage(raw: unknown): PubgMobileLiteApkPageContent {
  const defaults = DEFAULT_PUBG_MOBILE_LITE_APK_PAGE;
  if (!isPlainObject(raw)) return cloneDefaultPage();
  const buttonsRaw = isPlainObject(raw.heroButtons) ? raw.heroButtons : {};
  const articleHtml =
    sanitizeHtml(sanitizeString(raw.articleHtml, defaults.articleHtml)) || defaults.articleHtml;

  return {
    path: defaults.path,
    seoTitle: sanitizeString(raw.seoTitle, defaults.seoTitle) || defaults.seoTitle,
    seoDescription:
      sanitizeString(raw.seoDescription, defaults.seoDescription) || defaults.seoDescription,
    seoKeywords: sanitizeStringList(raw.seoKeywords, defaults.seoKeywords),
    heroTitle: sanitizeString(raw.heroTitle, defaults.heroTitle) || defaults.heroTitle,
    subtitleEn: sanitizeString(raw.subtitleEn, defaults.subtitleEn) || defaults.subtitleEn,
    pills: normalizePills(raw.pills, defaults.pills),
    heroButtons: {
      playStore: normalizeHeroButton(buttonsRaw.playStore, defaults.heroButtons.playStore),
      apk: normalizeHeroButton(buttonsRaw.apk, defaults.heroButtons.apk),
    },
    countdown: normalizeCountdown(raw.countdown, defaults.countdown),
    heroImage: sanitizeString(raw.heroImage, defaults.heroImage) || defaults.heroImage,
    heroImageAlt: sanitizeString(raw.heroImageAlt, defaults.heroImageAlt),
    cards: normalizeCards(raw.cards, defaults.cards),
    install: normalizeInstall(raw.install, defaults.install),
    facts: normalizeFacts(raw.facts, defaults.facts),
    articleHtml,
    faqs: normalizeFaqs(raw.faqs, defaults.faqs),
    commentsLead:
      sanitizeString(raw.commentsLead, defaults.commentsLead) || defaults.commentsLead,
  };
}
