"use client";

import type { Gta6PageContent } from "@/src/lib/gta6PageTypes";
import { GtaBlock, GtaField, GtaLines } from "./gta6AdminFields";

type Patch = (updater: (page: Gta6PageContent) => Gta6PageContent) => void;

export function AdminGta6HomeForm({ page, onPatch }: { page: Gta6PageContent; onPatch: Patch }) {
  const home = page.home;
  function setHome(partial: Partial<Gta6PageContent["home"]>) {
    onPatch((prev) => ({ ...prev, home: { ...prev.home, ...partial } }));
  }

  return (
    <GtaBlock title="Calculator page">
      <GtaField label="SEO title" value={home.seoTitle} onChange={(seoTitle) => setHome({ seoTitle })} />
      <GtaField
        label="Meta description"
        value={home.seoDescription}
        multiline
        onChange={(seoDescription) => setHome({ seoDescription })}
      />
      <GtaLines label="SEO keywords (one per line)" lines={home.keywords} onChange={(keywords) => setHome({ keywords })} />
      <GtaField label="Eyebrow" value={home.eyebrow} onChange={(eyebrow) => setHome({ eyebrow })} />
      <GtaField label="Heading" value={home.title} onChange={(title) => setHome({ title })} />
      <GtaField label="Lead" value={home.lead} multiline onChange={(lead) => setHome({ lead })} />
      <GtaField label="Banner" value={home.banner} multiline onChange={(banner) => setHome({ banner })} />
      <GtaField label="Primary button" value={home.primaryLabel} onChange={(primaryLabel) => setHome({ primaryLabel })} />
      <GtaField
        label="Secondary button"
        value={home.secondaryLabel}
        onChange={(secondaryLabel) => setHome({ secondaryLabel })}
      />
      <GtaField label="Hero image path" value={home.imageSrc} onChange={(imageSrc) => setHome({ imageSrc })} />
      <GtaField label="Hero image alt" value={home.imageAlt} onChange={(imageAlt) => setHome({ imageAlt })} />
      <GtaField
        label="Calculator heading"
        value={home.calculatorTitle}
        onChange={(calculatorTitle) => setHome({ calculatorTitle })}
      />
    </GtaBlock>
  );
}
