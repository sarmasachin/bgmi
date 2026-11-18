export type Gta6Pair = { label: string; value: string };
export type Gta6Card = { title: string; body: string };
export type Gta6PointsCard = { title: string; points: string[] };
export type Gta6Faq = { question: string; answer: string };
export type Gta6Place = { name: string; type: string; summary: string };
export type Gta6Landmark = { name: string; note: string };
export type Gta6Pin = {
  id: string;
  name: string;
  type: string;
  region: string;
  summary: string;
  x: number;
  y: number;
  zoom: number;
};
export type Gta6HeadingBlock = { h3: string; paragraphs: string[] };
export type Gta6Benefit = { h3: string; body: string };
export type Gta6Section = { h2: string; paragraphs: string[] };
export type Gta6CheatRow =
  | { kind: "group"; label: string; filterLabel: string }
  | { kind: "cheat"; name: string; ps5: string; xbox: string; pc: string };

export type Gta6PageContent = {
  home: {
    seoTitle: string;
    seoDescription: string;
    keywords: string[];
    eyebrow: string;
    title: string;
    lead: string;
    banner: string;
    primaryLabel: string;
    secondaryLabel: string;
    imageSrc: string;
    imageAlt: string;
    calculatorTitle: string;
  };
  overview: { title: string; lead: string; paragraphs: string[] };
  story: { title: string; body: string };
  specsTitle: string;
  specs: Gta6Pair[];
  editions: { title: string; intro: string; cards: Gta6PointsCard[] };
  timeline: { title: string; rows: Gta6Pair[] };
  platformsTitle: string;
  platforms: Gta6Card[];
  notConfirmed: { title: string; intro: string; items: Gta6Card[] };
  calcGuide: { title: string; steps: string[] };
  faq: Gta6Faq[];
  map: {
    title: string;
    lead: string;
    note: string;
    disclaimer: string;
    stateName: string;
    stateSummary: string;
    places: Gta6Place[];
    landmarks: Gta6Landmark[];
    pins: Gta6Pin[];
  };
  cheat: {
    seoTitle: string;
    seoDescription: string;
    title: string;
    updated: string;
    intro: string[];
    tableTitle: string;
    tableWarning: string;
    verifyTitle: string;
    verify: string[];
    howToTitle: string;
    howTo: Gta6HeadingBlock[];
    benefitsTitle: string;
    benefits: Gta6Benefit[];
    pcTitle: string;
    pc: string[];
    pcHowTitle: string;
    pcHow: string[];
    pcMethods: string[];
    pcHowEnd: string[];
    expectTitle: string;
    expect: string[];
    conclusionTitle: string;
    conclusion: string[];
    faqs: Gta6Faq[];
    rows: Gta6CheatRow[];
  };
  apk: {
    seoTitle: string;
    seoDescription: string;
    title: string;
    updated: string;
    intro: string[];
    sections: Gta6Section[];
  };
};
