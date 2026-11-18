import {
  GTA6_APK_DESCRIPTION,
  GTA6_APK_INTRO,
  GTA6_APK_SECTIONS,
  GTA6_APK_TITLE,
  GTA6_APK_UPDATED,
} from "@/src/features/gta6Calculator/gta6-apk-copy";
import {
  GTA6_CHEAT_BENEFITS,
  GTA6_CHEAT_CONCLUSION,
  GTA6_CHEAT_DESCRIPTION,
  GTA6_CHEAT_EXPECT,
  GTA6_CHEAT_FAQS,
  GTA6_CHEAT_HOW_TO,
  GTA6_CHEAT_INTRO,
  GTA6_CHEAT_PC,
  GTA6_CHEAT_PC_HOW,
  GTA6_CHEAT_PC_HOW_END,
  GTA6_CHEAT_PC_METHODS,
  GTA6_CHEAT_TABLE_WARNING,
  GTA6_CHEAT_TITLE,
  GTA6_CHEAT_UPDATED,
  GTA6_CHEAT_VERIFY,
} from "@/src/features/gta6Calculator/gta6-cheat-copy";
import { GTA6_CHEAT_ROWS } from "@/src/features/gta6Calculator/gta6-cheat-rows";
import {
  GTA6_CALC_GUIDE,
  GTA6_NOT_CONFIRMED,
  GTA6_OVERVIEW,
  GTA6_PLATFORM_FEATURES,
  GTA6_SEO_KEYWORDS,
  GTA6_SPECS,
} from "@/src/features/gta6Calculator/gta6-details";
import { GTA6_EDITIONS, GTA6_STORY, GTA6_TIMELINE } from "@/src/features/gta6Calculator/gta6-editions";
import { GTA6_FAQ } from "@/src/features/gta6Calculator/gta6-faq";
import { GTA6_MAP, GTA6_MAP_IMAGE, GTA6_MAP_PINS } from "@/src/features/gta6Calculator/gta6-map";
import { GTA6_PAGE_DESCRIPTION, GTA6_PAGE_TITLE } from "@/src/features/gta6Calculator/gta6-seo";
import type { Gta6PageContent } from "@/src/lib/gta6PageTypes";

const FILTER_LABEL: Record<string, string> = {
  "Weapons and health": "GTA 6 Weapons Cheat Code",
  Police: "GTA 6 Police Cheat Code",
  Movement: "GTA 6 Movement Cheat Code",
  Vehicles: "GTA 6 Vehicles Cheat Code",
  "Street and world": "GTA 6 World Cheat Code",
  "Phone and character": "GTA 6 Phone Cheat Code",
};

function lines(list: readonly string[]): string[] {
  return [...list];
}

