import type { Gta6PageContent } from "@/src/lib/gta6PageTypes";
import { sanitizeHtml } from "@/src/lib/sanitizeHtml";
import "@/src/features/gta6Calculator/gta6-cheat.css";

/** Article only — same reading column as the cheat page, no download UI. */
export function Gta6ApkArticle({ apk }: { apk: Gta6PageContent["apk"] }) {
  return (
    <article className="gta6-cheat-page">
      <header className="gta6-cheat-head">
        <h1 className="gta6-cheat-title">{apk.title}</h1>
        <p className="gta6-cheat-meta-line">Last Updated: {apk.updated}</p>
        {apk.featureImage.trim() ? (
          <img
            src={apk.featureImage.trim()}
            alt={apk.featureImageAlt.trim() || apk.title}
            style={{ display: "block", width: "100%", height: "auto", margin: "0 0 18px", borderRadius: 12 }}
          />
        ) : null}
      </header>
      <div
        className="gta6-cheat-body"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(apk.articleHtml) }}
      />
    </article>
  );
}
