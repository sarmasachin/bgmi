"use client";

import type { Gta6PageContent } from "@/src/lib/gta6PageTypes";
import { GtaAdd, GtaBlock, GtaField, GtaLines, GtaRemove } from "./gta6AdminFields";

type Patch = (updater: (page: Gta6PageContent) => Gta6PageContent) => void;

export function AdminGta6CheatForm({ page, onPatch }: { page: Gta6PageContent; onPatch: Patch }) {
  const cheat = page.cheat;
  function setCheat(partial: Partial<Gta6PageContent["cheat"]>) {
    onPatch((prev) => ({ ...prev, cheat: { ...prev.cheat, ...partial } }));
  }

  return (
    <>
      <GtaBlock title="Cheat page">
        <GtaField label="SEO title" value={cheat.seoTitle} onChange={(seoTitle) => setCheat({ seoTitle })} />
        <GtaField
          label="Meta description"
          value={cheat.seoDescription}
          multiline
          onChange={(seoDescription) => setCheat({ seoDescription })}
        />
        <GtaField label="Heading" value={cheat.title} onChange={(title) => setCheat({ title })} />
        <GtaField label="Last updated" value={cheat.updated} onChange={(updated) => setCheat({ updated })} />
        <GtaLines label="Intro (one paragraph per line)" lines={cheat.intro} onChange={(intro) => setCheat({ intro })} />
        <GtaField label="Table heading" value={cheat.tableTitle} onChange={(tableTitle) => setCheat({ tableTitle })} />
        <GtaField
          label="Table warning"
          value={cheat.tableWarning}
          multiline
          onChange={(tableWarning) => setCheat({ tableWarning })}
        />
        <GtaField label="Verify heading" value={cheat.verifyTitle} onChange={(verifyTitle) => setCheat({ verifyTitle })} />
        <GtaLines label="Verify paragraphs" lines={cheat.verify} onChange={(verify) => setCheat({ verify })} />
        <GtaField label="How-to heading" value={cheat.howToTitle} onChange={(howToTitle) => setCheat({ howToTitle })} />
        {cheat.howTo.map((block, index) => (
          <div key={`how-${index}`} style={{ marginBottom: 10 }}>
            <GtaField
              label="How-to title"
              value={block.h3}
              onChange={(h3) =>
                onPatch((p) => ({
                  ...p,
                  cheat: {
                    ...p.cheat,
                    howTo: p.cheat.howTo.map((item, i) => (i === index ? { ...item, h3 } : item)),
                  },
                }))
              }
            />
            <GtaLines
              label="Paragraphs"
              lines={block.paragraphs}
              onChange={(paragraphs) =>
                onPatch((p) => ({
                  ...p,
                  cheat: {
                    ...p.cheat,
                    howTo: p.cheat.howTo.map((item, i) => (i === index ? { ...item, paragraphs } : item)),
                  },
                }))
              }
            />
            <GtaRemove
              onClick={() =>
                onPatch((p) => ({ ...p, cheat: { ...p.cheat, howTo: p.cheat.howTo.filter((_, i) => i !== index) } }))
              }
            />
          </div>
        ))}
        <GtaAdd
          label="Add how-to"
          onClick={() =>
            onPatch((p) => ({ ...p, cheat: { ...p.cheat, howTo: [...p.cheat.howTo, { h3: "", paragraphs: [] }] } }))
          }
        />
        <GtaField
          label="Benefits heading"
          value={cheat.benefitsTitle}
          onChange={(benefitsTitle) => setCheat({ benefitsTitle })}
        />
        {cheat.benefits.map((item, index) => (
          <div key={`benefit-${index}`} style={{ marginBottom: 10 }}>
            <GtaField
              label="Benefit title"
              value={item.h3}
              onChange={(h3) =>
                onPatch((p) => ({
                  ...p,
                  cheat: {
                    ...p.cheat,
                    benefits: p.cheat.benefits.map((row, i) => (i === index ? { ...row, h3 } : row)),
                  },
                }))
              }
            />
            <GtaField
              label="Body"
              value={item.body}
              multiline
              onChange={(body) =>
                onPatch((p) => ({
                  ...p,
                  cheat: {
                    ...p.cheat,
                    benefits: p.cheat.benefits.map((row, i) => (i === index ? { ...row, body } : row)),
                  },
                }))
              }
            />
            <GtaRemove
              onClick={() =>
                onPatch((p) => ({
                  ...p,
                  cheat: { ...p.cheat, benefits: p.cheat.benefits.filter((_, i) => i !== index) },
                }))
              }
            />
          </div>
        ))}
        <GtaAdd
          label="Add benefit"
          onClick={() =>
            onPatch((p) => ({ ...p, cheat: { ...p.cheat, benefits: [...p.cheat.benefits, { h3: "", body: "" }] } }))
          }
        />
        <GtaField label="PC heading" value={cheat.pcTitle} onChange={(pcTitle) => setCheat({ pcTitle })} />
        <GtaLines label="PC paragraphs" lines={cheat.pc} onChange={(pc) => setCheat({ pc })} />
        <GtaField label="PC how heading" value={cheat.pcHowTitle} onChange={(pcHowTitle) => setCheat({ pcHowTitle })} />
        <GtaLines label="PC how paragraphs" lines={cheat.pcHow} onChange={(pcHow) => setCheat({ pcHow })} />
        <GtaLines label="PC methods" lines={cheat.pcMethods} onChange={(pcMethods) => setCheat({ pcMethods })} />
        <GtaLines label="PC how ending" lines={cheat.pcHowEnd} onChange={(pcHowEnd) => setCheat({ pcHowEnd })} />
        <GtaField label="Expect heading" value={cheat.expectTitle} onChange={(expectTitle) => setCheat({ expectTitle })} />
        <GtaLines label="Expect paragraphs" lines={cheat.expect} onChange={(expect) => setCheat({ expect })} />
        <GtaField
          label="Conclusion heading"
          value={cheat.conclusionTitle}
          onChange={(conclusionTitle) => setCheat({ conclusionTitle })}
        />
        <GtaLines label="Conclusion" lines={cheat.conclusion} onChange={(conclusion) => setCheat({ conclusion })} />
      </GtaBlock>

      <GtaBlock title="Cheat FAQ">
        {cheat.faqs.map((item, index) => (
          <div key={`cfaq-${index}`} style={{ marginBottom: 10 }}>
            <GtaField
              label="Question"
              value={item.question}
              onChange={(question) =>
                onPatch((p) => ({
                  ...p,
                  cheat: {
                    ...p.cheat,
                    faqs: p.cheat.faqs.map((row, i) => (i === index ? { ...row, question } : row)),
                  },
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
                  cheat: {
                    ...p.cheat,
                    faqs: p.cheat.faqs.map((row, i) => (i === index ? { ...row, answer } : row)),
                  },
                }))
              }
            />
            <GtaRemove
              onClick={() =>
                onPatch((p) => ({ ...p, cheat: { ...p.cheat, faqs: p.cheat.faqs.filter((_, i) => i !== index) } }))
              }
            />
          </div>
        ))}
        <GtaAdd
          label="Add FAQ"
          onClick={() =>
            onPatch((p) => ({
              ...p,
              cheat: { ...p.cheat, faqs: [...p.cheat.faqs, { question: "", answer: "" }] },
            }))
          }
        />
      </GtaBlock>
    </>
  );
}
