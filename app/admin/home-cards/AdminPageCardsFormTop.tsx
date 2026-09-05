"use client";

import type { FfHomeCards, HomeCardSectionId } from "@/src/lib/homeCardsTypes";
import { AccordionSection, Field, LinesEditor } from "./adminPageCardsFormUi";

export type AdminPageCardsFormSharedProps = {
  cards: FfHomeCards;
  sectionIds: readonly HomeCardSectionId[];
  sectionLabels: Map<HomeCardSectionId, string>;
  openIds: Set<HomeCardSectionId>;
  onToggle: (id: HomeCardSectionId) => void;
  onPatch: (updater: (prev: FfHomeCards) => FfHomeCards) => void;
};

/** SEO → Advance Server sections. */
export function AdminPageCardsFormTop({
  cards,
  sectionIds,
  sectionLabels,
  openIds,
  onToggle,
  onPatch,
}: AdminPageCardsFormSharedProps) {
  const show = (id: HomeCardSectionId) => sectionIds.includes(id);
  const labelOf = (id: HomeCardSectionId, fallback: string) =>
    sectionLabels.get(id) ?? fallback;

  return (
    <>
      {show("seo") ? (
        <AccordionSection
          id="seo"
          label={labelOf("seo", "SEO")}
          open={openIds.has("seo")}
          onToggle={() => onToggle("seo")}
        >
          <Field
            label="Meta description"
            value={cards.seo.description}
            multiline
            onChange={(description) =>
              onPatch((p) => ({ ...p, seo: { ...p.seo, description } }))
            }
          />
          <LinesEditor
            label="SEO keywords"
            lines={cards.seo.keywords}
            onChange={(keywords) => onPatch((p) => ({ ...p, seo: { ...p.seo, keywords } }))}
          />
        </AccordionSection>
      ) : null}

      {show("hero") ? (
        <AccordionSection
          id="hero"
          label={labelOf("hero", "Hero")}
          open={openIds.has("hero")}
          onToggle={() => onToggle("hero")}
        >
          <Field
            label="H1 title"
            value={cards.hero.title}
            onChange={(title) => onPatch((p) => ({ ...p, hero: { title } }))}
          />
        </AccordionSection>
      ) : null}

      {show("calcBanner") ? (
        <AccordionSection
          id="calcBanner"
          label={labelOf("calcBanner", "Calculator intro")}
          open={openIds.has("calcBanner")}
          onToggle={() => onToggle("calcBanner")}
        >
          <Field
            label="Bold title"
            value={cards.calcBanner?.strong ?? ""}
            onChange={(strong) =>
              onPatch((p) => ({
                ...p,
                calcBanner: { strong, rest: p.calcBanner?.rest ?? "" },
              }))
            }
          />
          <Field
            label="Body text"
            value={cards.calcBanner?.rest ?? ""}
            multiline
            onChange={(rest) =>
              onPatch((p) => ({
                ...p,
                calcBanner: { strong: p.calcBanner?.strong ?? "", rest },
              }))
            }
          />
        </AccordionSection>
      ) : null}

      {show("patchStrip") ? (
        <AccordionSection
          id="patchStrip"
          label={labelOf("patchStrip", "Patch strip")}
          open={openIds.has("patchStrip")}
          onToggle={() => onToggle("patchStrip")}
        >
          {(
            [
              ["code", "Patch code"],
              ["label", "Label"],
              ["dateLabel", "Date label"],
              ["dateIso", "Date ISO"],
              ["typeLabel", "Type label"],
              ["summary", "Summary"],
              ["articlePath", "Article path"],
              ["newsListPath", "News list path"],
              ["primaryCta", "Primary CTA"],
              ["secondaryCta", "Secondary CTA"],
            ] as const
          ).map(([key, label]) => (
            <Field
              key={key}
              label={label}
              value={cards.patchStrip[key]}
              multiline={key === "summary"}
              onChange={(v) =>
                onPatch((p) => ({ ...p, patchStrip: { ...p.patchStrip, [key]: v } }))
              }
            />
          ))}
        </AccordionSection>
      ) : null}

      {show("playModes") ? (
        <AccordionSection
          id="playModes"
          label={labelOf("playModes", "Play modes")}
          open={openIds.has("playModes")}
          onToggle={() => onToggle("playModes")}
        >
          <Field
            label="Section title"
            value={cards.playModes.title}
            onChange={(title) => onPatch((p) => ({ ...p, playModes: { ...p.playModes, title } }))}
          />
          <Field
            label="Lead text"
            value={cards.playModes.lead}
            multiline
            onChange={(lead) => onPatch((p) => ({ ...p, playModes: { ...p.playModes, lead } }))}
          />
          {cards.playModes.modes.map((mode, index) => (
            <div
              key={mode.id}
              style={{ borderTop: "1px solid #1e293b", paddingTop: 12, marginTop: 8 }}
            >
              <div style={{ fontSize: 13, color: "#67e8f9", marginBottom: 8 }}>
                Mode: {mode.id} (role locked: {mode.role})
              </div>
              <Field
                label="Label"
                value={mode.label}
                onChange={(label) =>
                  onPatch((p) => {
                    const modes = [...p.playModes.modes];
                    modes[index] = { ...modes[index], label };
                    return { ...p, playModes: { ...p.playModes, modes } };
                  })
                }
              />
              <Field
                label="Blurb"
                value={mode.blurb}
                onChange={(blurb) =>
                  onPatch((p) => {
                    const modes = [...p.playModes.modes];
                    modes[index] = { ...modes[index], blurb };
                    return { ...p, playModes: { ...p.playModes, modes } };
                  })
                }
              />
            </div>
          ))}
        </AccordionSection>
      ) : null}

      {show("nextUpdate") || show("advanceServer")
        ? (
            [
              ["nextUpdate", "Next update card"] as const,
              ["advanceServer", "Advance Server card"] as const,
            ]
              .filter(([key]) => show(key))
              .map(([key, fallbackLabel]) => (
                <AccordionSection
                  key={key}
                  id={key}
                  label={labelOf(key, fallbackLabel)}
                  open={openIds.has(key)}
                  onToggle={() => onToggle(key)}
                >
                  {(
                    [
                      ["badge", "Badge"],
                      ["code", "Code"],
                      ["title", "Title"],
                      ["meta", "Meta"],
                      ["metaIso", "Meta ISO"],
                      ["summary", "Summary"],
                      ["note", "Note"],
                      ["primaryCta", "Primary CTA"],
                      ["primaryPath", "Primary path"],
                      ["secondaryCta", "Secondary CTA"],
                      ["secondaryPath", "Secondary path"],
                      ["officialUrl", "Publisher URL"],
                    ] as const
                  ).map(([field, label]) => {
                    if (field === "officialUrl" && key !== "advanceServer") return null;
                    if (field === "primaryPath" && key === "advanceServer") return null;
                    if (field === "metaIso" && key === "advanceServer") return null;
                    const value = String(cards[key][field] ?? "");
                    return (
                      <Field
                        key={`${key}-${field}`}
                        label={label}
                        value={value}
                        multiline={field === "summary" || field === "note"}
                        onChange={(v) =>
                          onPatch((p) => ({
                            ...p,
                            [key]: { ...p[key], [field]: v },
                          }))
                        }
                      />
                    );
                  })}
                  <LinesEditor
                    label="Feature lines"
                    lines={cards[key].features}
                    onChange={(features) =>
                      onPatch((p) => ({
                        ...p,
                        [key]: { ...p[key], features },
                      }))
                    }
                  />
                </AccordionSection>
              ))
          )
        : null}
    </>
  );
}
