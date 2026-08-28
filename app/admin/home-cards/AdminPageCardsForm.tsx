"use client";

import type { FfHomeCards, HomeCardSectionId } from "@/src/lib/homeCardsTypes";
import { AdminPageCardsFormBottom } from "./AdminPageCardsFormBottom";
import { AdminPageCardsFormTop } from "./AdminPageCardsFormTop";
import { AdminRoleTipsSection } from "./AdminRoleTipsSection";
export { Field, LinesEditor } from "./adminPageCardsFormUi";

type Props = {
  cards: FfHomeCards;
  sectionIds: readonly HomeCardSectionId[];
  sectionLabels: Map<HomeCardSectionId, string>;
  openIds: Set<HomeCardSectionId>;
  onToggle: (id: HomeCardSectionId) => void;
  onPatch: (updater: (prev: FfHomeCards) => FfHomeCards) => void;
};

/** Accordion editors for the active Page Cards tab. */
export function AdminPageCardsForm(props: Props) {
  const { cards, sectionIds, sectionLabels, openIds, onToggle, onPatch } = props;
  const showRoleTips = sectionIds.includes("roleTips");

  return (
    <>
      <AdminPageCardsFormTop {...props} />
      {showRoleTips ? (
        <AdminRoleTipsSection
          cards={cards}
          label={sectionLabels.get("roleTips") ?? "Role tips"}
          open={openIds.has("roleTips")}
          onToggle={() => onToggle("roleTips")}
          onPatch={onPatch}
        />
      ) : null}
      <AdminPageCardsFormBottom {...props} />
    </>
  );
}
