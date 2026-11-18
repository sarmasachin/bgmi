import { ApkDownloadCountStat } from "@/src/components/ApkDownloadCountStat";
import styles from "@/src/components/FreeFireIndiaApkIntro.module.css";
import type { RatingSummary } from "@/src/server/repositories/ratingSummaryRepository";

type FactRow = { label: string; value: string };

function factValue(rows: FactRow[], pattern: RegExp): string {
  return rows.find((row) => pattern.test(row.label))?.value.trim() || "";
}

const UPDATE_DATE =
  /\b\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b/i;

/** Keep a real short date. Drop admin notes that have no date. */
export function cleanApkUpdateDate(raw: string): string {
  const text = raw.trim();
  if (!text || /set the official update date|estimated/i.test(text)) return "";
  const dated = text.match(UPDATE_DATE);
  if (dated) return dated[0].replace(/\s+/g, " ");
  if (text.length > 32 || /confirm|countdown|launch date/i.test(text)) return "";
  return text;
}

/** Store chips only fit a short value such as "389.7 MB" or "Android 5.0+". */
function compactStat(value: string): string {
  const text = value.trim();
  if (!text || text.length > 18) return "";
  return text;
}

/** Pull "1.4 GB" out of a longer admin sentence. */
function sizeToken(value: string): string {
  const match = value.match(/\d+(?:\.\d+)?\s*(?:GB|MB)\b/i);
  if (!match) return "";
  return match[0].replace(/\s+/g, " ").replace(/gb/i, "GB").replace(/mb/i, "MB");
}

type Props = {
  rows: FactRow[];
  heroTitle: string;
  fallbackTitle: string;
  imageSrc: string;
  imageAlt: string;
  dateText: string;
  /** Used when no short file-size fact is saved. */
  fileSizeFallback?: string;
  /** Used when no short Android fact is saved. */
  androidFallback?: string;
  /** Used when no short content-rating fact is saved. */
  contentRatingFallback?: string;
  pageKey: string;
  downloadCount?: number;
  ratingSummary: RatingSummary | null;
};

/** Same store header as Free Fire India: icon, publisher, last update, stat row. */
export function ApkStoreIntro({
  rows,
  heroTitle,
  fallbackTitle,
  imageSrc,
  imageAlt,
  dateText,
  fileSizeFallback = "",
  androidFallback = "",
  contentRatingFallback = "",
  pageKey,
  downloadCount = 0,
  ratingSummary,
}: Props) {
  const title =
    factValue(rows, /^game$/i) ||
    heroTitle.replace(/\s+APK$/i, "").trim() ||
    fallbackTitle;
  const publisher = factValue(rows, /publisher|developer/i);
  const labeledSize = factValue(rows, /file\s*size|download\s*size|^size$/i);
  const fileSize =
    compactStat(labeledSize) ||
    sizeToken(labeledSize) ||
    rows.map((row) => sizeToken(row.value)).find(Boolean) ||
    compactStat(fileSizeFallback) ||
    sizeToken(fileSizeFallback);
  const androidOs =
    compactStat(factValue(rows, /android\s*os|^android$/i)) || compactStat(androidFallback);
  const contentRating =
    compactStat(factValue(rows, /content\s*rating|^teen$|age\s*rating/i)) ||
    compactStat(contentRatingFallback);
  const date = cleanApkUpdateDate(dateText);
  const initial = (title.trim().charAt(0) || "A").toUpperCase();
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
        {imageSrc ? (
          <img className={styles.shot} src={imageSrc} alt={imageAlt || title} />
        ) : (
          <span className={styles.shotFallback} aria-hidden>
            {initial}
          </span>
        )}
        <div className={styles.copy}>
          <p className={styles.title}>{title}</p>
          {publisher ? <p className={styles.publisher}>{publisher}</p> : null}
          <p className={styles.lastUpdateLabel}>Last update</p>
          {date ? <p className={styles.date}>{date}</p> : null}
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
        <ApkDownloadCountStat
          pageKey={pageKey}
          initialCount={downloadCount}
          detailClassName={styles.detail}
          valueClassName={styles.value}
          labelClassName={styles.label}
          downloadValueClassName={styles.downloadValue}
          downloadIconClassName={styles.downloadIcon}
        />
        {fileSize ? (
          <li className={styles.detail}>
            <span className={styles.value}>{fileSize}</span>
            <span className={styles.label}>File Size</span>
          </li>
        ) : null}
        <li className={styles.detail}>
          <span className={styles.value} aria-label="Verified">
            <i className={`fa-solid fa-shield-halved ${styles.security}`} aria-hidden />
          </span>
          <span className={styles.label}>Security</span>
        </li>
        {contentRating ? (
          <li className={styles.detail}>
            <span className={styles.value}>
              <span className={styles.teenBadge} aria-hidden>
                {contentRating.charAt(0).toUpperCase()}
              </span>
            </span>
            <span className={styles.label}>{contentRating}</span>
          </li>
        ) : null}
        {androidOs ? (
          <li className={styles.detail}>
            <span className={styles.value}>{androidOs}</span>
            <span className={styles.label}>Android OS</span>
          </li>
        ) : null}
      </ul>
    </div>
  );
}
