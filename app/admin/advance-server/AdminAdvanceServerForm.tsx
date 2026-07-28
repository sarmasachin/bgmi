"use client";

import type { CSSProperties, ReactNode } from "react";
import type {
  AdvanceServerPageSectionId,
  FfAdvanceServerPageContent,
} from "@/src/lib/advanceServerPageTypes";

function Field({
  label,
  value,
  onChange,
  multiline,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  rows?: number;
}) {
  return (
    <label style={{ display: "grid", gap: 6, marginBottom: 12 }}>
      <span style={{ fontSize: 12, color: "#94a3b8" }}>{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
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

function LinesEditor({
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

const fieldControlStyle: CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #334155",
  background: "#0f172a",
  color: "#e2e8f0",
};

/** Parse countdown ISO into date (YYYY-MM-DD) + time (HH:mm) for IST (+05:30). */
function splitCountdownIso(iso: string): { date: string; time: string } {
  const fallback = { date: "", time: "00:00" };
  const trimmed = iso.trim();
  if (!trimmed) return fallback;

  const match = trimmed.match(
    /^(\d{4}-\d{2}-\d{2})[T ](\d{2}):(\d{2})(?::\d{2})?(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?$/,
  );
  if (match) {
    return { date: match[1], time: `${match[2]}:${match[3]}` };
  }

  const ms = Date.parse(trimmed);
  if (!Number.isFinite(ms)) return fallback;
  // Format in IST so admin always sees India time.
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(ms));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    time: `${get("hour")}:${get("minute")}`,
  };
}

function joinCountdownIso(date: string, time: string): string {
  const safeDate = date.trim();
  const safeTime = (time.trim() || "00:00").slice(0, 5);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(safeDate)) return "";
  if (!/^\d{2}:\d{2}$/.test(safeTime)) return `${safeDate}T00:00:00+05:30`;
  return `${safeDate}T${safeTime}:00+05:30`;
}

function formatCountdownPreview(iso: string): string {
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return "Pick a valid date";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(ms));
}

function CountdownTargetFields({
  targetIso,
  onChange,
}: {
  targetIso: string;
  onChange: (iso: string) => void;
}) {
  const { date, time } = splitCountdownIso(targetIso);
  const previewIso = joinCountdownIso(date, time) || targetIso;

  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 0.8fr)",
          gap: 12,
        }}
      >
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>Target date</span>
          <input
            type="date"
            value={date}
            onChange={(e) => onChange(joinCountdownIso(e.target.value, time))}
            style={fieldControlStyle}
          />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>Target time (IST)</span>
          <input
            type="time"
            value={time}
            onChange={(e) => onChange(joinCountdownIso(date, e.target.value))}
            style={fieldControlStyle}
          />
        </label>
      </div>
      <p style={{ margin: "10px 0 0", fontSize: 12, color: "#5eead4" }}>
        Countdown ends: {formatCountdownPreview(previewIso)}
      </p>
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
  id: AdvanceServerPageSectionId;
  label: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
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
        aria-controls={`as-panel-${id}`}
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
        <div id={`as-panel-${id}`} style={{ padding: "0 16px 16px" }}>
          {children}
        </div>
      ) : null}
    </div>
  );
}

type Props = {
  page: FfAdvanceServerPageContent;
  openIds: Set<AdvanceServerPageSectionId>;
  onToggle: (id: AdvanceServerPageSectionId) => void;
  onPatch: (updater: (prev: FfAdvanceServerPageContent) => FfAdvanceServerPageContent) => void;
};

