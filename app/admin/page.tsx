import { PublishDraftButton } from "@/src/components/admin/PublishDraftButton";
import {
  getAdminDashboardData,
  type IntegrationMetric,
} from "@/src/server/repositories/adminDashboardRepository";

function formatDateTime(value?: Date | string | null) {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function IntegrationCard({ title, metric }: { title: string; metric: IntegrationMetric }) {
  return (
    <article className="admin-card">
      <h3>{title}</h3>
      <p className="admin-card-value">{metric.value}</p>
      <small>{metric.note}</small>
    </article>
  );
}

export default async function AdminDashboardPage() {
  const data = await getAdminDashboardData();

  return (
    <section className="admin-section admin-dashboard-root">
      <h1>Admin Dashboard</h1>
      <p className="admin-dashboard-subtitle">Operational overview, SEO checks, and system health in one place.</p>

      <div className="admin-dashboard-section">
        <h2 className="admin-dashboard-section-title">Pending Overview</h2>
        <div className="admin-card-grid">
        <article className="admin-card">
          <h3>Pending Comments</h3>
          <p className="admin-card-value">{data.pendingComments}</p>
          <small>Needs moderation</small>
        </article>
        <article className="admin-card">
          <h3>Pending Approvals</h3>
          <p className="admin-card-value">{data.pendingApprovals}</p>
          <small>Waiting for approval</small>
        </article>
        <article className="admin-card">
          <h3>Failed Uploads</h3>
          <p className="admin-card-value">{data.failedUploads}</p>
          <small>Recent failure logs</small>
        </article>
        </div>
      </div>

      <div className="admin-dashboard-section">
        <h2 className="admin-dashboard-section-title">Publishing & Activity</h2>
        <div className="admin-dashboard-grid">
        <article className="admin-card admin-dashboard-panel">
          <h3>Draft List + One-Click Publish</h3>
          {data.draftNews.length ? (
            <div className="admin-dashboard-list">
              {data.draftNews.map((item) => (
                <div key={item.id} className="admin-dashboard-row">
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.slug ?? "-"}</p>
                  </div>
                  <PublishDraftButton id={item.id} />
                </div>
              ))}
            </div>
          ) : (
            <p className="admin-dashboard-empty">No draft news found.</p>
          )}
        </article>

        <article className="admin-card admin-dashboard-panel">
          <h3>Last Edits (News/Page)</h3>
          {data.lastEdits.length ? (
            <div className="admin-dashboard-list">
              {data.lastEdits.map((item) => (
                <div key={`${item.kind}-${item.id}`} className="admin-dashboard-row compact">
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.kind}</p>
                  </div>
                  <small>{formatDateTime(item.updatedAt)}</small>
                </div>
              ))}
            </div>
          ) : (
            <p className="admin-dashboard-empty">No edit history found.</p>
          )}
        </article>

        <article className="admin-card admin-dashboard-panel">
          <h3>Most Viewed News</h3>
          {data.mostViewedNews.length ? (
            <div className="admin-dashboard-list">
              {data.mostViewedNews.map((item) => (
                <div key={item.id} className="admin-dashboard-row compact">
                  <strong>{item.title}</strong>
                  <small>{item.count}</small>
                </div>
              ))}
            </div>
          ) : (
            <p className="admin-dashboard-empty">No view tracking data yet.</p>
          )}
        </article>

        <article className="admin-card admin-dashboard-panel">
          <h3>Most Clicked News</h3>
          {data.mostClickedNews.length ? (
            <div className="admin-dashboard-list">
              {data.mostClickedNews.map((item) => (
                <div key={item.id} className="admin-dashboard-row compact">
                  <strong>{item.title}</strong>
                  <small>{item.count}</small>
                </div>
              ))}
            </div>
          ) : (
            <p className="admin-dashboard-empty">No click tracking data yet.</p>
          )}
        </article>
        </div>
      </div>

      <div className="admin-dashboard-section">
        <h2 className="admin-dashboard-section-title">SEO URL Alerts</h2>
        <div className="admin-card-grid">
        <article className="admin-card">
          <h3>404 Slugs</h3>
          <p className="admin-card-value">{data.slug404Count}</p>
          <small>From audit payload status 404</small>
        </article>
        <article className="admin-card">
          <h3>Missing Canonical</h3>
          <p className="admin-card-value">{data.missingCanonicalCount}</p>
          <small>Pages with empty canonical URL</small>
        </article>
        <article className="admin-card">
          <h3>Duplicate Slug Alert</h3>
          <p className="admin-card-value">{data.duplicateSlugCount}</p>
          <small>Duplicate slugs in news/pages</small>
        </article>
        </div>
      </div>

      <div className="admin-dashboard-section">
        <h2 className="admin-dashboard-section-title">Image Quality Alerts</h2>
        <div className="admin-card-grid">
        <article className="admin-card">
          <h3>Missing Feature Image</h3>
          <p className="admin-card-value">{data.missingFeatureImageCount}</p>
          <small>News items without feature image</small>
        </article>
        <article className="admin-card">
          <h3>Wrong Aspect Ratio</h3>
          <p className="admin-card-value">{data.wrongAspectRatioCount}</p>
          <small>Checked from local uploads</small>
        </article>
        <article className="admin-card">
          <h3>Heavy Image Size</h3>
          <p className="admin-card-value">{data.heavyImageCount}</p>
          <small>Local uploads above 800 KB</small>
        </article>
        </div>
      </div>

      <div className="admin-dashboard-section">
        <h2 className="admin-dashboard-section-title">Content Quality</h2>
        <div className="admin-card-grid">
        <article className="admin-card">
          <h3>Very Short Articles</h3>
          <p className="admin-card-value">{data.shortArticleCount}</p>
          <small>Article text less than 300 chars</small>
        </article>
        <article className="admin-card">
          <h3>Missing Headings</h3>
          <p className="admin-card-value">{data.missingHeadingsCount}</p>
          <small>No H1-H6 heading in article content</small>
        </article>
        <article className="admin-card">
          <h3>No Internal Links</h3>
          <p className="admin-card-value">{data.noInternalLinksCount}</p>
          <small>No relative/internal anchor links</small>
        </article>
        </div>
      </div>

      <div className="admin-dashboard-section">
        <h2 className="admin-dashboard-section-title">Search Insights</h2>
        <article className="admin-card admin-dashboard-panel">
        <h3>Users Search Terms</h3>
        {data.searchTerms.length ? (
          <div className="admin-dashboard-list">
            {data.searchTerms.map((item) => (
              <div key={item.term} className="admin-dashboard-row compact">
                <strong>{item.term}</strong>
                <small>{item.count}</small>
              </div>
            ))}
          </div>
        ) : (
          <p className="admin-dashboard-empty">No search tracking terms found.</p>
        )}
        </article>
      </div>

      <div className="admin-dashboard-section">
        <h2 className="admin-dashboard-section-title">Core Web Vitals (Google)</h2>
        <div className="admin-card-grid">
        <IntegrationCard title="LCP (Mobile)" metric={data.lcpMobile} />
        <IntegrationCard title="LCP (Desktop)" metric={data.lcpDesktop} />
        <IntegrationCard title="INP (Mobile)" metric={data.inpMobile} />
        <IntegrationCard title="INP (Desktop)" metric={data.inpDesktop} />
        <IntegrationCard title="CLS (Mobile)" metric={data.clsMobile} />
        <IntegrationCard title="CLS (Desktop)" metric={data.clsDesktop} />
        </div>
      </div>

      <div className="admin-dashboard-section">
        <h2 className="admin-dashboard-section-title">Page Scores (Google)</h2>
        <div className="admin-card-grid">
        <IntegrationCard title="Performance Score" metric={data.performanceScore} />
        <IntegrationCard title="SEO Score" metric={data.seoScore} />
        <IntegrationCard title="Accessibility Score" metric={data.accessibilityScore} />
        </div>
      </div>

      <div className="admin-dashboard-section">
        <h2 className="admin-dashboard-section-title">Indexing Health (Google)</h2>
        <div className="admin-card-grid">
        <IntegrationCard title="Indexed Pages" metric={data.indexedPages} />
        <IntegrationCard title="Excluded Pages" metric={data.excludedPages} />
        <IntegrationCard title="Crawl Errors" metric={data.crawlErrors} />
        </div>
      </div>

      <div className="admin-dashboard-section">
        <h2 className="admin-dashboard-section-title">URL Experience & Schema (Google)</h2>
        <div className="admin-card-grid">
        <IntegrationCard title="URLs Poor" metric={data.poorUrls} />
        <IntegrationCard title="URLs Needs Improvement" metric={data.needsImprovementUrls} />
        <IntegrationCard title="Article/Breadcrumb Schema Errors" metric={data.structuredDataErrors} />
        </div>
      </div>

      <div className="admin-dashboard-section">
        <h2 className="admin-dashboard-section-title">System Issues</h2>
        <div className="admin-card-grid">
        <article className="admin-card">
          <h3>Backup Fail</h3>
          <p className="admin-card-value">{data.backupFail}</p>
          <small>From audit logs</small>
        </article>
        <article className="admin-card">
          <h3>API Error</h3>
          <p className="admin-card-value">{data.apiErrors}</p>
          <small>From audit logs</small>
        </article>
        <article className="admin-card">
          <h3>DB Issue</h3>
          <p className="admin-card-value">{data.dbIssue}</p>
          <small>Connection health</small>
        </article>
        </div>
      </div>

      <div className="admin-dashboard-section">
        <h2 className="admin-dashboard-section-title">SEO Missing Summary</h2>
        <div className="admin-card-grid">
        <article className="admin-card">
          <h3>SEO Missing (News)</h3>
          <p className="admin-card-value">{data.seoMissingNews}</p>
          <small>Missing meta title/description/image</small>
        </article>
        <article className="admin-card">
          <h3>SEO Missing (Pages)</h3>
          <p className="admin-card-value">{data.seoMissingPages}</p>
          <small>Missing meta title/description/image</small>
        </article>
        </div>
      </div>
    </section>
  );
}
