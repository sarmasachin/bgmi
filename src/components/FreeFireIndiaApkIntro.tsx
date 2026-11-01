import styles from "@/src/components/FreeFireIndiaApkIntro.module.css";
import {
  isUsableFreeFireHeroImageSrc,
  type FreeFireApkPageContent,
} from "@/src/lib/freeFireApkPage";
import type { RatingSummary } from "@/src/server/repositories/ratingSummaryRepository";

const SITE_ART = "/ff/free-fire-india-icon.png";

function factValue(
  rows: FreeFireApkPageContent["facts"]["rows"],
  pattern: RegExp,
): string {
  return rows.find((row) => pattern.test(row.label))?.value.trim() || "";
}

export function FreeFireIndiaApkIntro({
  page,
  ratingSummary,
}: {
  page: FreeFireApkPageContent;
  ratingSummary: RatingSummary | null;
}) {
  const imageSrc = isUsableFreeFireHeroImageSrc(page.heroImage) ? page.heroImage : SITE_ART;
  const title =
    factValue(page.facts.rows, /^game$/i) ||
    page.heroTitle.replace(/\s+APK$/i, "").trim() ||
    "Free Fire India";
  const publisher =
    factValue(page.facts.rows, /publisher/i) || "Garena International III";
  const rawDate = page.countdown.dateText.trim();
  // Hide the old admin-instruction placeholder if it was saved as page content.
  const dateText = /set the official update date in admin/i.test(rawDate) ? "" : rawDate;
  const fileSize = factValue(page.facts.rows, /file\s*size/i) || "389.7 MB";
  const androidOs =
    factValue(page.facts.rows, /android\s*os|^android$/i) || "Android 5.0+";
  const contentRating =
    factValue(page.facts.rows, /content\s*rating|^teen$|age\s*rating/i) || "Teen";
  const rating =
    ratingSummary && ratingSummary.count > 0 && ratingSummary.average != null
      ? {
          value: ratingSummary.average.toFixed(1),
          label: `${ratingSummary.count} ${ratingSummary.count === 1 ? "Review" : "Reviews"}`,
        }
      : null;

  return (
    <div className={styles.wrap}>
      <div className={styles.top}>
        <img className={styles.shot} src={imageSrc} alt={page.heroImageAlt || page.heroTitle} />
        <div className={styles.copy}>
          <p className={styles.title}>{title}</p>
          {publisher ? <p className={styles.publisher}>{publisher}</p> : null}
          {dateText ? <p className={styles.date}>{dateText}</p> : null}
        </div>
      </div>

      <ul className={styles.details} aria-label="App details">
        {rating ? (
          <li className={styles.detail}>
            <span className={styles.value}>
              {rating.value}
              <i className={`fa-solid fa-star ${styles.star}`} aria-hidden />
            </span>
            <span className={styles.label}>{rating.label}</span>
          </li>
        ) : null}
        <li className={styles.detail}>
          <span className={styles.value}>{fileSize}</span>
          <span className={styles.label}>File Size</span>
        </li>
        <li className={styles.detail}>
          <span className={styles.value} aria-label="Verified">
            <i className={`fa-solid fa-shield-halved ${styles.security}`} aria-hidden />
          </span>
          <span className={styles.label}>Security</span>
        </li>
        <li className={styles.detail}>
          <span className={styles.value}>
            <span className={styles.teenBadge} aria-hidden>
              {contentRating.charAt(0).toUpperCase()}
            </span>
          </span>
          <span className={styles.label}>{contentRating}</span>
        </li>
        <li className={styles.detail}>
          <span className={styles.value}>{androidOs}</span>
          <span className={styles.label}>Android OS</span>
        </li>
      </ul>
    </div>
  );
}
