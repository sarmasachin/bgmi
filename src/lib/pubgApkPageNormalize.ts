import { sanitizeHtml } from "@/src/lib/sanitizeHtml";
import {
  DEFAULT_PUBG_APK_PAGE,
  isUsablePubgHeroImageSrc,
  type PubgApkCard,
  type PubgApkCountdown,
  type PubgApkHeroButton,
  type PubgApkPageContent,
} from "@/src/lib/pubgApkPage";

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

function normalizeCountdown(raw: unknown, fallback: PubgApkCountdown): PubgApkCountdown {
  const row = isPlainObject(raw) ? raw : {};
  return {
    visible: typeof row.visible === "boolean" ? row.visible : fallback.visible,
    label: sanitizeString(row.label, fallback.label) || fallback.label,
    targetIso: sanitizeString(row.targetIso, fallback.targetIso),
    dateText: sanitizeString(row.dateText, fallback.dateText) || fallback.dateText,
    liveMessage: sanitizeString(row.liveMessage, fallback.liveMessage) || fallback.liveMessage,
  };
}

function normalizeHeroButton(raw: unknown, fallback: PubgApkHeroButton): PubgApkHeroButton {
  const row = isPlainObject(raw) ? raw : {};
  return {
    label: sanitizeString(row.label, fallback.label) || fallback.label,
    href: sanitizeString(row.href, fallback.href),
    visible: typeof row.visible === "boolean" ? row.visible : fallback.visible,
  };
}

function normalizeCard(raw: unknown, index: number, fallback: PubgApkCard): PubgApkCard | null {
  const row = isPlainObject(raw) ? raw : {};
  const title = sanitizeString(row.title);
  if (!title) return null;
  const points = sanitizeStringList(row.points, fallback.points);
  const ctaLabel = sanitizeString(row.ctaLabel);
  const ctaHref = sanitizeString(row.ctaHref);
  return {
    id: sanitizeString(row.id) || slugId(title, `card-${index + 1}`),
    badge: sanitizeString(row.badge, fallback.badge) || fallback.badge,
    icon: sanitizeString(row.icon, fallback.icon) || fallback.icon,
    title,
    summary: sanitizeString(row.summary, fallback.summary) || fallback.summary,
    points,
    ctaLabel,
    ctaHref,
  };
}

function normalizeCards(raw: unknown, defaults: PubgApkCard[]): PubgApkCard[] {
  const list = Array.isArray(raw) ? raw : defaults;
  const out: PubgApkCard[] = [];
  for (let i = 0; i < list.length; i++) {
    const card = normalizeCard(list[i], i, defaults[i] ?? defaults[0]);
    if (card) out.push(card);
  }
  const cards =
    out.length > 0 ? out : defaults.map((c) => ({ ...c, points: [...c.points] }));
  return ensurePinnedPubgApkCardsFirst(cards, defaults);
}

/** Keep high-intent featured cards at the top (prepend if missing from older DB rows). */
const PINNED_PUBG_APK_CARD_IDS = [
  "latest-update-features",
  "common-errors-fixes",
  "obb-file-setup",
  "fps-graphics-unlock",
  "ban-prevention-safety",
] as const;

function ensurePinnedPubgApkCardsFirst(
  cards: PubgApkCard[],
  defaults: PubgApkCard[],
): PubgApkCard[] {
  const rest = [...cards];
  const pinned: PubgApkCard[] = [];

  for (const id of PINNED_PUBG_APK_CARD_IDS) {
    const featured =
      defaults.find((c) => c.id === id) ??
      DEFAULT_PUBG_APK_PAGE.cards.find((c) => c.id === id);
    if (!featured) continue;

    const idx = rest.findIndex((c) => c.id === id);
    if (idx >= 0) {
      const [card] = rest.splice(idx, 1);
      pinned.push(card);
    } else {
      pinned.push({ ...featured, points: [...featured.points] });
    }
  }

  return [...pinned, ...rest];
}

function normalizeFaqs(
  raw: unknown,
  defaults: PubgApkPageContent["faqs"],
): PubgApkPageContent["faqs"] {
  const list = Array.isArray(raw) ? raw : defaults;
  const out: PubgApkPageContent["faqs"] = [];
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
  defaults: PubgApkPageContent["preRegister"],
): PubgApkPageContent["preRegister"] {
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
  defaults: PubgApkPageContent["facts"],
): PubgApkPageContent["facts"] {
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

export function normalizePubgApkPage(raw: unknown): PubgApkPageContent {
  const defaults = DEFAULT_PUBG_APK_PAGE;
  if (!isPlainObject(raw)) return defaults;
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
    heroImage: (() => {
      const rawImage = sanitizeString(raw.heroImage, defaults.heroImage);
      // Drop non-URL values (e.g. title text pasted into the image field).
      return isUsablePubgHeroImageSrc(rawImage) ? rawImage : "";
    })(),
    // Allow empty alt — do not re-fill defaults when admin clears the field.
    heroImageAlt: sanitizeString(raw.heroImageAlt, defaults.heroImageAlt),
    cards: normalizeCards(raw.cards, defaults.cards),
    preRegister: normalizeInstall(raw.preRegister, defaults.preRegister),
    facts: normalizeFacts(raw.facts, defaults.facts),
    articleHtml,
    faqs: normalizeFaqs(raw.faqs, defaults.faqs),
    faqTitle: sanitizeString(raw.faqTitle, defaults.faqTitle) || defaults.faqTitle,
    commentsLead:
      sanitizeString(raw.commentsLead, defaults.commentsLead) || defaults.commentsLead,
  };
}
