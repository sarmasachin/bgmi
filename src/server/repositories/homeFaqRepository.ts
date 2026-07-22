import { randomUUID } from "crypto";
import { prisma, tryPrisma, tryPrismaLong } from "@/src/server/dbSafe";

export type HomeFaqItem = { id: string; question: string; answer: string };

export type GameFaqGame = "bgmi" | "pubg" | "freefire" | "freefire-max";

export const GAME_FAQ_GAMES: Array<{ id: GameFaqGame; label: string }> = [
  { id: "bgmi", label: "BGMI" },
  { id: "pubg", label: "PUBG Mobile" },
  { id: "freefire", label: "Free Fire" },
  { id: "freefire-max", label: "Free Fire Max" },
];

/** BGMI keeps legacy key so existing admin saves keep working. */
const KEYS: Record<GameFaqGame, string> = {
  bgmi: "settings:homeFaq",
  pubg: "settings:gameFaq:pubg",
  freefire: "settings:gameFaq:freefire",
  "freefire-max": "settings:gameFaq:freefire-max",
};

export const DEFAULT_BGMI_FAQ: HomeFaqItem[] = [
  {
    id: "bgmi-faq-1",
    question: "Is it okay to copy someone else's BGMI Sensitivity Code?",
    answer:
      "No. Copying another player's code usually will not improve your gameplay, because their device, ping, and hand size may be different from yours. Always use customized settings from a tool like our BGMI Sensitivity Calculator.",
  },
  {
    id: "bgmi-faq-2",
    question: "Why is sensitivity different for iOS and Android?",
    answer:
      "iOS devices (iPhones/iPads) generally have smoother and faster touch response and gyroscope sensors than many Android phones. Android users often need slightly higher sensitivity.",
  },
  {
    id: "bgmi-faq-3",
    question: "Does this calculator work with the latest BGMI updates?",
    answer:
      "Yes. Our algorithm is kept up to date with new BGMI versions (including 2026 updates) so you can keep getting no-recoil friendly settings.",
  },
];

export const DEFAULT_PUBG_FAQ: HomeFaqItem[] = [
  {
    id: "pubg-faq-1",
    question: "Can using the sensitivity calculator get my account banned?",
    answer:
      "Absolutely not. This is not a hack, a 90 FPS config file, or a third-party tool that tampers with the game database. It is only a mathematical utility that helps you set the official in-game options correctly. It is 100% safe.",
  },
  {
    id: "pubg-faq-2",
    question: "Does the generated Sensitivity Code always work?",
    answer:
      "According to PUBG Mobile rules, sensitivity codes shared in-game have an expiry time. If a code shows as expired because of the game servers, come back to our website and press Calculate again — our algorithm will immediately generate a fresh, latest working code format for you.",
  },
  {
    id: "pubg-faq-3",
    question: "What is the difference between Gyroscope and Gyroscope ADS?",
    answer:
      "Normal gyroscope sensitivity works when you tilt the phone to look around or track enemies without firing. Gyroscope ADS sensitivity is active only while you hold the fire button and shoot — it mainly helps control vertical gun recoil and deliver a no-recoil spray.",
  },
];

export const DEFAULT_FREEFIRE_FAQ: HomeFaqItem[] = [
  {
    id: "ff-faq-1",
    question: "How do I use the Free Fire sensitivity calculator?",
    answer:
      "Select your device details (RAM, DPI, FPS, and play style), then tap Calculate. Copy the General, Red Dot, scope, and free look values into Free Fire settings and practice in Training Ground.",
  },
  {
    id: "ff-faq-2",
    question: "Will Free Fire settings be different from BGMI?",
    answer:
      "Yes. Free Fire has its own camera, fire button, and scope feel. This calculator is tuned for Free Fire — do not paste BGMI or PUBG Mobile codes into Free Fire.",
  },
];

export const DEFAULT_FREEFIRE_MAX_FAQ: HomeFaqItem[] = [
  {
    id: "ffm-faq-1",
    question: "Is Free Fire Max the same as Free Fire for sensitivity?",
    answer:
      "Not always. Free Fire Max can feel heavier because of graphics and FPS. Use this Free Fire Max calculator with your real device RAM and FPS, then fine-tune Red Dot in Training Ground.",
  },
  {
    id: "ffm-faq-2",
    question: "Can I use BGMI sensitivity codes in Free Fire Max?",
    answer:
      "No. Sensitivity codes and slider ranges are game-specific. Use the Free Fire Max calculator on this page instead of BGMI or PUBG Mobile codes.",
  },
];

