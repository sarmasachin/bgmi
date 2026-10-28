import { getDefaultPageCards } from "@/src/lib/homeCardsDefaults";
import { DEFAULT_FREE_FIRE_INDIA_APK_PAGE } from "@/src/lib/freeFireIndiaApkPage";
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
import { builtInDefaultHtml, saveGameArticleHtml } from "@/src/server/repositories/gameArticlesRepository";
import {
  FREE_FIRE_INDIA_APK_SETTING_KEY,
  saveFreeFireIndiaApkPage,
} from "@/src/server/repositories/freeFireIndiaApkPageRepository";
import { saveFreeFireIndiaRedeemPage } from "@/src/server/repositories/freeFireIndiaRedeemCodesRepository";
import { saveFreeFireIndiaStylishNamePage } from "@/src/server/repositories/freeFireIndiaStylishNameRepository";
import { getFreeFireRedeemPageForAdmin } from "@/src/server/repositories/freeFireRedeemCodesRepository";
import { getFreeFireStylishNamePageForAdmin } from "@/src/server/repositories/freeFireStylishNameRepository";
import { DEFAULT_FREEFIRE_INDIA_FAQ, saveGameFaqItems } from "@/src/server/repositories/homeFaqRepository";
import { saveFfPageCards } from "@/src/server/repositories/homeCardsRepository";
import { listNewsCategories } from "@/src/server/repositories/newsCategoryRepository";

const ARTICLE_KEY = "settings:gameArticle:freefire-india";
const CARDS_KEY = "settings:homeCards:freefire-india";
const FAQ_KEY = "settings:gameFaq:freefire-india";
const REDEEM_READY_KEY = "settings:freeFireIndiaRedeemCodesReady";
const NAME_READY_KEY = "settings:freeFireIndiaStylishNameReady";

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
  const cards = await storeIfMissing(CARDS_KEY, () =>
    saveFfPageCards("freefire-india", getDefaultPageCards("freefire-india")),
  );
  const article = await storeIfMissing(ARTICLE_KEY, () =>
    saveGameArticleHtml("freefire-india", builtInDefaultHtml("freefire-india")),
  );
  const faq = await storeIfMissing(FAQ_KEY, () =>
    saveGameFaqItems("freefire-india", DEFAULT_FREEFIRE_INDIA_FAQ.map((item) => ({ ...item }))),
  );
  const apk = await storeIfMissing(FREE_FIRE_INDIA_APK_SETTING_KEY, () =>
    saveFreeFireIndiaApkPage(DEFAULT_FREE_FIRE_INDIA_APK_PAGE),
  );
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
