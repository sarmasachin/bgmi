"use client";

import type { FfHomeCards } from "@/src/lib/homeCardsTypes";
import { AccordionSection, Field, LinesEditor } from "./adminPageCardsFormUi";

type Props = {
  cards: FfHomeCards;
  label: string;
  open: boolean;
  onToggle: () => void;
  onPatch: (updater: (prev: FfHomeCards) => FfHomeCards) => void;
};

/** Role tips accordion — title, lead, tips, and CTA all editable. */
export function AdminRoleTipsSection({ cards, label, open, onToggle, onPatch }: Props) {
  return (
    <AccordionSection id="roleTips" label={label} open={open} onToggle={onToggle}>
      <Field
        label="Section title"
        value={cards.roleTips.title}
        onChange={(title) => onPatch((p) => ({ ...p, roleTips: { ...p.roleTips, title } }))}
      />
      {cards.roleTips.items.map((item, index) => (
        <div
          key={item.role}
          style={{ borderTop: "1px solid #1e293b", paddingTop: 12, marginTop: 8 }}
        >
          <div style={{ fontSize: 13, color: "#67e8f9", marginBottom: 8 }}>
            Card {index + 1}: {item.title}
          </div>
          <Field
            label="Card title"
            value={item.title}
            onChange={(title) =>
              onPatch((p) => {
                const items = [...p.roleTips.items];
                items[index] = { ...items[index], title };
                return { ...p, roleTips: { ...p.roleTips, items } };
              })
            }
          />
          <Field
            label="Lead paragraph"
            value={item.lead ?? ""}
            multiline
            onChange={(lead) =>
              onPatch((p) => {
                const items = [...p.roleTips.items];
                items[index] = { ...items[index], lead };
                return { ...p, roleTips: { ...p.roleTips, items } };
              })
            }
          />
          <Field
            label="Button label"
            value={item.buttonLabel}
            onChange={(buttonLabel) =>
              onPatch((p) => {
                const items = [...p.roleTips.items];
                items[index] = { ...items[index], buttonLabel };
                return { ...p, roleTips: { ...p.roleTips, items } };
              })
            }
          />
          <LinesEditor
            label="Tips"
            lines={item.tips}
            onChange={(tips) =>
              onPatch((p) => {
                const items = [...p.roleTips.items];
                items[index] = { ...items[index], tips };
                return { ...p, roleTips: { ...p.roleTips, items } };
              })
            }
          />
        </div>
      ))}
    </AccordionSection>
  );
}
