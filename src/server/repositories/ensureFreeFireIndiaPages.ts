import { asFreeFireIndiaCopy } from "@/src/lib/freeFireIndiaCopy";
import {
  DEFAULT_FREE_FIRE_INDIA_APK_PAGE,
  FREE_FIRE_INDIA_PLAY_STORE_URL,
  toFreeFireIndiaApkPage,
} from "@/src/lib/freeFireIndiaApkPage";
import {
  DEFAULT_FREE_FIRE_INDIA_REDEEM_PAGE,
  FREE_FIRE_INDIA_REDEEM_SETTINGS_KEY,
  toFreeFireIndiaRedeemPage,
} from "@/src/lib/freeFireIndiaRedeemPage";
import {
  DEFAULT_FREE_FIRE_INDIA_STYLISH_NAME_PAGE,
  FREE_FIRE_INDIA_STYLISH_NAME_SETTINGS_KEY,
  toFreeFireIndiaNamePage,
} from "@/src/lib/freeFireIndiaNamePage";
import { coerceFreeFireRedeemServer } from "@/src/lib/freeFireRedeemServers";
import { prisma, tryPrismaLong } from "@/src/server/dbSafe";
import {
  builtInDefaultHtml,
  getGameArticleHtml,
  saveGameArticleHtml,
} from "@/src/server/repositories/gameArticlesRepository";
import {
  FREE_FIRE_INDIA_APK_SETTING_KEY,
  saveFreeFireIndiaApkPage,
} from "@/src/server/repositories/freeFireIndiaApkPageRepository";
import { getFreeFireApkPageForAdmin } from "@/src/server/repositories/freeFireApkPageRepository";
import { saveFreeFireIndiaRedeemPage } from "@/src/server/repositories/freeFireIndiaRedeemCodesRepository";
import { saveFreeFireIndiaStylishNamePage } from "@/src/server/repositories/freeFireIndiaStylishNameRepository";
import { getFreeFireRedeemPageForAdmin } from "@/src/server/repositories/freeFireRedeemCodesRepository";
import { getFreeFireStylishNamePageForAdmin } from "@/src/server/repositories/freeFireStylishNameRepository";
import { getGameFaqItems, saveGameFaqItems } from "@/src/server/repositories/homeFaqRepository";
import { getFfPageCards, saveFfPageCards } from "@/src/server/repositories/homeCardsRepository";
import { listNewsCategories } from "@/src/server/repositories/newsCategoryRepository";

const ARTICLE_KEY = "settings:gameArticle:freefire-india";
const CARDS_KEY = "settings:homeCards:freefire-india";
const FAQ_KEY = "settings:gameFaq:freefire-india";
const REDEEM_READY_KEY = "settings:freeFireIndiaRedeemCodesReady";
const NAME_READY_KEY = "settings:freeFireIndiaStylishNameReady";

function indiaTextTree(value: unknown): unknown {
  if (typeof value === "string") return asFreeFireIndiaCopy(value);
  if (Array.isArray(value)) return value.map(indiaTextTree);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value)) out[key] = indiaTextTree(child);
    return out;
  }
  return value;
}

/** True when the row is absent. null means the database could not be read. */
async function rowMissing(key: string): Promise<boolean | null> {
  const result = await tryPrismaLong(async () => {
    const row = await prisma.siteSetting.findUnique({
      where: { key },
      select: { key: true },
    });
    return { row };
  });
  if (result === null) return null;
  return !result.row;
}

async function storeIfMissing(key: string, write: () => Promise<unknown>): Promise<boolean> {
  const missing = await rowMissing(key);
  if (missing === null) return false;
  if (!missing) return true;
  try {
    await write();
    return true;
  } catch {
    return false;
  }
}

/**
 * Writes each Free Fire India page into site settings once.
 * An existing row is left as the admin saved it.
 */
