import {
  GTA6_APK_INTRO,
  GTA6_APK_SECTIONS,
  GTA6_APK_TITLE,
  GTA6_APK_UPDATED,
} from "@/src/features/gta6Calculator/gta6-apk-copy";
import "@/src/features/gta6Calculator/gta6-cheat.css";

/** Article only — same reading column as the cheat page, no download UI. */
export function Gta6ApkArticle() {
  return (
    <article className="gta6-cheat-page">
      <header className="gta6-cheat-head">
        <h1 className="gta6-cheat-title">{GTA6_APK_TITLE}</h1>
        <p className="gta6-cheat-meta-line">Last Updated: {GTA6_APK_UPDATED}</p>
        {GTA6_APK_INTRO.map((paragraph) => (
          <p key={paragraph.slice(0, 48)} className="gta6-cheat-lead">
            {paragraph}
          </p>
        ))}
      </header>
      <div className="gta6-cheat-body">
        {GTA6_APK_SECTIONS.map((section) => (
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
