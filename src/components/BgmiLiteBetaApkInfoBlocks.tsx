import Link from "next/link";
import type {
  BgmiLiteBetaFactsBlock,
  BgmiLiteBetaPreRegisterBlock,
} from "@/src/lib/bgmiLiteBetaApkSections";

type Props = {
  preRegister: BgmiLiteBetaPreRegisterBlock;
  facts: BgmiLiteBetaFactsBlock;
};

/** Stacked info cards: How to Pre-Register + What We Know So Far table. */
export function BgmiLiteBetaApkInfoBlocks({ preRegister, facts }: Props) {
  return (
    <div className="lite-beta-info">
      <section className="lite-beta-info-block" aria-labelledby="lite-beta-prereg-title">
        <h2 id="lite-beta-prereg-title" className="lite-beta-info-heading">
          {preRegister.title}
        </h2>
        <div className="lite-beta-info-card">
          <p className="lite-beta-info-text">{preRegister.intro}</p>
        </div>
        <div className="lite-beta-info-card">
          <ol className="lite-beta-info-steps">
            {preRegister.steps.map((step, index) => (
              <li key={step}>
                <span className="lite-beta-info-step-num" aria-hidden>
                  {index + 1}.
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
        <Link className="lite-beta-info-guide-link" href={preRegister.guideHref}>
          {preRegister.guideLabel}
          <span aria-hidden> →</span>
        </Link>
      </section>

      <section className="lite-beta-info-block" aria-labelledby="lite-beta-facts-title">
        <h2 id="lite-beta-facts-title" className="lite-beta-info-heading">
          {facts.title}
        </h2>
        <div className="lite-beta-info-card lite-beta-facts-card">
          <dl className="lite-beta-facts-list">
            {facts.rows.map((row) => (
              <div key={row.label} className="lite-beta-facts-row">
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <p className="lite-beta-facts-note">{facts.note}</p>
      </section>
    </div>
  );
}
