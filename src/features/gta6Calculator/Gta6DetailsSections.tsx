import { Gta6InteractiveMap } from "@/src/features/gta6Calculator/Gta6InteractiveMap";
import type { Gta6PageContent } from "@/src/lib/gta6PageTypes";

/** Long-form game details + specs for SEO — matches GTA page card design. */
export function Gta6DetailsSections({ page }: { page: Gta6PageContent }) {
  return (
    <>
      <section className="gta6-band gta6-details" id="details" aria-labelledby="gta6-details-title">
        <h2 id="gta6-details-title">{page.overview.title}</h2>
        <div className="gta6-details-panel">
          <p className="gta6-details-lead">{page.overview.lead}</p>
          {page.overview.paragraphs.map((p) => (
            <p key={p.slice(0, 48)} className="gta6-details-copy">
              {p}
            </p>
          ))}
        </div>
      </section>

      <section className="gta6-band gta6-details" id="story" aria-labelledby="gta6-story-title">
        <h2 id="gta6-story-title">{page.story.title}</h2>
        <div className="gta6-details-panel">
          <p className="gta6-details-copy">{page.story.body}</p>
        </div>
      </section>

      <section className="gta6-band gta6-map" id="map" aria-labelledby="gta6-map-title">
        <h2 id="gta6-map-title">{page.map.title}</h2>
        <p className="gta6-tba-intro">{page.map.lead}</p>

        <Gta6InteractiveMap pins={page.map.pins} disclaimer={page.map.disclaimer} />

        <div className="gta6-details-panel gta6-map-state">
          <h3 className="gta6-map-subtitle">{page.map.stateName}</h3>
          <p className="gta6-details-copy">{page.map.stateSummary}</p>
        </div>
        <h3 className="gta6-map-heading">Cities and regions</h3>
        <div className="gta6-platform-grid">
          {page.map.places.map((place) => (
            <article key={place.name} className="gta6-platform-card">
              <h3>{place.name}</h3>
              <p className="gta6-map-type">{place.type}</p>
              <p>{place.summary}</p>
            </article>
          ))}
        </div>
        <h3 className="gta6-map-heading">Named landmarks</h3>
        <dl className="gta6-spec-grid">
          {page.map.landmarks.map((spot) => (
            <div key={spot.name} className="gta6-spec-card">
              <dt>{spot.name}</dt>
              <dd>{spot.note}</dd>
            </div>
          ))}
        </dl>
        <p className="gta6-tba-intro gta6-map-note">{page.map.note}</p>
      </section>

      <section className="gta6-band gta6-specs" id="timeline" aria-labelledby="gta6-timeline-title">
        <h2 id="gta6-timeline-title">{page.timeline.title}</h2>
        <dl className="gta6-spec-grid">
          {page.timeline.rows.map((row) => (
            <div key={row.label} className="gta6-spec-card">
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="gta6-band gta6-specs" id="specs" aria-labelledby="gta6-specs-title">
        <h2 id="gta6-specs-title">{page.specsTitle}</h2>
        <dl className="gta6-spec-grid">
          {page.specs.map((row) => (
            <div key={row.label} className="gta6-spec-card">
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="gta6-band gta6-editions" id="editions" aria-labelledby="gta6-editions-title">
        <h2 id="gta6-editions-title">{page.editions.title}</h2>
        <p className="gta6-tba-intro">{page.editions.intro}</p>
        <div className="gta6-editions-grid">
          {page.editions.cards.map((card) => (
            <article key={card.title} className="gta6-platform-card">
              <h3>{card.title}</h3>
              <ul className="gta6-editions-list">
                {card.points.map((point) => (
                  <li key={point.slice(0, 56)}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section
        className="gta6-band gta6-platforms"
        id="platforms"
        aria-labelledby="gta6-platforms-title"
      >
        <h2 id="gta6-platforms-title">{page.platformsTitle}</h2>
        <div className="gta6-platform-grid">
          {page.platforms.map((item) => (
            <article key={item.title} className="gta6-platform-card">
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        className="gta6-band gta6-tba"
        id="not-confirmed"
        aria-labelledby="gta6-tba-title"
      >
        <h2 id="gta6-tba-title">{page.notConfirmed.title}</h2>
        <p className="gta6-tba-intro">{page.notConfirmed.intro}</p>
        <div className="gta6-platform-grid">
          {page.notConfirmed.items.map((item) => (
            <article key={item.title} className="gta6-platform-card">
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="gta6-band gta6-howto" id="how-to" aria-labelledby="gta6-howto-title">
        <h2 id="gta6-howto-title">{page.calcGuide.title}</h2>
        <ol className="gta6-howto-list">
          {page.calcGuide.steps.map((step, index) => (
            <li key={step}>
              <span className="gta6-howto-num" aria-hidden>
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
