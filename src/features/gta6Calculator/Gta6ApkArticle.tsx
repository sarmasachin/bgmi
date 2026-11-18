import type { Gta6PageContent } from "@/src/lib/gta6PageTypes";
import "@/src/features/gta6Calculator/gta6-cheat.css";

/** Article only — same reading column as the cheat page, no download UI. */
export function Gta6ApkArticle({ apk }: { apk: Gta6PageContent["apk"] }) {
  return (
    <article className="gta6-cheat-page">
      <header className="gta6-cheat-head">
        <h1 className="gta6-cheat-title">{apk.title}</h1>
        <p className="gta6-cheat-meta-line">Last Updated: {apk.updated}</p>
        {apk.intro.map((paragraph) => (
          <p key={paragraph.slice(0, 48)} className="gta6-cheat-lead">
            {paragraph}
          </p>
        ))}
      </header>
      <div className="gta6-cheat-body">
        {apk.sections.map((section) => (
          <section key={section.h2}>
            <h2>{section.h2}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 48)}>{paragraph}</p>
            ))}
          </section>
        ))}
      </div>
    </article>
  );
}
