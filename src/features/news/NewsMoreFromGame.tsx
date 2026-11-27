import Link from "next/link";
import "./newsMoreFromGame.css";

export type MoreGameNewsItem = {
  id: string;
  href: string;
  title: string;
  date: string;
  image: string;
};

type Props = {
  heading: string;
  items: MoreGameNewsItem[];
  moreHref: string;
};

export function NewsMoreFromGame({ heading, items, moreHref }: Props) {
  return (
    <section className="news-more-game" aria-labelledby="news-more-game-title">
      <h2 id="news-more-game-title">{heading}</h2>
      {items.length ? (
        <div className="news-more-list">
          {items.map((item) => (
            <Link key={item.id} href={item.href} className="news-more-item">
              {item.image ? (
                <img src={item.image} alt="" />
              ) : (
                <span className="news-more-thumb" aria-hidden />
              )}
              <span className="news-more-copy">
                {item.date ? <span className="news-more-date">{item.date}</span> : null}
                <span className="news-more-title">{item.title}</span>
              </span>
            </Link>
          ))}
        </div>
      ) : null}
      <Link className="news-more-link" href={moreHref}>
        More news
      </Link>
    </section>
  );
}
