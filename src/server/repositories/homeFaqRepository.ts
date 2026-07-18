import { randomUUID } from "crypto";
import { prisma, tryPrisma } from "@/src/server/dbSafe";

const KEY = "settings:homeFaq";

export type HomeFaqItem = { id: string; question: string; answer: string };

export const DEFAULT_HOME_FAQ: HomeFaqItem[] = [
  {
    id: "default-1",
    question: "Does this work for iPhone?",
    answer:
      "Yes. The calculator auto-adjusts sensitivity based on your phone model.",
  },
  {
    id: "default-2",
    question: "What role does FPS play?",
    answer:
      "Higher FPS makes the game smoother and usually makes aiming feel more responsive.",
  },
  {
    id: "default-3",
    question: "Can this get my ID banned?",
    answer:
      "No. This is only a calculator that suggests in-game settings.",
  },
];

function parseStoredItems(raw: unknown): HomeFaqItem[] | null {
  if (!raw || typeof raw !== "object") return null;
  const items = (raw as { items?: unknown }).items;
  if (!Array.isArray(items)) return null;
  const out: HomeFaqItem[] = [];
  for (const row of items) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const question = typeof r.question === "string" ? r.question.trim() : "";
    const answer = typeof r.answer === "string" ? r.answer.trim() : "";
    if (!question || !answer) continue;
    const id =
      typeof r.id === "string" && r.id.trim() ? r.id.trim().slice(0, 80) : randomUUID();
    out.push({ id, question: question.slice(0, 500), answer: answer.slice(0, 4000) });
  }
  return out;
}

/** FAQ cards on the home page article block. No DB / missing row → built-in defaults. */
export async function getHomeFaqItems(): Promise<HomeFaqItem[]> {
  const row = await tryPrisma(async () => prisma.siteSetting.findUnique({ where: { key: KEY } }));
  if (row === null || !row?.value) {
    return DEFAULT_HOME_FAQ.map((x) => ({ ...x }));
  }
  const parsed = parseStoredItems(row.value);
  if (parsed === null) {
    return DEFAULT_HOME_FAQ.map((x) => ({ ...x }));
  }
  return parsed;
}

/** Raw stored list: null if no row (site still shows defaults via getHomeFaqItems). */
export async function getStoredHomeFaqRaw(): Promise<HomeFaqItem[] | null> {
  const row = await tryPrisma(async () => prisma.siteSetting.findUnique({ where: { key: KEY } }));
  if (row === null) return null;
  if (!row?.value) return null;
  const parsed = parseStoredItems(row.value);
  return parsed;
}

const MAX_ITEMS = 50;

export async function saveHomeFaqItems(items: HomeFaqItem[]): Promise<HomeFaqItem[]> {
  const cleaned: HomeFaqItem[] = [];
  for (let i = 0; i < items.length && cleaned.length < MAX_ITEMS; i++) {
    const item = items[i];
    const question = (item?.question ?? "").trim().slice(0, 500);
    const answer = (item?.answer ?? "").trim().slice(0, 4000);
    if (!question || !answer) continue;
    const id =
      item?.id && String(item.id).trim()
        ? String(item.id).trim().slice(0, 80)
        : randomUUID();
    cleaned.push({ id, question, answer });
  }

  const ok = await tryPrisma(async () => {
    await prisma.siteSetting.upsert({
      where: { key: KEY },
      create: { key: KEY, value: { items: cleaned } },
      update: { value: { items: cleaned } },
    });
    return true;
  });
  if (!ok) {
    throw new Error("Database unavailable");
  }
  return cleaned;
}
