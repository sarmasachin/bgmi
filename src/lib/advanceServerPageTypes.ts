/** Editable Free Fire Advance Server landing page content. */

export const ADVANCE_SERVER_PAGE_SECTIONS = [
  { id: "seo", label: "SEO" },
  { id: "hero", label: "Hero" },
  { id: "countdown", label: "Countdown" },
  { id: "cards", label: "Content cards" },
  { id: "tables", label: "Tables" },
  { id: "faqs", label: "FAQs" },
] as const;

export type AdvanceServerPageSectionId = (typeof ADVANCE_SERVER_PAGE_SECTIONS)[number]["id"];

export type FfAsPageLink = {
  label: string;
  href: string;
};

export type FfAsPageCard = {
  id: string;
  badge: string;
  icon: string;
  title: string;
  summary: string;
  points: string[];
  pros?: string[];
  cons?: string[];
  links?: FfAsPageLink[];
};

export type FfAsPageTable = {
  id: string;
  badge: string;
  icon: string;
  title: string;
  summary: string;
  columns: string[];
  rows: string[][];
};

export type FfAsPageFaq = {
  id: string;
  question: string;
  answer: string;
};

export type FfAsPagePill = {
  label: string;
};

export type FfAsPageCountdown = {
  label: string;
  targetIso: string;
  dateText: string;
};

export type FfAdvanceServerPageContent = {
  path: string;
  title: string;
  heroTitle: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  heroImageAlt: string;
  subtitleEn: string;
  apkCta: string;
  officialUrl: string;
  heroImage: string;
  heroLayout: "split" | "center";
  pills: FfAsPagePill[];
  countdown: FfAsPageCountdown;
  cards: FfAsPageCard[];
  tables: FfAsPageTable[];
  faqs: FfAsPageFaq[];
};
