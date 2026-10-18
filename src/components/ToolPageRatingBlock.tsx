import { ClientErrorBoundary } from "@/src/components/ClientErrorBoundary";
import { RatingWidget } from "@/src/components/RatingWidget";
import { ratingWidgetRemountKey } from "@/src/lib/ratingWidgetKey";
import { androidApkAppSchema } from "@/src/lib/schema";
import type { RatingSummary } from "@/src/server/repositories/ratingSummaryRepository";

type Props = {
  pageKey: string;
  lead: string;
  ratingSummary: RatingSummary | null;
  appName: string;
  appDescription: string;
  appUrl: string;
  /** Web tools default to Any; APK guides can pass Android. */
  operatingSystem?: string;
};

/**
 * Shared Rate-this-page UI + SoftwareApplication JSON-LD (AggregateRating when real ratings exist).
 */
export function ToolPageRatingBlock({
  pageKey,
  lead,
  ratingSummary,
  appName,
  appDescription,
  appUrl,
  operatingSystem = "Any",
}: Props) {
  const appLd = androidApkAppSchema({
    name: appName,
    description: appDescription,
    url: appUrl,
    operatingSystem,
    ratingSummary,
  });

  return (
    <>
      <section className="page-tool-rating" aria-label="Rate this page">
        <div className="page-tool-rating-inner">
          <h2 className="page-tool-rating-title">Rate this page</h2>
          <p className="page-tool-rating-lead">{lead}</p>
          <ClientErrorBoundary label="Rating">
            <RatingWidget
              key={ratingWidgetRemountKey("tool", pageKey)}
              title=""
              targetType="tool"
              targetId={pageKey}
              initialSummary={ratingSummary}
            />
          </ClientErrorBoundary>
        </div>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appLd) }}
      />
    </>
  );
}
