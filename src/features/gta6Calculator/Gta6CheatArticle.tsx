import { FaqAccordion } from "@/src/components/FaqAccordion";
import {
  GTA6_CHEAT_BENEFITS,
  GTA6_CHEAT_CONCLUSION,
  GTA6_CHEAT_EXPECT,
  GTA6_CHEAT_FAQS,
  GTA6_CHEAT_HOW_TO,
  GTA6_CHEAT_INTRO,
  GTA6_CHEAT_PC,
  GTA6_CHEAT_PC_HOW,
  GTA6_CHEAT_PC_HOW_END,
  GTA6_CHEAT_PC_METHODS,
  GTA6_CHEAT_TABLE_WARNING,
  GTA6_CHEAT_TITLE,
  GTA6_CHEAT_UPDATED,
  GTA6_CHEAT_VERIFY,
} from "@/src/features/gta6Calculator/gta6-cheat-copy";
import { Gta6CheatTable } from "@/src/features/gta6Calculator/Gta6CheatTable";
import "@/src/features/gta6Calculator/gta6-cheat.css";
import "@/src/features/gta6Calculator/gta6-details.css";

export function Gta6CheatArticle() {
  return (
    <article className="gta6-cheat-page">
      <header className="gta6-cheat-head">
        <h1 className="gta6-cheat-title">{GTA6_CHEAT_TITLE}</h1>
        <p className="gta6-cheat-meta-line">Last Updated: {GTA6_CHEAT_UPDATED}</p>
        {GTA6_CHEAT_INTRO.map((paragraph) => (
          <p key={paragraph.slice(0, 40)} className="gta6-cheat-lead">
            {paragraph}
          </p>
        ))}
      </header>

      <div id="cheat-table" className="gta6-cheat-table-block">
        <h2>GTA 6 Cheat Codes for PS5 and Xbox Series X|S</h2>
        <p className="gta6-cheat-table-note">{GTA6_CHEAT_TABLE_WARNING}</p>
        <div className="gta6-cheat-table-wrap">
          <Gta6CheatTable />
        </div>
      </div>

      <div className="gta6-cheat-body">
        <h2>How we label every code</h2>
        {GTA6_CHEAT_VERIFY.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}

        <h2>How to enter GTA 6 cheat codes</h2>
        {GTA6_CHEAT_HOW_TO.map((block) => (
          <div key={block.h3}>
            <h3>{block.h3}</h3>
            {block.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>
        ))}

        <h2>Benefits of cheat codes in GTA</h2>
        {GTA6_CHEAT_BENEFITS.map((item) => (
          <div key={item.h3}>
            <h3>{item.h3}</h3>
            <p>{item.body}</p>
          </div>
        ))}

        <h2>GTA 6 Cheat Codes for PC</h2>
        {GTA6_CHEAT_PC.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}

        <h2>How GTA 6 PC cheats will probably work</h2>
        {GTA6_CHEAT_PC_HOW.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}
        <ul className="gta6-cheat-list">
          {GTA6_CHEAT_PC_METHODS.map((item) => (
            <li key={item.slice(0, 40)}>{item}</li>
          ))}
        </ul>
        {GTA6_CHEAT_PC_HOW_END.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}

        <h2>Other cheats to expect in GTA 6</h2>
        {GTA6_CHEAT_EXPECT.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}

        <h2>Conclusion</h2>
        {GTA6_CHEAT_CONCLUSION.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}

      </div>

      <section className="gta6-faq gta6-cheat-faq" id="faq" aria-label="Frequently Asked Questions">
        <div className="gta6-faq-panel gta6-cheat-faq-panel">
          <FaqAccordion
            title="Frequently Asked Questions"
            items={GTA6_CHEAT_FAQS.map((item, index) => ({
              id: `gta6-cheat-faq-${index + 1}`,
              question: item.q,
              answer: item.a,
            }))}
          />
        </div>
      </section>
    </article>
  );
}
