import Link from "next/link";
import type {
  PubgMobileLiteApkFactsBlock,
  PubgMobileLiteApkInstallBlock,
} from "@/src/lib/pubgMobileLiteApkSections";

type Props = {
  install: PubgMobileLiteApkInstallBlock;
  facts: PubgMobileLiteApkFactsBlock;
};

/** Stacked info cards: safe install steps + facts table. */
export function PubgMobileLiteApkInfoBlocks({ install, facts }: Props) {
  return (
    <div className="lite-beta-info">
      <section className="lite-beta-info-block" aria-labelledby="pml-apk-install-title">
        <h2 id="pml-apk-install-title" className="lite-beta-info-heading">
          {install.title}
        </h2>
        <div className="lite-beta-info-card">
          <p className="lite-beta-info-text">{install.intro}</p>
        </div>
        <div className="lite-beta-info-card">
          <ol className="lite-beta-info-steps">
            {install.steps.map((step, index) => (
              <li key={step}>
                <span className="lite-beta-info-step-num" aria-hidden>
                  {index + 1}.
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
        <Link className="lite-beta-info-guide-link" href={install.guideHref}>
          {install.guideLabel}
          <span aria-hidden> →</span>
        </Link>
      </section>

      <section className="lite-beta-info-block" aria-labelledby="pml-apk-facts-title">
        <h2 id="pml-apk-facts-title" className="lite-beta-info-heading">
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
