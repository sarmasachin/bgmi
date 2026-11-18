import { DEFAULT_GTA6_PAGE } from "@/src/lib/gta6PageDefaults";
import type {
  Gta6Benefit,
  Gta6Card,
  Gta6CheatRow,
  Gta6Faq,
  Gta6HeadingBlock,
  Gta6Landmark,
  Gta6PageContent,
  Gta6Pair,
  Gta6Pin,
  Gta6Place,
  Gta6PointsCard,
  Gta6Section,
} from "@/src/lib/gta6PageTypes";

function isObj(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function text(value: unknown, fallback = ""): string {
  if (typeof value !== "string") return fallback;
  return value.trim();
}

function textOr(value: unknown, fallback: string): string {
  const next = text(value);
  return next || fallback;
}

function lines(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  return value.map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean);
}

function pairs(value: unknown, fallback: Gta6Pair[]): Gta6Pair[] {
  if (!Array.isArray(value)) return fallback;
  return value.flatMap((item) => {
    if (!isObj(item)) return [];
    const label = text(item.label);
    const rowValue = text(item.value);
    return label && rowValue ? [{ label, value: rowValue }] : [];
  });
}

function cards(value: unknown, fallback: Gta6Card[]): Gta6Card[] {
  if (!Array.isArray(value)) return fallback;
  return value.flatMap((item) => {
    if (!isObj(item)) return [];
    const title = text(item.title);
    const body = text(item.body);
    return title ? [{ title, body }] : [];
  });
}

function pointCards(value: unknown, fallback: Gta6PointsCard[]): Gta6PointsCard[] {
  if (!Array.isArray(value)) return fallback;
  return value.flatMap((item) => {
    if (!isObj(item)) return [];
    const title = text(item.title);
    return title ? [{ title, points: lines(item.points, []) }] : [];
  });
}

function faqs(value: unknown, fallback: Gta6Faq[]): Gta6Faq[] {
  if (!Array.isArray(value)) return fallback;
  return value.flatMap((item) => {
    if (!isObj(item)) return [];
    const question = text(item.question);
    const answer = text(item.answer);
    return question && answer ? [{ question, answer }] : [];
  });
}

function places(value: unknown, fallback: Gta6Place[]): Gta6Place[] {
  if (!Array.isArray(value)) return fallback;
  return value.flatMap((item) => {
    if (!isObj(item)) return [];
    const name = text(item.name);
    return name ? [{ name, type: text(item.type), summary: text(item.summary) }] : [];
  });
}

function landmarks(value: unknown, fallback: Gta6Landmark[]): Gta6Landmark[] {
  if (!Array.isArray(value)) return fallback;
  return value.flatMap((item) => {
    if (!isObj(item)) return [];
    const name = text(item.name);
    return name ? [{ name, note: text(item.note) }] : [];
  });
}

