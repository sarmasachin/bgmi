import { FaqAccordion } from "@/src/components/FaqAccordion";
import { Gta6CheatTable } from "@/src/features/gta6Calculator/Gta6CheatTable";
import "@/src/features/gta6Calculator/gta6-cheat.css";
import "@/src/features/gta6Calculator/gta6-details.css";
import type { Gta6PageContent } from "@/src/lib/gta6PageTypes";

export function Gta6CheatArticle({ cheat }: { cheat: Gta6PageContent["cheat"] }) {
  return (
    <article className="gta6-cheat-page">
      <header className="gta6-cheat-head">
        <h1 className="gta6-cheat-title">{cheat.title}</h1>
        <p className="gta6-cheat-meta-line">Last Updated: {cheat.updated}</p>
        {cheat.intro.map((paragraph) => (
          <p key={paragraph.slice(0, 40)} className="gta6-cheat-lead">
            {paragraph}
          </p>
        ))}
      </header>

      <div id="cheat-table" className="gta6-cheat-table-block">
        <h2>{cheat.tableTitle}</h2>
        <p className="gta6-cheat-table-note">{cheat.tableWarning}</p>
        <div className="gta6-cheat-table-wrap">
          <Gta6CheatTable rows={cheat.rows} />
        </div>
      </div>

      <div className="gta6-cheat-body">
        <h2>{cheat.verifyTitle}</h2>
        {cheat.verify.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}

        <h2>{cheat.howToTitle}</h2>
        {cheat.howTo.map((block) => (
          <div key={block.h3}>
            <h3>{block.h3}</h3>
            {block.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>
        ))}

        <h2>{cheat.benefitsTitle}</h2>
        {cheat.benefits.map((item) => (
          <div key={item.h3}>
            <h3>{item.h3}</h3>
            <p>{item.body}</p>
          </div>
        ))}

        <h2>{cheat.pcTitle}</h2>
        {cheat.pc.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}

        <h2>{cheat.pcHowTitle}</h2>
        {cheat.pcHow.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}
        <ul className="gta6-cheat-list">
          {cheat.pcMethods.map((item) => (
            <li key={item.slice(0, 40)}>{item}</li>
          ))}
        </ul>
        {cheat.pcHowEnd.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}

        <h2>{cheat.expectTitle}</h2>
        {cheat.expect.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}

        <h2>{cheat.conclusionTitle}</h2>
        {cheat.conclusion.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}
      </div>

      <section className="gta6-faq gta6-cheat-faq" id="faq" aria-label="Frequently Asked Questions">
        <div className="gta6-faq-panel gta6-cheat-faq-panel">
          <FaqAccordion
            title="Frequently Asked Questions"
            items={cheat.faqs.map((item, index) => ({
              id: `gta6-cheat-faq-${index + 1}`,
              question: item.question,
              answer: item.answer,
            }))}
          />
        </div>
      </section>
    </article>
  );
}
