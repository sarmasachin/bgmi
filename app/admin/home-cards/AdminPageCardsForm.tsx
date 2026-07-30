"use client";

import type { FfHomeCards, HomeCardSectionId } from "@/src/lib/homeCardsTypes";

export function Field({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <label style={{ display: "grid", gap: 6, marginBottom: 12 }}>
      <span style={{ fontSize: 12, color: "#94a3b8" }}>{label}</span>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #334155",
            background: "#0f172a",
            color: "#e2e8f0",
            resize: "vertical",
          }}
        />
      ) : (
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #334155",
            background: "#0f172a",
            color: "#e2e8f0",
          }}
        />
      )}
    </label>
  );
}

export function LinesEditor({
  label,
  lines,
  onChange,
}: {
  label: string;
  lines: string[];
  onChange: (lines: string[]) => void;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>{label}</div>
      {lines.map((line, index) => (
        <div key={`${label}-${index}`} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <input
            value={line}
            onChange={(e) => {
              const next = [...lines];
              next[index] = e.target.value;
              onChange(next);
            }}
            style={{
              flex: 1,
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid #334155",
              background: "#0f172a",
              color: "#e2e8f0",
            }}
          />
          <button
            type="button"
            className="admin-news-btn admin-news-btn-edit"
            onClick={() => onChange(lines.filter((_, i) => i !== index))}
            disabled={lines.length <= 1}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        className="admin-news-btn admin-news-btn-edit"
        onClick={() => onChange([...lines, ""])}
      >
        Add line
      </button>
    </div>
  );
}

function AccordionSection({
  id,
  label,
  open,
  onToggle,
  children,
}: {
  id: HomeCardSectionId;
  label: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        border: "1px solid #1e293b",
        borderRadius: 12,
        marginBottom: 12,
        overflow: "hidden",
        background: "#0b1220",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`home-card-panel-${id}`}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "14px 16px",
          background: "transparent",
          border: "none",
          color: "#e2e8f0",
          cursor: "pointer",
          textAlign: "left",
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        <span>{label}</span>
        <span style={{ color: "#94a3b8", fontSize: 12 }}>{open ? "Hide" : "Show"}</span>
      </button>
      {open ? (
        <div id={`home-card-panel-${id}`} style={{ padding: "0 16px 16px" }}>
          {children}
        </div>
      ) : null}
    </div>
  );
}

type Props = {
  cards: FfHomeCards;
  sectionIds: readonly HomeCardSectionId[];
  sectionLabels: Map<HomeCardSectionId, string>;
  openIds: Set<HomeCardSectionId>;
  onToggle: (id: HomeCardSectionId) => void;
  onPatch: (updater: (prev: FfHomeCards) => FfHomeCards) => void;
};

/** Accordion editors for the active Page Cards tab. */
export function AdminPageCardsForm({
  cards,
  sectionIds,
  sectionLabels,
  openIds,
  onToggle,
  onPatch,
}: Props) {
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

      {show("patchStrip") ? (
        <AccordionSection
          id="patchStrip"
          label={labelOf("patchStrip", "Patch strip")}
          open={openIds.has("patchStrip")}
          onToggle={() => onToggle("patchStrip")}
        >
          {(
            [
              ["label", "Badge label"],
              ["typeLabel", "Type label"],
              ["dateLabel", "Date label"],
              ["dateIso", "Date ISO"],
              ["code", "Code"],
              ["summary", "Summary"],
              ["articlePath", "Primary link path"],
              ["newsListPath", "Secondary link path"],
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

      {show("roleTips") ? (
        <AccordionSection
          id="roleTips"
          label={labelOf("roleTips", "Role tips")}
          open={openIds.has("roleTips")}
          onToggle={() => onToggle("roleTips")}
        >
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
                Role: {item.role}
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
      ) : null}

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
