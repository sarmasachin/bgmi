import type { FfHomeCards, PageCardsVariant } from "@/src/lib/homeCardsTypes";
import { asFreeFireIndiaCopy } from "@/src/lib/freeFireIndiaCopy";
import { getDefaultFfHomeCards } from "@/src/lib/homeCardsDefaultsFreefire";
import { getDefaultFfMaxCards } from "@/src/lib/homeCardsDefaultsFreefireMax";
import {
  getDefaultBgmiCards,
  getDefaultBgmiLiteCards,
  getDefaultPubgCards,
  getDefaultPubgMobileCodesCards,
  getDefaultPubgMobileLiteCards,
} from "@/src/lib/homeCardsDefaultsOther";

export { getDefaultFfHomeCards } from "@/src/lib/homeCardsDefaultsFreefire";
export { getDefaultFfMaxCards } from "@/src/lib/homeCardsDefaultsFreefireMax";
export {
  getDefaultBgmiCards,
  getDefaultBgmiLiteCards,
  getDefaultPubgCards,
  getDefaultPubgMobileCodesCards,
  getDefaultPubgMobileLiteCards,
} from "@/src/lib/homeCardsDefaultsOther";

function renameCardStrings(value: unknown): unknown {
  if (typeof value === "string") return asFreeFireIndiaCopy(value);
  if (Array.isArray(value)) return value.map(renameCardStrings);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value)) out[key] = renameCardStrings(child);
    return out;
  }
  return value;
}

/** Starting copy for /free-fire-india. Admin saves replace this and stay separate from Free Fire. */
export function getDefaultFfIndiaCards(): FfHomeCards {
  const cards = renameCardStrings(getDefaultFfHomeCards()) as FfHomeCards;
  cards.hero.title = "Free Fire India Sensitivity Calculator";
  cards.seo.description =
    "Free Fire India sensitivity calculator for General, Red Dot, 2x, 4x, sniper scope, and free look. Get RAM and DPI based settings for your phone.";
  cards.seo.keywords = [
    "Free Fire India sensitivity calculator",
    "Free Fire India sensitivity settings",
    "Free Fire India RAM sensitivity",
    "Free Fire India DPI settings",
    "Free Fire India Red Dot sensitivity",
    "Free Fire India sniper sensitivity",
  ];
  if (cards.explore?.freefire?.href === "/#ff-calculator") {
    cards.explore.freefire.href = "/free-fire-india#ff-calculator";
  }
  return cards;
}

export function getDefaultPageCards(variant: PageCardsVariant): FfHomeCards {
  if (variant === "freefire-india") return getDefaultFfIndiaCards();
  if (variant === "freefire-max") return getDefaultFfMaxCards();
  if (variant === "bgmi") return getDefaultBgmiCards();
  if (variant === "bgmi-lite") return getDefaultBgmiLiteCards();
  if (variant === "pubg") return getDefaultPubgCards();
  if (variant === "pubg-mobile-codes") return getDefaultPubgMobileCodesCards();
  if (variant === "pubg-mobile-lite") return getDefaultPubgMobileLiteCards();
  return getDefaultFfHomeCards();
}
