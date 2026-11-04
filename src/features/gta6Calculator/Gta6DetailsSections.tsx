import {
  GTA6_CALC_GUIDE,
  GTA6_NOT_CONFIRMED,
  GTA6_OVERVIEW,
  GTA6_PLATFORM_FEATURES,
  GTA6_SPECS,
} from "@/src/features/gta6Calculator/gta6-details";
import {
  GTA6_EDITIONS,
  GTA6_STORY,
  GTA6_TIMELINE,
} from "@/src/features/gta6Calculator/gta6-editions";
import { Gta6InteractiveMap } from "@/src/features/gta6Calculator/Gta6InteractiveMap";
import { GTA6_MAP } from "@/src/features/gta6Calculator/gta6-map";

/** Long-form game details + specs for SEO — matches GTA page card design. */
export function Gta6DetailsSections() {
  return (
    <>
      <section className="gta6-band gta6-details" id="details" aria-labelledby="gta6-details-title">
        <h2 id="gta6-details-title">{GTA6_OVERVIEW.title}</h2>
        <div className="gta6-details-panel">
          <p className="gta6-details-lead">{GTA6_OVERVIEW.lead}</p>
          {GTA6_OVERVIEW.paragraphs.map((p) => (
            <p key={p.slice(0, 48)} className="gta6-details-copy">
              {p}
            </p>
          ))}
        </div>
      </section>

      <section className="gta6-band gta6-details" id="story" aria-labelledby="gta6-story-title">
        <h2 id="gta6-story-title">{GTA6_STORY.title}</h2>
        <div className="gta6-details-panel">
          <p className="gta6-details-copy">{GTA6_STORY.body}</p>
        </div>
      </section>

      <section className="gta6-band gta6-map" id="map" aria-labelledby="gta6-map-title">
        <h2 id="gta6-map-title">{GTA6_MAP.title}</h2>
        <p className="gta6-tba-intro">{GTA6_MAP.lead}</p>

        <Gta6InteractiveMap />

        <div className="gta6-details-panel gta6-map-state">
          <h3 className="gta6-map-subtitle">{GTA6_MAP.state.name}</h3>
          <p className="gta6-details-copy">{GTA6_MAP.state.summary}</p>
        </div>
        <h3 className="gta6-map-heading">Cities and regions</h3>
        <div className="gta6-platform-grid">
          {GTA6_MAP.citiesAndRegions.map((place) => (
            <article key={place.name} className="gta6-platform-card">
              <h3>{place.name}</h3>
              <p className="gta6-map-type">{place.type}</p>
              <p>{place.summary}</p>
            </article>
          ))}
        </div>
        <h3 className="gta6-map-heading">Named landmarks</h3>
        <dl className="gta6-spec-grid">
          {GTA6_MAP.landmarks.map((spot) => (
            <div key={spot.name} className="gta6-spec-card">
              <dt>{spot.name}</dt>
              <dd>{spot.note}</dd>
            </div>
          ))}
        </dl>
        <p className="gta6-tba-intro gta6-map-note">{GTA6_MAP.note}</p>
      </section>

      <section className="gta6-band gta6-specs" id="timeline" aria-labelledby="gta6-timeline-title">
        <h2 id="gta6-timeline-title">{GTA6_TIMELINE.title}</h2>
        <dl className="gta6-spec-grid">
          {GTA6_TIMELINE.rows.map((row) => (
            <div key={row.label} className="gta6-spec-card">
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="gta6-band gta6-specs" id="specs" aria-labelledby="gta6-specs-title">
        <h2 id="gta6-specs-title">GTA 6 specifications</h2>
        <dl className="gta6-spec-grid">
          {GTA6_SPECS.map((row) => (
            <div key={row.label} className="gta6-spec-card">
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="gta6-band gta6-editions" id="editions" aria-labelledby="gta6-editions-title">
        <h2 id="gta6-editions-title">{GTA6_EDITIONS.title}</h2>
        <p className="gta6-tba-intro">{GTA6_EDITIONS.intro}</p>
        <div className="gta6-editions-grid">
          {GTA6_EDITIONS.cards.map((card) => (
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
        <h2 id="gta6-platforms-title">Platforms and features</h2>
        <div className="gta6-platform-grid">
          {GTA6_PLATFORM_FEATURES.map((item) => (
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
        <h2 id="gta6-tba-title">{GTA6_NOT_CONFIRMED.title}</h2>
        <p className="gta6-tba-intro">{GTA6_NOT_CONFIRMED.intro}</p>
        <div className="gta6-platform-grid">
          {GTA6_NOT_CONFIRMED.items.map((item) => (
            <article key={item.title} className="gta6-platform-card">
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="gta6-band gta6-howto" id="how-to" aria-labelledby="gta6-howto-title">
        <h2 id="gta6-howto-title">{GTA6_CALC_GUIDE.title}</h2>
        <ol className="gta6-howto-list">
          {GTA6_CALC_GUIDE.steps.map((step, index) => (
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
