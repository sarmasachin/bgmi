"use client";

import type { Gta6PageContent } from "@/src/lib/gta6PageTypes";
import { GtaAdd, GtaBlock, GtaField, GtaLines, GtaRemove } from "./gta6AdminFields";

type Patch = (updater: (page: Gta6PageContent) => Gta6PageContent) => void;

export function AdminGta6DetailsForm({ page, onPatch }: { page: Gta6PageContent; onPatch: Patch }) {
  return (
    <>
      <GtaBlock title="Overview">
        <GtaField
          label="Title"
          value={page.overview.title}
          onChange={(title) => onPatch((p) => ({ ...p, overview: { ...p.overview, title } }))}
        />
        <GtaField
          label="Lead"
          value={page.overview.lead}
          multiline
          onChange={(lead) => onPatch((p) => ({ ...p, overview: { ...p.overview, lead } }))}
        />
        <GtaLines
          label="Paragraphs (one per line)"
          lines={page.overview.paragraphs}
          onChange={(paragraphs) => onPatch((p) => ({ ...p, overview: { ...p.overview, paragraphs } }))}
        />
      </GtaBlock>

      <GtaBlock title="Story">
        <GtaField
          label="Title"
          value={page.story.title}
          onChange={(title) => onPatch((p) => ({ ...p, story: { ...p.story, title } }))}
        />
        <GtaField
          label="Body"
          value={page.story.body}
          multiline
          rows={5}
          onChange={(body) => onPatch((p) => ({ ...p, story: { ...p.story, body } }))}
        />
      </GtaBlock>

      <GtaBlock title="Specifications">
        <GtaField label="Heading" value={page.specsTitle} onChange={(specsTitle) => onPatch((p) => ({ ...p, specsTitle }))} />
        {page.specs.map((row, index) => (
          <div key={`spec-${index}`} style={{ display: "grid", gap: 8, marginBottom: 10 }}>
            <GtaField
              label="Label"
              value={row.label}
              onChange={(label) =>
                onPatch((p) => ({
                  ...p,
                  specs: p.specs.map((item, i) => (i === index ? { ...item, label } : item)),
                }))
              }
            />
            <GtaField
              label="Value"
              value={row.value}
              multiline
              onChange={(value) =>
                onPatch((p) => ({
                  ...p,
                  specs: p.specs.map((item, i) => (i === index ? { ...item, value } : item)),
                }))
              }
            />
            <GtaRemove onClick={() => onPatch((p) => ({ ...p, specs: p.specs.filter((_, i) => i !== index) }))} />
          </div>
        ))}
        <GtaAdd label="Add spec" onClick={() => onPatch((p) => ({ ...p, specs: [...p.specs, { label: "", value: "" }] }))} />
      </GtaBlock>

      <GtaBlock title="Editions">
        <GtaField
          label="Title"
          value={page.editions.title}
          onChange={(title) => onPatch((p) => ({ ...p, editions: { ...p.editions, title } }))}
        />
        <GtaField
          label="Intro"
          value={page.editions.intro}
          multiline
          onChange={(intro) => onPatch((p) => ({ ...p, editions: { ...p.editions, intro } }))}
        />
        {page.editions.cards.map((card, index) => (
          <div key={`edition-${index}`} style={{ marginBottom: 12 }}>
            <GtaField
              label="Card title"
              value={card.title}
              onChange={(title) =>
                onPatch((p) => ({
                  ...p,
                  editions: {
                    ...p.editions,
                    cards: p.editions.cards.map((item, i) => (i === index ? { ...item, title } : item)),
                  },
                }))
              }
            />
            <GtaLines
              label="Points"
              lines={card.points}
              onChange={(points) =>
                onPatch((p) => ({
                  ...p,
                  editions: {
                    ...p.editions,
                    cards: p.editions.cards.map((item, i) => (i === index ? { ...item, points } : item)),
                  },
                }))
              }
            />
            <GtaRemove
              onClick={() =>
                onPatch((p) => ({
                  ...p,
                  editions: { ...p.editions, cards: p.editions.cards.filter((_, i) => i !== index) },
                }))
              }
            />
          </div>
        ))}
        <GtaAdd
          label="Add edition card"
          onClick={() =>
            onPatch((p) => ({
              ...p,
              editions: { ...p.editions, cards: [...p.editions.cards, { title: "", points: [] }] },
            }))
          }
        />
      </GtaBlock>

      <GtaBlock title="Key dates">
        <GtaField
          label="Title"
          value={page.timeline.title}
          onChange={(title) => onPatch((p) => ({ ...p, timeline: { ...p.timeline, title } }))}
        />
        {page.timeline.rows.map((row, index) => (
          <div key={`date-${index}`} style={{ marginBottom: 10 }}>
            <GtaField
              label="Label"
              value={row.label}
              onChange={(label) =>
                onPatch((p) => ({
                  ...p,
                  timeline: {
                    ...p.timeline,
                    rows: p.timeline.rows.map((item, i) => (i === index ? { ...item, label } : item)),
                  },
                }))
              }
            />
            <GtaField
              label="Value"
              value={row.value}
              onChange={(value) =>
                onPatch((p) => ({
                  ...p,
                  timeline: {
                    ...p.timeline,
                    rows: p.timeline.rows.map((item, i) => (i === index ? { ...item, value } : item)),
                  },
                }))
              }
            />
            <GtaRemove
              onClick={() =>
                onPatch((p) => ({
                  ...p,
                  timeline: { ...p.timeline, rows: p.timeline.rows.filter((_, i) => i !== index) },
                }))
              }
            />
          </div>
        ))}
        <GtaAdd
          label="Add date"
          onClick={() =>
            onPatch((p) => ({ ...p, timeline: { ...p.timeline, rows: [...p.timeline.rows, { label: "", value: "" }] } }))
          }
        />
      </GtaBlock>

      <GtaBlock title="Platforms">
        <GtaField
          label="Heading"
          value={page.platformsTitle}
          onChange={(platformsTitle) => onPatch((p) => ({ ...p, platformsTitle }))}
        />
        {page.platforms.map((card, index) => (
          <div key={`platform-${index}`} style={{ marginBottom: 10 }}>
            <GtaField
              label="Title"
              value={card.title}
              onChange={(title) =>
                onPatch((p) => ({
                  ...p,
                  platforms: p.platforms.map((item, i) => (i === index ? { ...item, title } : item)),
                }))
              }
            />
            <GtaField
              label="Body"
              value={card.body}
              multiline
              onChange={(body) =>
                onPatch((p) => ({
                  ...p,
                  platforms: p.platforms.map((item, i) => (i === index ? { ...item, body } : item)),
                }))
              }
            />
            <GtaRemove onClick={() => onPatch((p) => ({ ...p, platforms: p.platforms.filter((_, i) => i !== index) }))} />
          </div>
        ))}
        <GtaAdd
          label="Add platform"
          onClick={() => onPatch((p) => ({ ...p, platforms: [...p.platforms, { title: "", body: "" }] }))}
        />
      </GtaBlock>

      <GtaBlock title="Not confirmed">
        <GtaField
          label="Title"
          value={page.notConfirmed.title}
          onChange={(title) => onPatch((p) => ({ ...p, notConfirmed: { ...p.notConfirmed, title } }))}
        />
        <GtaField
          label="Intro"
          value={page.notConfirmed.intro}
          multiline
          onChange={(intro) => onPatch((p) => ({ ...p, notConfirmed: { ...p.notConfirmed, intro } }))}
        />
        {page.notConfirmed.items.map((card, index) => (
          <div key={`tba-${index}`} style={{ marginBottom: 10 }}>
            <GtaField
              label="Title"
              value={card.title}
              onChange={(title) =>
                onPatch((p) => ({
                  ...p,
                  notConfirmed: {
                    ...p.notConfirmed,
                    items: p.notConfirmed.items.map((item, i) => (i === index ? { ...item, title } : item)),
                  },
                }))
              }
            />
            <GtaField
              label="Body"
              value={card.body}
              multiline
              onChange={(body) =>
                onPatch((p) => ({
                  ...p,
                  notConfirmed: {
                    ...p.notConfirmed,
                    items: p.notConfirmed.items.map((item, i) => (i === index ? { ...item, body } : item)),
                  },
                }))
              }
            />
            <GtaRemove
              onClick={() =>
                onPatch((p) => ({
                  ...p,
                  notConfirmed: {
                    ...p.notConfirmed,
                    items: p.notConfirmed.items.filter((_, i) => i !== index),
                  },
                }))
              }
            />
          </div>
        ))}
        <GtaAdd
          label="Add item"
          onClick={() =>
            onPatch((p) => ({
              ...p,
              notConfirmed: { ...p.notConfirmed, items: [...p.notConfirmed.items, { title: "", body: "" }] },
            }))
          }
        />
      </GtaBlock>

      <GtaBlock title="How to use the calculator">
        <GtaField
          label="Title"
          value={page.calcGuide.title}
          onChange={(title) => onPatch((p) => ({ ...p, calcGuide: { ...p.calcGuide, title } }))}
        />
        <GtaLines
          label="Steps (one per line)"
          lines={page.calcGuide.steps}
          onChange={(steps) => onPatch((p) => ({ ...p, calcGuide: { ...p.calcGuide, steps } }))}
        />
      </GtaBlock>

      <GtaBlock title="Calculator FAQ">
        {page.faq.map((item, index) => (
          <div key={`faq-${index}`} style={{ marginBottom: 10 }}>
            <GtaField
              label="Question"
              value={item.question}
              onChange={(question) =>
                onPatch((p) => ({
                  ...p,
                  faq: p.faq.map((row, i) => (i === index ? { ...row, question } : row)),
                }))
              }
            />
            <GtaField
              label="Answer"
              value={item.answer}
              multiline
              onChange={(answer) =>
                onPatch((p) => ({
                  ...p,
                  faq: p.faq.map((row, i) => (i === index ? { ...row, answer } : row)),
                }))
              }
            />
            <GtaRemove onClick={() => onPatch((p) => ({ ...p, faq: p.faq.filter((_, i) => i !== index) }))} />
          </div>
        ))}
        <GtaAdd
          label="Add FAQ"
          onClick={() => onPatch((p) => ({ ...p, faq: [...p.faq, { question: "", answer: "" }] }))}
        />
      </GtaBlock>
    </>
  );
}