function num(value: unknown, fallback: number, min: number, max: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function slug(raw: string, index: number): string {
  const id = raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return id || `pin-${index + 1}`;
}

function pins(value: unknown, fallback: Gta6Pin[]): Gta6Pin[] {
  if (!Array.isArray(value)) return fallback;
  return value.flatMap((item, index) => {
    if (!isObj(item)) return [];
    const name = text(item.name);
    if (!name) return [];
    return [
      {
        id: text(item.id) || slug(name, index),
        name,
        type: text(item.type),
        region: text(item.region),
        summary: text(item.summary),
        x: num(item.x, 50, 0, 100),
        y: num(item.y, 50, 0, 100),
        zoom: num(item.zoom, 1, 0.4, 4),
      },
    ];
  });
}

function blocks(value: unknown, fallback: Gta6HeadingBlock[]): Gta6HeadingBlock[] {
  if (!Array.isArray(value)) return fallback;
  return value.flatMap((item) => {
    if (!isObj(item)) return [];
    const h3 = text(item.h3);
    return h3 ? [{ h3, paragraphs: lines(item.paragraphs, []) }] : [];
  });
}

function benefits(value: unknown, fallback: Gta6Benefit[]): Gta6Benefit[] {
  if (!Array.isArray(value)) return fallback;
  return value.flatMap((item) => {
    if (!isObj(item)) return [];
    const h3 = text(item.h3);
    return h3 ? [{ h3, body: text(item.body) }] : [];
  });
}

function sections(value: unknown, fallback: Gta6Section[]): Gta6Section[] {
  if (!Array.isArray(value)) return fallback;
  return value.flatMap((item) => {
    if (!isObj(item)) return [];
    const h2 = text(item.h2);
    return h2 ? [{ h2, paragraphs: lines(item.paragraphs, []) }] : [];
  });
}

function cheatRows(value: unknown, fallback: Gta6CheatRow[]): Gta6CheatRow[] {
  if (!Array.isArray(value)) return fallback;
  return value.flatMap((item) => {
    if (!isObj(item)) return [];
    if (item.kind === "group") {
      const label = text(item.label);
      return label ? [{ kind: "group" as const, label, filterLabel: textOr(item.filterLabel, label) }] : [];
    }
    if (item.kind !== "cheat") return [];
    const name = text(item.name);
    return name
      ? [{ kind: "cheat" as const, name, ps5: text(item.ps5), xbox: text(item.xbox), pc: text(item.pc) }]
      : [];
  });
}

export function normalizeGta6Page(raw: unknown): Gta6PageContent {
  const row = isObj(raw) ? raw : {};
  const base = DEFAULT_GTA6_PAGE;
  const home = isObj(row.home) ? row.home : {};
  const overview = isObj(row.overview) ? row.overview : {};
  const story = isObj(row.story) ? row.story : {};
  const editions = isObj(row.editions) ? row.editions : {};
  const timeline = isObj(row.timeline) ? row.timeline : {};
  const notConfirmed = isObj(row.notConfirmed) ? row.notConfirmed : {};
  const calcGuide = isObj(row.calcGuide) ? row.calcGuide : {};
  const map = isObj(row.map) ? row.map : {};
  const cheat = isObj(row.cheat) ? row.cheat : {};
  const apk = isObj(row.apk) ? row.apk : {};

  return {
    home: {
      seoTitle: textOr(home.seoTitle, base.home.seoTitle),
      seoDescription: textOr(home.seoDescription, base.home.seoDescription),
      keywords: lines(home.keywords, base.home.keywords),
      eyebrow: text(home.eyebrow, base.home.eyebrow),
      title: textOr(home.title, base.home.title),
      lead: text(home.lead, base.home.lead),
      banner: text(home.banner, base.home.banner),
      primaryLabel: textOr(home.primaryLabel, base.home.primaryLabel),
      secondaryLabel: textOr(home.secondaryLabel, base.home.secondaryLabel),
      imageSrc: textOr(home.imageSrc, base.home.imageSrc),
      imageAlt: text(home.imageAlt, base.home.imageAlt),
      calculatorTitle: textOr(home.calculatorTitle, base.home.calculatorTitle),
    },
    overview: {
      title: textOr(overview.title, base.overview.title),
      lead: text(overview.lead, base.overview.lead),
      paragraphs: lines(overview.paragraphs, base.overview.paragraphs),
    },
    story: {
      title: textOr(story.title, base.story.title),
      body: text(story.body, base.story.body),
    },
    specsTitle: textOr(row.specsTitle, base.specsTitle),
    specs: pairs(row.specs, base.specs),
    editions: {
      title: textOr(editions.title, base.editions.title),
      intro: text(editions.intro, base.editions.intro),
      cards: pointCards(editions.cards, base.editions.cards),
    },
    timeline: {
      title: textOr(timeline.title, base.timeline.title),
      rows: pairs(timeline.rows, base.timeline.rows),
    },
    platformsTitle: textOr(row.platformsTitle, base.platformsTitle),
    platforms: cards(row.platforms, base.platforms),
    notConfirmed: {
      title: textOr(notConfirmed.title, base.notConfirmed.title),
      intro: text(notConfirmed.intro, base.notConfirmed.intro),
      items: cards(notConfirmed.items, base.notConfirmed.items),
    },
    calcGuide: {
      title: textOr(calcGuide.title, base.calcGuide.title),
      steps: lines(calcGuide.steps, base.calcGuide.steps),
    },
    faq: faqs(row.faq, base.faq),
    map: {
      title: textOr(map.title, base.map.title),
      lead: text(map.lead, base.map.lead),
      note: text(map.note, base.map.note),
      disclaimer: text(map.disclaimer, base.map.disclaimer),
      stateName: textOr(map.stateName, base.map.stateName),
      stateSummary: text(map.stateSummary, base.map.stateSummary),
      places: places(map.places, base.map.places),
      landmarks: landmarks(map.landmarks, base.map.landmarks),
      pins: pins(map.pins, base.map.pins),
    },
    cheat: {
      seoTitle: textOr(cheat.seoTitle, base.cheat.seoTitle),
      seoDescription: textOr(cheat.seoDescription, base.cheat.seoDescription),
      title: textOr(cheat.title, base.cheat.title),
      updated: text(cheat.updated, base.cheat.updated),
      intro: lines(cheat.intro, base.cheat.intro),
      tableTitle: textOr(cheat.tableTitle, base.cheat.tableTitle),
      tableWarning: text(cheat.tableWarning, base.cheat.tableWarning),
      verifyTitle: textOr(cheat.verifyTitle, base.cheat.verifyTitle),
      verify: lines(cheat.verify, base.cheat.verify),
      howToTitle: textOr(cheat.howToTitle, base.cheat.howToTitle),
      howTo: blocks(cheat.howTo, base.cheat.howTo),
      benefitsTitle: textOr(cheat.benefitsTitle, base.cheat.benefitsTitle),
      benefits: benefits(cheat.benefits, base.cheat.benefits),
      pcTitle: textOr(cheat.pcTitle, base.cheat.pcTitle),
      pc: lines(cheat.pc, base.cheat.pc),
      pcHowTitle: textOr(cheat.pcHowTitle, base.cheat.pcHowTitle),
      pcHow: lines(cheat.pcHow, base.cheat.pcHow),
      pcMethods: lines(cheat.pcMethods, base.cheat.pcMethods),
      pcHowEnd: lines(cheat.pcHowEnd, base.cheat.pcHowEnd),
      expectTitle: textOr(cheat.expectTitle, base.cheat.expectTitle),
      expect: lines(cheat.expect, base.cheat.expect),
      conclusionTitle: textOr(cheat.conclusionTitle, base.cheat.conclusionTitle),
      conclusion: lines(cheat.conclusion, base.cheat.conclusion),
      faqs: faqs(cheat.faqs, base.cheat.faqs),
      rows: cheatRows(cheat.rows, base.cheat.rows),
    },
    apk: {
      seoTitle: textOr(apk.seoTitle, base.apk.seoTitle),
      seoDescription: textOr(apk.seoDescription, base.apk.seoDescription),
      title: textOr(apk.title, base.apk.title),
      updated: text(apk.updated, base.apk.updated),
      intro: lines(apk.intro, base.apk.intro),
      sections: sections(apk.sections, base.apk.sections),
    },
  };
}