export const DEFAULT_GTA6_PAGE: Gta6PageContent = {
  home: {
    seoTitle: GTA6_PAGE_TITLE,
    seoDescription: GTA6_PAGE_DESCRIPTION,
    keywords: lines(GTA6_SEO_KEYWORDS),
    eyebrow: "Coming November 19, 2026 · PS5 & Xbox Series",
    title: "Sensitivity Settings",
    lead: "Free controller calculator for Grand Theft Auto VI — look, aim, deadzone, acceleration, and DualSense options before launch day.",
    banner:
      "Menu names follow the usual controller pattern until Rockstar shows the real settings screen. Values are a starting range, not an official preset.",
    primaryLabel: "Open calculator",
    secondaryLabel: "View specs",
    imageSrc: "/gta6/news-city.jpg",
    imageAlt: "Vice City style night skyline for Grand Theft Auto VI",
    calculatorTitle: "GTA 6 sensitivity calculator",
  },
  overview: {
    title: GTA6_OVERVIEW.title,
    lead: GTA6_OVERVIEW.lead,
    paragraphs: lines(GTA6_OVERVIEW.paragraphs),
  },
  story: { title: GTA6_STORY.title, body: GTA6_STORY.body },
  specsTitle: "GTA 6 specifications",
  specs: GTA6_SPECS.map((row) => ({ label: row.label, value: row.value })),
  editions: {
    title: GTA6_EDITIONS.title,
    intro: GTA6_EDITIONS.intro,
    cards: GTA6_EDITIONS.cards.map((card) => ({
      title: card.title,
      points: lines(card.points),
    })),
  },
  timeline: {
    title: GTA6_TIMELINE.title,
    rows: GTA6_TIMELINE.rows.map((row) => ({ label: row.label, value: row.value })),
  },
  platformsTitle: "Platforms and features",
  platforms: GTA6_PLATFORM_FEATURES.map((item) => ({ title: item.title, body: item.body })),
  notConfirmed: {
    title: GTA6_NOT_CONFIRMED.title,
    intro: GTA6_NOT_CONFIRMED.intro,
    items: GTA6_NOT_CONFIRMED.items.map((item) => ({ title: item.title, body: item.body })),
  },
  calcGuide: { title: GTA6_CALC_GUIDE.title, steps: lines(GTA6_CALC_GUIDE.steps) },
  faq: GTA6_FAQ.map((item) => ({ question: item.question, answer: item.answer })),
  map: {
    title: GTA6_MAP.title,
    lead: GTA6_MAP.lead,
    note: GTA6_MAP.note,
    disclaimer: GTA6_MAP_IMAGE.disclaimer,
    stateName: GTA6_MAP.state.name,
    stateSummary: GTA6_MAP.state.summary,
    places: GTA6_MAP.citiesAndRegions.map((place) => ({
      name: place.name,
      type: place.type,
      summary: place.summary,
    })),
    landmarks: GTA6_MAP.landmarks.map((spot) => ({ name: spot.name, note: spot.note })),
    pins: GTA6_MAP_PINS.map((pin) => ({
      id: pin.id,
      name: pin.name,
      type: pin.type,
      region: pin.region,
      summary: pin.summary,
      x: pin.x,
      y: pin.y,
      zoom: pin.zoom ?? 1,
    })),
  },
  cheat: {
    seoTitle: `${GTA6_CHEAT_TITLE} — TBA Until Launch`,
    seoDescription: GTA6_CHEAT_DESCRIPTION,
    title: GTA6_CHEAT_TITLE,
    updated: GTA6_CHEAT_UPDATED,
    intro: lines(GTA6_CHEAT_INTRO),
    tableTitle: "GTA 6 Cheat Codes for PS5 and Xbox Series X|S",
    tableWarning: GTA6_CHEAT_TABLE_WARNING,
    verifyTitle: "How we label every code",
    verify: lines(GTA6_CHEAT_VERIFY),
    howToTitle: "How to enter GTA 6 cheat codes",
    howTo: GTA6_CHEAT_HOW_TO.map((block) => ({
      h3: block.h3,
      paragraphs: lines(block.paragraphs),
    })),
    benefitsTitle: "Benefits of cheat codes in GTA",
    benefits: GTA6_CHEAT_BENEFITS.map((item) => ({ h3: item.h3, body: item.body })),
    pcTitle: "GTA 6 Cheat Codes for PC",
    pc: lines(GTA6_CHEAT_PC),
    pcHowTitle: "How GTA 6 PC cheats will probably work",
    pcHow: lines(GTA6_CHEAT_PC_HOW),
    pcMethods: lines(GTA6_CHEAT_PC_METHODS),
    pcHowEnd: lines(GTA6_CHEAT_PC_HOW_END),
    expectTitle: "Other cheats to expect in GTA 6",
    expect: lines(GTA6_CHEAT_EXPECT),
    conclusionTitle: "Conclusion",
    conclusion: lines(GTA6_CHEAT_CONCLUSION),
    faqs: GTA6_CHEAT_FAQS.map((item) => ({ question: item.q, answer: item.a })),
    rows: GTA6_CHEAT_ROWS.map((row) =>
      row.kind === "group"
        ? {
            kind: "group" as const,
            label: row.label,
            filterLabel: FILTER_LABEL[row.label] || row.label,
          }
        : {
            kind: "cheat" as const,
            name: row.name,
            ps5: row.ps5,
            xbox: row.xbox,
            pc: row.pc,
          },
    ),
  },
  apk: {
    seoTitle: GTA6_APK_TITLE,
    seoDescription: GTA6_APK_DESCRIPTION,
    title: GTA6_APK_TITLE,
    updated: GTA6_APK_UPDATED,
    intro: lines(GTA6_APK_INTRO),
    sections: GTA6_APK_SECTIONS.map((section) => ({
      h2: section.h2,
      paragraphs: lines(section.paragraphs),
    })),
  },
};
