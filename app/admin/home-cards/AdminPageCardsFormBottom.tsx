"use client";

import type { HomeCardSectionId } from "@/src/lib/homeCardsTypes";
import type { AdminPageCardsFormSharedProps } from "./AdminPageCardsFormTop";
import { AccordionSection, Field, LinesEditor } from "./adminPageCardsFormUi";

/** Season → Explore sections. */
export function AdminPageCardsFormBottom({
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
      {show("season") ? (
        <AccordionSection
          id="season"
          label={labelOf("season", "Season")}
          open={openIds.has("season")}
          onToggle={() => onToggle("season")}
        >
          {(
            [
              ["badge", "Badge"],
              ["title", "Title"],
              ["summary", "Summary"],
              ["dateLabel", "Date label"],
              ["dateIso", "Date ISO"],
              ["ctaLabel", "Primary CTA"],
              ["ctaPath", "Primary path"],
              ["secondaryLabel", "Secondary CTA"],
              ["secondaryPath", "Secondary path"],
            ] as const
          ).map(([key, label]) => (
            <Field
              key={key}
              label={label}
              value={cards.season[key]}
              multiline={key === "summary"}
              onChange={(v) => onPatch((p) => ({ ...p, season: { ...p.season, [key]: v } }))}
            />
          ))}
        </AccordionSection>
      ) : null}

      {show("proTips") ? (
        <AccordionSection
          id="proTips"
          label={labelOf("proTips", "Pro tips")}
          open={openIds.has("proTips")}
          onToggle={() => onToggle("proTips")}
        >
          <Field
            label="Section title"
            value={cards.proTips.title}
            onChange={(title) => onPatch((p) => ({ ...p, proTips: { ...p.proTips, title } }))}
          />
          <Field
            label="Lead"
            value={cards.proTips.lead}
            multiline
            onChange={(lead) => onPatch((p) => ({ ...p, proTips: { ...p.proTips, lead } }))}
          />
          <Field
            label="CTA label"
            value={cards.proTips.ctaLabel}
            onChange={(ctaLabel) => onPatch((p) => ({ ...p, proTips: { ...p.proTips, ctaLabel } }))}
          />
          {cards.proTips.items.map((item, index) => (
            <div
              key={item.id}
              style={{ borderTop: "1px solid #1e293b", paddingTop: 12, marginTop: 8 }}
            >
              <div style={{ fontSize: 13, color: "#67e8f9", marginBottom: 8 }}>Tip: {item.id}</div>
              <Field
                label="Title"
                value={item.title}
                onChange={(title) =>
                  onPatch((p) => {
                    const items = [...p.proTips.items];
                    items[index] = { ...items[index], title };
                    return { ...p, proTips: { ...p.proTips, items } };
                  })
                }
              />
              <Field
                label="Tip text"
                value={item.tip}
                multiline
                onChange={(tip) =>
                  onPatch((p) => {
                    const items = [...p.proTips.items];
                    items[index] = { ...items[index], tip };
                    return { ...p, proTips: { ...p.proTips, items } };
                  })
                }
              />
            </div>
          ))}
        </AccordionSection>
      ) : null}

      {show("howItWorks") ? (
        <AccordionSection
          id="howItWorks"
          label={labelOf("howItWorks", "How it works")}
          open={openIds.has("howItWorks")}
          onToggle={() => onToggle("howItWorks")}
        >
          <Field
            label="Section title"
            value={cards.howItWorks.title}
            onChange={(title) =>
              onPatch((p) => ({ ...p, howItWorks: { ...p.howItWorks, title } }))
            }
          />
          <Field
            label="Subtitle"
            value={cards.howItWorks.subtitle}
            multiline
            onChange={(subtitle) =>
              onPatch((p) => ({ ...p, howItWorks: { ...p.howItWorks, subtitle } }))
            }
          />
          {cards.howItWorks.steps.map((step, index) => (
            <div
              key={`step-${index}`}
              style={{ borderTop: "1px solid #1e293b", paddingTop: 12, marginTop: 8 }}
            >
              <div style={{ fontSize: 13, color: "#67e8f9", marginBottom: 8 }}>Step {index + 1}</div>
              <Field
                label="Step title"
                value={step.title}
                onChange={(title) =>
                  onPatch((p) => {
                    const steps = [...p.howItWorks.steps];
                    steps[index] = { ...steps[index], title };
                    return { ...p, howItWorks: { ...p.howItWorks, steps } };
                  })
                }
              />
              <LinesEditor
                label="Bullets"
                lines={step.bullets}
                onChange={(bullets) =>
                  onPatch((p) => {
                    const steps = [...p.howItWorks.steps];
                    steps[index] = { ...steps[index], bullets };
                    return { ...p, howItWorks: { ...p.howItWorks, steps } };
                  })
                }
              />
            </div>
          ))}
        </AccordionSection>
      ) : null}

      {show("comparison") ? (
        <AccordionSection
          id="comparison"
          label={labelOf("comparison", "Comparison")}
          open={openIds.has("comparison")}
          onToggle={() => onToggle("comparison")}
        >
          <Field
            label="Compare title"
            value={cards.comparison.title}
            onChange={(title) =>
              onPatch((p) => ({ ...p, comparison: { ...p.comparison, title } }))
            }
          />
          <Field
            label="CTA before link"
            value={cards.comparison.ctaBeforeLink}
            onChange={(ctaBeforeLink) =>
              onPatch((p) => ({ ...p, comparison: { ...p.comparison, ctaBeforeLink } }))
            }
          />
          <Field
            label="CTA link label"
            value={cards.comparison.ctaLinkLabel}
            onChange={(ctaLinkLabel) =>
              onPatch((p) => ({ ...p, comparison: { ...p.comparison, ctaLinkLabel } }))
            }
          />
          <Field
            label="CTA href"
            value={cards.comparison.ctaHref}
            onChange={(ctaHref) =>
              onPatch((p) => ({ ...p, comparison: { ...p.comparison, ctaHref } }))
            }
          />
          <Field
            label="RAM table title"
            value={cards.comparison.ramTitle}
            onChange={(ramTitle) =>
              onPatch((p) => ({ ...p, comparison: { ...p.comparison, ramTitle } }))
            }
          />
          <Field
            label="Note"
            value={cards.comparison.note}
            multiline
            onChange={(note) => onPatch((p) => ({ ...p, comparison: { ...p.comparison, note } }))}
          />
          {cards.comparison.vsRows.map((row, index) => (
            <div
              key={`vs-${index}`}
              style={{ borderTop: "1px solid #1e293b", paddingTop: 12, marginTop: 8 }}
            >
              <div style={{ fontSize: 13, color: "#67e8f9", marginBottom: 8 }}>
                Compare row {index + 1}
              </div>
              {(
                [
                  ["point", "Point"],
                  ["freefire", "Free Fire"],
                  ["freefireMax", "Free Fire Max"],
                ] as const
              ).map(([field, label]) => (
                <Field
                  key={field}
                  label={label}
                  value={row[field]}
                  onChange={(v) =>
                    onPatch((p) => {
                      const vsRows = [...p.comparison.vsRows];
                      vsRows[index] = { ...vsRows[index], [field]: v };
                      return { ...p, comparison: { ...p.comparison, vsRows } };
                    })
                  }
                />
              ))}
            </div>
          ))}
          {cards.comparison.ramRows.map((row, index) => (
            <div
              key={`ram-${index}`}
              style={{ borderTop: "1px solid #1e293b", paddingTop: 12, marginTop: 8 }}
            >
              <div style={{ fontSize: 13, color: "#67e8f9", marginBottom: 8 }}>
                RAM row {index + 1}
              </div>
              {(
                [
                  ["ram", "RAM"],
                  ["general", "General"],
                  ["redDot", "Red Dot"],
                  ["scope2x", "2X"],
                  ["scope4x", "4X"],
                  ["sniper", "Sniper"],
                  ["freeLook", "Free Look"],
                ] as const
              ).map(([field, label]) => (
                <Field
                  key={field}
                  label={label}
                  value={row[field]}
                  onChange={(v) =>
                    onPatch((p) => {
                      const ramRows = [...p.comparison.ramRows];
                      ramRows[index] = { ...ramRows[index], [field]: v };
                      return { ...p, comparison: { ...p.comparison, ramRows } };
                    })
                  }
                />
              ))}
            </div>
          ))}
        </AccordionSection>
      ) : null}

      {show("explore") ? (
        <AccordionSection
          id="explore"
          label={labelOf("explore", "Explore")}
          open={openIds.has("explore")}
          onToggle={() => onToggle("explore")}
        >
          <Field
            label="Section title"
            value={cards.explore.title}
            onChange={(title) => onPatch((p) => ({ ...p, explore: { ...p.explore, title } }))}
          />
          {(["freefire", "freefireMax"] as const).map((cardKey) => (
            <div
              key={cardKey}
              style={{ borderTop: "1px solid #1e293b", paddingTop: 12, marginTop: 8 }}
            >
              <div style={{ fontSize: 13, color: "#67e8f9", marginBottom: 8 }}>
                Card: {cardKey === "freefire" ? "Free Fire" : "Free Fire Max"}
              </div>
              <Field
                label="Title"
                value={cards.explore[cardKey].title}
                onChange={(title) =>
                  onPatch((p) => ({
                    ...p,
                    explore: {
                      ...p.explore,
                      [cardKey]: { ...p.explore[cardKey], title },
                    },
                  }))
                }
              />
              <Field
                label="Text"
                value={cards.explore[cardKey].text}
                multiline
                onChange={(text) =>
                  onPatch((p) => ({
                    ...p,
                    explore: {
                      ...p.explore,
                      [cardKey]: { ...p.explore[cardKey], text },
                    },
                  }))
                }
              />
              <Field
                label="Button label"
                value={cards.explore[cardKey].buttonLabel}
                onChange={(buttonLabel) =>
                  onPatch((p) => ({
                    ...p,
                    explore: {
                      ...p.explore,
                      [cardKey]: { ...p.explore[cardKey], buttonLabel },
                    },
                  }))
                }
              />
              <Field
                label="Href"
                value={cards.explore[cardKey].href}
                onChange={(href) =>
                  onPatch((p) => ({
                    ...p,
                    explore: {
                      ...p.explore,
                      [cardKey]: { ...p.explore[cardKey], href },
                    },
                  }))
                }
              />
              <LinesEditor
                label="Points"
                lines={cards.explore[cardKey].points}
                onChange={(points) =>
                  onPatch((p) => ({
                    ...p,
                    explore: {
                      ...p.explore,
                      [cardKey]: { ...p.explore[cardKey], points },
                    },
                  }))
                }
              />
            </div>
          ))}
        </AccordionSection>
      ) : null}
    </>
  );
}
