type HomeFaqItem = {
  id: string;
  question: string;
  answer: string;
};

type Props = {
  wrapperClassName?: string;
  faqItems: HomeFaqItem[];
  game?: "bgmi" | "pubg";
};

/** Sync FAQ/article block — safe for client wrappers. */
export function ArticleFaqContent({
  wrapperClassName,
  faqItems,
  game = "bgmi",
}: Props) {
  const wrapClass = ["light-content-wrapper", wrapperClassName].filter(Boolean).join(" ");
  const gameName = game === "pubg" ? "PUBG Mobile" : "BGMI";

  return (
    <div className={wrapClass}>
      <div className="content-inner">
        <div className="article">
          <h2>{gameName} Sensitivity Calculator: Pro Settings Explained</h2>
          <p>
            Choosing the right sensitivity is one of the most important parts of
            winning in {gameName}. <b>Sensitivity Settings</b> is built to recommend
            camera and ADS values based on your phone&apos;s <b>RAM</b>,{" "}
            <b>Processing Speed</b>, and <b>Display Latency</b>.
          </p>
          <p>
            When you switch to 90 FPS, the screen refreshes faster, so older
            sensitivity settings can feel too fast. This tool keeps a balanced
            match between your device and FPS mode.
          </p>

          <h2>How to Get Zero Recoil Settings</h2>
          <p>
            Most players copy someone else&apos;s sensitivity codes. But a setup
            that works on an iPhone 15 Pro will not feel the same on a Poco X3.
            For recoil control, <b>ADS (Aim Down Sight)</b> sensitivity matters
            the most.
          </p>
        </div>

        <div className="faq-section">
          <h2>Frequently Asked Questions (FAQ)</h2>
          {faqItems.length > 0 ? (
            <div className="faq-grid">
              {faqItems.map((item) => (
                <div key={item.id} className="faq-card">
                  <h4>{item.question}</h4>
                  <p>{item.answer}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