export function AdminAdvanceServerForm({ page, openIds, onToggle, onPatch }: Props) {
  return (
    <>
      <AccordionSection
        id="seo"
        label="SEO"
        open={openIds.has("seo")}
        onToggle={() => onToggle("seo")}
      >
        <Field
          label="Page title (internal)"
          value={page.title}
          onChange={(title) => onPatch((p) => ({ ...p, title }))}
        />
        <Field
          label="SEO title"
          value={page.seoTitle}
          onChange={(seoTitle) => onPatch((p) => ({ ...p, seoTitle }))}
        />
        <Field
          label="SEO description"
          value={page.seoDescription}
          multiline
          rows={4}
          onChange={(seoDescription) => onPatch((p) => ({ ...p, seoDescription }))}
        />
        <LinesEditor
          label="SEO keywords"
          lines={page.seoKeywords}
          onChange={(seoKeywords) => onPatch((p) => ({ ...p, seoKeywords }))}
        />
      </AccordionSection>

      <AccordionSection
        id="hero"
        label="Hero"
        open={openIds.has("hero")}
        onToggle={() => onToggle("hero")}
      >
        <Field
          label="H1 title"
          value={page.heroTitle}
          onChange={(heroTitle) => onPatch((p) => ({ ...p, heroTitle }))}
        />
        <Field
          label="Subtitle"
          value={page.subtitleEn}
          multiline
          rows={4}
          onChange={(subtitleEn) => onPatch((p) => ({ ...p, subtitleEn }))}
        />
        <Field
          label="APK button label"
          value={page.apkCta}
          onChange={(apkCta) => onPatch((p) => ({ ...p, apkCta }))}
        />
        <Field
          label="Official Garena URL"
          value={page.officialUrl}
          onChange={(officialUrl) => onPatch((p) => ({ ...p, officialUrl }))}
        />
        <Field
          label="Hero image path"
          value={page.heroImage}
          onChange={(heroImage) => onPatch((p) => ({ ...p, heroImage }))}
        />
        <Field
          label="Hero image alt"
          value={page.heroImageAlt}
          onChange={(heroImageAlt) => onPatch((p) => ({ ...p, heroImageAlt }))}
        />
        <label style={{ display: "grid", gap: 6, marginBottom: 12 }}>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>Hero layout</span>
          <select
            value={page.heroLayout}
            onChange={(e) =>
              onPatch((p) => ({
                ...p,
                heroLayout: e.target.value === "center" ? "center" : "split",
              }))
            }
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #334155",
              background: "#0f172a",
              color: "#e2e8f0",
            }}
          >
            <option value="split">Split (text + image)</option>
            <option value="center">Center stack</option>
          </select>
        </label>
        {page.pills.map((pill, index) => (
          <Field
            key={`pill-${index}`}
            label={`Pill ${index + 1}`}
            value={pill.label}
            onChange={(label) =>
              onPatch((p) => {
                const pills = [...p.pills];
                pills[index] = { label };
                return { ...p, pills };
              })
            }
          />
        ))}
      </AccordionSection>

      <AccordionSection
        id="countdown"
        label="Countdown"
        open={openIds.has("countdown")}
        onToggle={() => onToggle("countdown")}
      >
        <Field
          label="Countdown label"
          value={page.countdown.label}
          onChange={(label) =>
            onPatch((p) => ({ ...p, countdown: { ...p.countdown, label } }))
          }
        />
        <CountdownTargetFields
          targetIso={page.countdown.targetIso}
          onChange={(targetIso) =>
            onPatch((p) => ({ ...p, countdown: { ...p.countdown, targetIso } }))
          }
        />
        <Field
          label="Date text under timer (shown on page)"
          value={page.countdown.dateText}
          onChange={(dateText) =>
            onPatch((p) => ({ ...p, countdown: { ...p.countdown, dateText } }))
          }
        />
      </AccordionSection>

      <AccordionSection
        id="cards"
        label="Content cards"
        open={openIds.has("cards")}
        onToggle={() => onToggle("cards")}
      >
        {page.cards.map((card, index) => (
          <div
            key={card.id}
            style={{
              borderTop: index === 0 ? "none" : "1px solid #1e293b",
              paddingTop: index === 0 ? 0 : 14,
              marginTop: index === 0 ? 0 : 10,
            }}
          >
            <div style={{ fontSize: 13, color: "#67e8f9", marginBottom: 8 }}>
              Card: {card.id}
            </div>
            <Field
              label="Badge"
              value={card.badge}
              onChange={(badge) =>
                onPatch((p) => {
                  const cards = [...p.cards];
                  cards[index] = { ...cards[index], badge };
                  return { ...p, cards };
                })
              }
            />
            <Field
              label="Icon (Font Awesome class, e.g. fa-circle-info)"
              value={card.icon}
              onChange={(icon) =>
                onPatch((p) => {
                  const cards = [...p.cards];
                  cards[index] = { ...cards[index], icon };
                  return { ...p, cards };
                })
              }
            />
            <Field
              label="Title"
              value={card.title}
              onChange={(title) =>
                onPatch((p) => {
                  const cards = [...p.cards];
                  cards[index] = { ...cards[index], title };
                  return { ...p, cards };
                })
              }
            />
            <Field
              label="Summary"
              value={card.summary}
              multiline
              onChange={(summary) =>
                onPatch((p) => {
                  const cards = [...p.cards];
                  cards[index] = { ...cards[index], summary };
                  return { ...p, cards };
                })
              }
            />
            <LinesEditor
              label="Bullet points"
              lines={card.points.length ? card.points : [""]}
              onChange={(points) =>
                onPatch((p) => {
                  const cards = [...p.cards];
                  cards[index] = { ...cards[index], points };
                  return { ...p, cards };
                })
              }
            />
            {card.pros ? (
              <LinesEditor
                label="Pros"
                lines={card.pros.length ? card.pros : [""]}
                onChange={(pros) =>
                  onPatch((p) => {
                    const cards = [...p.cards];
                    cards[index] = { ...cards[index], pros };
                    return { ...p, cards };
                  })
                }
              />
            ) : null}
            {card.cons ? (
              <LinesEditor
                label="Cons"
                lines={card.cons.length ? card.cons : [""]}
                onChange={(cons) =>
                  onPatch((p) => {
                    const cards = [...p.cards];
                    cards[index] = { ...cards[index], cons };
                    return { ...p, cards };
                  })
                }
              />
            ) : null}
            {card.links?.map((link, linkIndex) => (
              <div key={`${card.id}-link-${linkIndex}`} style={{ marginBottom: 8 }}>
                <Field
                  label={`Link ${linkIndex + 1} label`}
                  value={link.label}
                  onChange={(label) =>
                    onPatch((p) => {
                      const cards = [...p.cards];
                      const links = [...(cards[index].links ?? [])];
                      links[linkIndex] = { ...links[linkIndex], label };
                      cards[index] = { ...cards[index], links };
                      return { ...p, cards };
                    })
                  }
                />
                <Field
                  label={`Link ${linkIndex + 1} href`}
                  value={link.href}
                  onChange={(href) =>
                    onPatch((p) => {
                      const cards = [...p.cards];
                      const links = [...(cards[index].links ?? [])];
                      links[linkIndex] = { ...links[linkIndex], href };
                      cards[index] = { ...cards[index], links };
                      return { ...p, cards };
                    })
                  }
                />
              </div>
            ))}
          </div>
        ))}
      </AccordionSection>

      <AccordionSection
        id="tables"
        label="Tables"
        open={openIds.has("tables")}
        onToggle={() => onToggle("tables")}
      >
        {page.tables.map((table, tableIndex) => (
          <div
            key={table.id}
            style={{
              borderTop: tableIndex === 0 ? "none" : "1px solid #1e293b",
              paddingTop: tableIndex === 0 ? 0 : 14,
              marginTop: tableIndex === 0 ? 0 : 10,
            }}
          >
            <div style={{ fontSize: 13, color: "#67e8f9", marginBottom: 8 }}>
              Table: {table.id}
            </div>
            <Field
              label="Badge"
              value={table.badge}
              onChange={(badge) =>
                onPatch((p) => {
                  const tables = [...p.tables];
                  tables[tableIndex] = { ...tables[tableIndex], badge };
                  return { ...p, tables };
                })
              }
            />
            <Field
              label="Title"
              value={table.title}
              onChange={(title) =>
                onPatch((p) => {
                  const tables = [...p.tables];
                  tables[tableIndex] = { ...tables[tableIndex], title };
                  return { ...p, tables };
                })
              }
            />
            <Field
              label="Summary"
              value={table.summary}
              multiline
              onChange={(summary) =>
                onPatch((p) => {
                  const tables = [...p.tables];
                  tables[tableIndex] = { ...tables[tableIndex], summary };
                  return { ...p, tables };
                })
              }
            />
            {table.columns.map((col, colIndex) => (
              <Field
                key={`${table.id}-col-${colIndex}`}
                label={`Column ${colIndex + 1}`}
                value={col}
                onChange={(value) =>
                  onPatch((p) => {
                    const tables = [...p.tables];
                    const columns = [...tables[tableIndex].columns];
                    columns[colIndex] = value;
                    tables[tableIndex] = { ...tables[tableIndex], columns };
                    return { ...p, tables };
                  })
                }
              />
            ))}
            {table.rows.map((row, rowIndex) => (
              <div
                key={`${table.id}-row-${rowIndex}`}
                style={{ borderTop: "1px dashed #1e293b", paddingTop: 10, marginTop: 8 }}
              >
                <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>
                  Row {rowIndex + 1}
                </div>
                {row.map((cell, cellIndex) => (
                  <Field
                    key={`${table.id}-r${rowIndex}-c${cellIndex}`}
                    label={`Cell ${cellIndex + 1}`}
                    value={cell}
                    onChange={(value) =>
                      onPatch((p) => {
                        const tables = [...p.tables];
                        const rows = tables[tableIndex].rows.map((r) => [...r]);
                        rows[rowIndex][cellIndex] = value;
                        tables[tableIndex] = { ...tables[tableIndex], rows };
                        return { ...p, tables };
                      })
                    }
                  />
                ))}
              </div>
            ))}
          </div>
        ))}
      </AccordionSection>

      <AccordionSection
        id="faqs"
        label="FAQs"
        open={openIds.has("faqs")}
        onToggle={() => onToggle("faqs")}
      >
        {page.faqs.map((faq, index) => (
          <div
            key={faq.id}
            style={{
              borderTop: index === 0 ? "none" : "1px solid #1e293b",
              paddingTop: index === 0 ? 0 : 14,
              marginTop: index === 0 ? 0 : 10,
            }}
          >
            <div style={{ fontSize: 13, color: "#67e8f9", marginBottom: 8 }}>
              FAQ {index + 1}
            </div>
            <Field
              label="Question"
              value={faq.question}
              onChange={(question) =>
                onPatch((p) => {
                  const faqs = [...p.faqs];
                  faqs[index] = { ...faqs[index], question };
                  return { ...p, faqs };
                })
              }
            />
            <Field
              label="Answer"
              value={faq.answer}
              multiline
              rows={4}
              onChange={(answer) =>
                onPatch((p) => {
                  const faqs = [...p.faqs];
                  faqs[index] = { ...faqs[index], answer };
                  return { ...p, faqs };
                })
              }
            />
          </div>
        ))}
      </AccordionSection>
    </>
  );
}