/** @deprecated use DEFAULT_BGMI_FAQ */
export const DEFAULT_HOME_FAQ = DEFAULT_BGMI_FAQ;

function defaultsFor(game: GameFaqGame): HomeFaqItem[] {
  if (game === "pubg") return DEFAULT_PUBG_FAQ;
  if (game === "freefire") return DEFAULT_FREEFIRE_FAQ;
  if (game === "freefire-max") return DEFAULT_FREEFIRE_MAX_FAQ;
  return DEFAULT_BGMI_FAQ;
}

/** Stable id when older DB rows lack one — randomUUID() remounted admin inputs on every refresh. */
function stableFallbackFaqId(question: string, index: number): string {
  let h = 2166136261;
  for (let i = 0; i < question.length; i++) {
    h ^= question.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `faq-${index}-${(h >>> 0).toString(36)}`.slice(0, 80);
}

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
      typeof r.id === "string" && r.id.trim()
        ? r.id.trim().slice(0, 80)
        : stableFallbackFaqId(question, out.length);
    out.push({ id, question: question.slice(0, 500), answer: answer.slice(0, 4000) });
  }
  return out;
}

export async function getGameFaqItems(game: GameFaqGame): Promise<HomeFaqItem[]> {
  const defaults = defaultsFor(game).map((x) => ({ ...x }));
  const key = KEYS[game];
  const row = await tryPrisma(async () => prisma.siteSetting.findUnique({ where: { key } }));
  if (row === null || !row?.value) {
    return defaults;
  }
  const parsed = parseStoredItems(row.value);
  if (parsed === null || parsed.length === 0) {
    return defaults;
  }
  // Drop stale pre-launch FAQ copy so live calculator pages stay indexable.
  const stale = parsed.some((item) =>
    /coming soon|under development|when it launches|wait for the free fire/i.test(
      `${item.question} ${item.answer}`,
    ),
  );
  if (stale && (game === "freefire" || game === "freefire-max")) {
    return defaults;
  }
  return parsed;
}

/** FAQ cards on the home page article block (BGMI). */
export async function getHomeFaqItems(): Promise<HomeFaqItem[]> {
  return getGameFaqItems("bgmi");
}

export async function getStoredGameFaqRaw(game: GameFaqGame): Promise<HomeFaqItem[] | null> {
  const key = KEYS[game];
  const row = await tryPrisma(async () => prisma.siteSetting.findUnique({ where: { key } }));
  if (row === null) return null;
  if (!row?.value) return null;
  return parseStoredItems(row.value);
}

/** Raw stored list: null if no row (site still shows defaults via getHomeFaqItems). */
export async function getStoredHomeFaqRaw(): Promise<HomeFaqItem[] | null> {
  return getStoredGameFaqRaw("bgmi");
}

const MAX_ITEMS = 50;

export async function saveGameFaqItems(
  game: GameFaqGame,
  items: HomeFaqItem[],
): Promise<HomeFaqItem[]> {
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

  const key = KEYS[game];
  const ok = await tryPrismaLong(async () => {
    await prisma.siteSetting.upsert({
      where: { key },
      create: { key, value: { items: cleaned } },
      update: { value: { items: cleaned } },
    });
    return true;
  });
  if (!ok) {
    throw new Error("Database unavailable");
  }
  return cleaned;
}

export async function saveHomeFaqItems(items: HomeFaqItem[]): Promise<HomeFaqItem[]> {
  return saveGameFaqItems("bgmi", items);
}

export async function getAllGameFaqsForAdmin() {
  const entries = await Promise.all(
    GAME_FAQ_GAMES.map(async (g) => {
      const stored = await getStoredGameFaqRaw(g.id);
      const effective = await getGameFaqItems(g.id);
      return {
        game: g.id,
        label: g.label,
        items: stored ?? effective,
        usingDefault: stored === null,
      };
    }),
  );
  return entries;
}
