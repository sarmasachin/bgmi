import type { FfHomeCards, PageCardsVariant } from "@/src/lib/homeCardsTypes";
import { getDefaultFfHomeCards } from "@/src/lib/homeCardsDefaultsFreefire";
import { getDefaultFfMaxCards } from "@/src/lib/homeCardsDefaultsFreefireMax";
import {
  getDefaultBgmiCards,
  getDefaultPubgCards,
  getDefaultPubgMobileCodesCards,
} from "@/src/lib/homeCardsDefaultsOther";

export { getDefaultFfHomeCards } from "@/src/lib/homeCardsDefaultsFreefire";
export { getDefaultFfMaxCards } from "@/src/lib/homeCardsDefaultsFreefireMax";
export {
  getDefaultBgmiCards,
  getDefaultPubgCards,
  getDefaultPubgMobileCodesCards,
} from "@/src/lib/homeCardsDefaultsOther";

export function getDefaultPageCards(variant: PageCardsVariant): FfHomeCards {
  if (variant === "freefire-max") return getDefaultFfMaxCards();
  if (variant === "bgmi") return getDefaultBgmiCards();
  if (variant === "pubg") return getDefaultPubgCards();
  if (variant === "pubg-mobile-codes") return getDefaultPubgMobileCodesCards();
  return getDefaultFfHomeCards();
}