export async function ensureFreeFireIndiaPagesStored(): Promise<boolean> {
  const cards = await storeIfMissing(CARDS_KEY, async () => {
    const ff = await getFfPageCards("freefire");
    await saveFfPageCards("freefire-india", indiaTextTree(ff));
  });
  const article = await storeIfMissing(ARTICLE_KEY, async () => {
    const ff = await getGameArticleHtml("freefire");
    const html = asFreeFireIndiaCopy(ff || builtInDefaultHtml("freefire"));
    await saveGameArticleHtml("freefire-india", html);
  });
  const faq = await storeIfMissing(FAQ_KEY, async () => {
    const ff = await getGameFaqItems("freefire");
    await saveGameFaqItems(
      "freefire-india",
      ff.map((item) => ({
        ...item,
        question: asFreeFireIndiaCopy(item.question),
        answer: asFreeFireIndiaCopy(item.answer),
      })),
    );
  });
  const apk = await storeIfMissing(FREE_FIRE_INDIA_APK_SETTING_KEY, async () => {
    const ff = await getFreeFireApkPageForAdmin();
    const page = ff.usingDefault
      ? DEFAULT_FREE_FIRE_INDIA_APK_PAGE
      : toFreeFireIndiaApkPage(ff.page);
    await saveFreeFireIndiaApkPage({
      ...page,
      heroButtons: {
        ...page.heroButtons,
        playStore: {
          ...page.heroButtons.playStore,
          href: FREE_FIRE_INDIA_PLAY_STORE_URL,
        },
      },
    });
  });
  const redeem = await storeIfMissing(FREE_FIRE_INDIA_REDEEM_SETTINGS_KEY, async () => {
    const readyMissing = await rowMissing(REDEEM_READY_KEY);
    if (readyMissing === null) throw new Error("DB_UNAVAILABLE");
    if (!readyMissing) {
      await saveFreeFireIndiaRedeemPage(DEFAULT_FREE_FIRE_INDIA_REDEEM_PAGE);
      return;
    }
    const ff = await getFreeFireRedeemPageForAdmin();
    if (ff.usingDefault) {
      await saveFreeFireIndiaRedeemPage(DEFAULT_FREE_FIRE_INDIA_REDEEM_PAGE);
      return;
    }
    const copy = toFreeFireIndiaRedeemPage(ff.page);
    await saveFreeFireIndiaRedeemPage({
      ...copy,
      codes: copy.codes.filter(
        (code) => coerceFreeFireRedeemServer(code.server, copy.servers) === "india",
      ),
    });
  });
  const names = await storeIfMissing(FREE_FIRE_INDIA_STYLISH_NAME_SETTINGS_KEY, async () => {
    const readyMissing = await rowMissing(NAME_READY_KEY);
    if (readyMissing === null) throw new Error("DB_UNAVAILABLE");
    if (!readyMissing) {
      await saveFreeFireIndiaStylishNamePage(DEFAULT_FREE_FIRE_INDIA_STYLISH_NAME_PAGE);
      return;
    }
    const ff = await getFreeFireStylishNamePageForAdmin();
    if (ff.usingDefault) {
      await saveFreeFireIndiaStylishNamePage(DEFAULT_FREE_FIRE_INDIA_STYLISH_NAME_PAGE);
      return;
    }
    await saveFreeFireIndiaStylishNamePage(toFreeFireIndiaNamePage(ff.page));
  });
  let news = false;
  try {
    const categories = await listNewsCategories();
    news = categories.some((row) => row.slug === "free-fire-india");
  } catch {
    news = false;
  }
  return cards && article && faq && apk && redeem && names && news;
}

let storedForThisProcess = false;

/** One pass per server process. Later requests skip the extra reads. */
export async function ensureFreeFireIndiaPagesOnce(): Promise<void> {
  if (storedForThisProcess) return;
  const ok = await ensureFreeFireIndiaPagesStored();
  if (ok) storedForThisProcess = true;
}
