import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { PublishDraftButton } from "@/src/components/admin/PublishDraftButton";
import { prisma, tryPrisma } from "@/src/server/dbSafe";
import { mockStore } from "@/src/server/mockStore";

type DashboardItem = {
  id: string;
  title: string;
  slug?: string;
  updatedAt?: Date | string | null;
};

type RankedNews = {
  id: string;
  title: string;
  count: number;
};

type LastEditItem = {
  id: string;
  kind: "News" | "Page";
  title: string;
  updatedAt?: Date | string | null;
};

type SearchTermItem = {
  term: string;
  count: number;
};

type IntegrationMetric = {
  value: string;
  note: string;
};

type DashboardData = {
  pendingComments: number;
  pendingApprovals: number;
  failedUploads: number;
  draftNews: DashboardItem[];
  lastEdits: LastEditItem[];
  mostViewedNews: RankedNews[];
  mostClickedNews: RankedNews[];
  seoMissingNews: number;
  seoMissingPages: number;
  backupFail: number;
  apiErrors: number;
  dbIssue: number;
  slug404Count: number;
  missingCanonicalCount: number;
  duplicateSlugCount: number;
  missingFeatureImageCount: number;
  wrongAspectRatioCount: number;
  heavyImageCount: number;
  searchTerms: SearchTermItem[];
  shortArticleCount: number;
  missingHeadingsCount: number;
  noInternalLinksCount: number;
  lcpMobile: IntegrationMetric;
  lcpDesktop: IntegrationMetric;
  inpMobile: IntegrationMetric;
  inpDesktop: IntegrationMetric;
  clsMobile: IntegrationMetric;
  clsDesktop: IntegrationMetric;
  performanceScore: IntegrationMetric;
  seoScore: IntegrationMetric;
  accessibilityScore: IntegrationMetric;
  indexedPages: IntegrationMetric;
  excludedPages: IntegrationMetric;
  crawlErrors: IntegrationMetric;
  poorUrls: IntegrationMetric;
  needsImprovementUrls: IntegrationMetric;
  structuredDataErrors: IntegrationMetric;
};

function hasFailure(payload: unknown) {
  if (!payload || typeof payload !== "object") return false;
  const data = payload as Record<string, unknown>;
  const status = String(data.status ?? "").toLowerCase();
  const result = String(data.result ?? "").toLowerCase();
  const error = String(data.error ?? "").toLowerCase();
  return status.includes("fail") || result.includes("fail") || error.length > 0;
}

function getStatusCode(payload: unknown) {
  if (!payload || typeof payload !== "object") return 0;
  const data = payload as Record<string, unknown>;
  const raw = data.statusCode ?? data.status ?? 0;
  const code = Number(raw);
  return Number.isFinite(code) ? code : 0;
}

function extractHtml(content: unknown) {
  if (!content) return "";
  if (typeof content === "string") return content;
  if (typeof content === "object" && content && "html" in (content as Record<string, unknown>)) {
    const value = (content as Record<string, unknown>).html;
    return typeof value === "string" ? value : "";
  }
  return "";
}

function extractPlainText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasHeading(html: string) {
  return /<h[1-6]\b/i.test(html) || /class=["'][^"']*\brich-h[78]\b[^"']*["']/i.test(html);
}

function hasInternalLink(html: string) {
  return /<a[^>]+href=["'](\/(?!\/)|#)/i.test(html);
}

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

function unavailableMetric(note: string): IntegrationMetric {
  return { value: "Not Connected", note };
}

function getPngSize(buffer: Buffer) {
  const pngSignature = "89504e470d0a1a0a";
  if (buffer.length < 24) return null;
  if (buffer.subarray(0, 8).toString("hex") !== pngSignature) return null;
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  return { width, height };
}

function getJpegSize(buffer: Buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buffer[offset + 1];
    if (marker === 0xd9 || marker === 0xda) break;
    const segmentLength = buffer.readUInt16BE(offset + 2);
    if (segmentLength < 2) break;
    const isSof =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf);
    if (isSof) {
      const height = buffer.readUInt16BE(offset + 5);
      const width = buffer.readUInt16BE(offset + 7);
      return { width, height };
    }
    offset += 2 + segmentLength;
  }
  return null;
}

async function analyzeImageAlerts(featureImages: string[]) {
  const localPaths = Array.from(
    new Set(
      featureImages
        .filter((url) => url.startsWith("/uploads/"))
        .map((url) => path.join(process.cwd(), "public", url.replace(/^\//, "").replaceAll("/", path.sep))),
    ),
  );

  let heavyImageCount = 0;
  let wrongAspectRatioCount = 0;

  for (const filePath of localPaths) {
    try {
      const fileStat = await stat(filePath);
      if (fileStat.size > 800 * 1024) {
        heavyImageCount += 1;
      }

      const buffer = await readFile(filePath);
      const size = getPngSize(buffer) ?? getJpegSize(buffer);
      if (!size || !size.width || !size.height) continue;

      const ratio = size.width / size.height;
      const target = 1200 / 675;
      if (Math.abs(ratio - target) > 0.08) {
        wrongAspectRatioCount += 1;
      }
    } catch {
      // Ignore broken file path, continue analyzing others.
    }
  }

  return { heavyImageCount, wrongAspectRatioCount };
}

async function getDashboardData(): Promise<DashboardData> {
  const dbData = await tryPrisma(async () => {
    const [
      pendingComments,
      pendingApprovals,
      draftNews,
      newsEdits,
      pageEdits,
      allNews,
      allPages,
      auditLogs,
      clickedGroups,
      viewedGroups,
    ] = await Promise.all([
      prisma.newsComment.count({ where: { status: "pending" } }),
      prisma.adminUser.count({ where: { isActive: false } }),
      prisma.newsPost.findMany({
        where: { status: "draft" },
        orderBy: { updatedAt: "desc" },
        take: 8,
        select: { id: true, title: true, slug: true, updatedAt: true },
      }),
      prisma.newsPost.findMany({
        orderBy: { updatedAt: "desc" },
        take: 6,
        select: { id: true, title: true, updatedAt: true },
      }),
      prisma.pageTemplate.findMany({
        orderBy: { updatedAt: "desc" },
        take: 6,
        select: { id: true, title: true, updatedAt: true },
      }),
      prisma.newsPost.findMany({
        select: {
          id: true,
          title: true,
          slug: true,
          featureImage: true,
          seoTitle: true,
          seoDescription: true,
          content: true,
        },
      }),
      prisma.pageTemplate.findMany({
        select: {
          id: true,
          title: true,
          slug: true,
          canonicalUrl: true,
          seoTitle: true,
          seoDescription: true,
          ogImageUrl: true,
        },
      }),
      prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 400,
        select: { action: true, payload: true },
      }),
      prisma.newsRating.groupBy({
        by: ["newsId"],
        _count: { newsId: true },
        orderBy: { _count: { newsId: "desc" } },
        take: 5,
      }),
      prisma.newsComment.groupBy({
        by: ["newsId"],
        _count: { newsId: true },
        orderBy: { _count: { newsId: "desc" } },
        take: 5,
      }),
    ]);

    const rankIds = Array.from(new Set([...clickedGroups.map((item) => item.newsId), ...viewedGroups.map((item) => item.newsId)]));
    const titles = rankIds.length
      ? await prisma.newsPost.findMany({
          where: { id: { in: rankIds } },
          select: { id: true, title: true },
        })
      : [];
    const titleMap = new Map(titles.map((item) => [item.id, item.title]));

    const mostClickedNews: RankedNews[] = clickedGroups.map((item) => ({
      id: item.newsId,
      title: titleMap.get(item.newsId) ?? "Untitled News",
      count: item._count.newsId,
    }));

    const mostViewedNews: RankedNews[] = viewedGroups.map((item) => ({
      id: item.newsId,
      title: titleMap.get(item.newsId) ?? "Untitled News",
      count: item._count.newsId,
    }));

    const lastEdits: LastEditItem[] = [
      ...newsEdits.map((item) => ({ id: item.id, kind: "News" as const, title: item.title, updatedAt: item.updatedAt })),
      ...pageEdits.map((item) => ({ id: item.id, kind: "Page" as const, title: item.title, updatedAt: item.updatedAt })),
    ]
      .sort((a, b) => new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime())
      .slice(0, 8);

    const failedUploads = auditLogs.filter((log) => {
      const action = log.action.toLowerCase();
      return action.includes("upload") && (action.includes("fail") || hasFailure(log.payload));
    }).length;

    const backupFail = auditLogs.filter((log) => {
      const action = log.action.toLowerCase();
      return action.includes("backup") && (action.includes("fail") || hasFailure(log.payload));
    }).length;

    const apiErrors = auditLogs.filter((log) => {
      const action = log.action.toLowerCase();
      return action.includes("api") && (action.includes("error") || action.includes("fail") || hasFailure(log.payload));
    }).length;

    const slug404Count = auditLogs.filter((log) => {
      const action = log.action.toLowerCase();
      const code = getStatusCode(log.payload);
      return action.includes("404") || code === 404;
    }).length;

    const missingCanonicalCount = allPages.filter((item) => !(item.canonicalUrl ?? "").trim()).length;
    const missingFeatureImageCount = allNews.filter((item) => !(item.featureImage ?? "").trim()).length;

    const slugBag = [...allNews.map((item) => item.slug), ...allPages.map((item) => item.slug)]
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);
    const slugFreq = new Map<string, number>();
    for (const slug of slugBag) {
      slugFreq.set(slug, (slugFreq.get(slug) ?? 0) + 1);
    }
    const duplicateSlugCount = Array.from(slugFreq.values()).filter((count) => count > 1).length;

    const seoMissingNews = allNews.filter((item) => !(item.seoTitle ?? "").trim() || !(item.seoDescription ?? "").trim() || !(item.featureImage ?? "").trim()).length;
    const seoMissingPages = allPages.filter((item) => !(item.seoTitle ?? "").trim() || !(item.seoDescription ?? "").trim() || !(item.ogImageUrl ?? "").trim()).length;

    const shortArticleCount = allNews.filter((item) => extractPlainText(extractHtml(item.content)).length < 300).length;
    const missingHeadingsCount = allNews.filter((item) => !hasHeading(extractHtml(item.content))).length;
    const noInternalLinksCount = allNews.filter((item) => !hasInternalLink(extractHtml(item.content))).length;

    const termMap = new Map<string, number>();
    auditLogs.forEach((log) => {
      const action = log.action.toLowerCase();
      if (!action.includes("search")) return;
      const payload = log.payload as Record<string, unknown> | null;
      const rawTerm = String(payload?.query ?? payload?.term ?? payload?.q ?? "").trim().toLowerCase();
      if (!rawTerm) return;
      termMap.set(rawTerm, (termMap.get(rawTerm) ?? 0) + 1);
    });
    const searchTerms = Array.from(termMap.entries())
      .map(([term, count]) => ({ term, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const { heavyImageCount, wrongAspectRatioCount } = await analyzeImageAlerts(
      allNews.map((item) => item.featureImage ?? "").filter(Boolean),
    );

    return {
      pendingComments,
      pendingApprovals,
      failedUploads,
      draftNews,
      lastEdits,
      mostViewedNews,
      mostClickedNews,
      seoMissingNews,
      seoMissingPages,
      backupFail,
      apiErrors,
      dbIssue: 0,
      slug404Count,
      missingCanonicalCount,
      duplicateSlugCount,
      missingFeatureImageCount,
      wrongAspectRatioCount,
      heavyImageCount,
      searchTerms,
      shortArticleCount,
      missingHeadingsCount,
      noInternalLinksCount,
      lcpMobile: unavailableMetric("Connect CrUX / PageSpeed API"),
      lcpDesktop: unavailableMetric("Connect CrUX / PageSpeed API"),
      inpMobile: unavailableMetric("Connect CrUX / PageSpeed API"),
      inpDesktop: unavailableMetric("Connect CrUX / PageSpeed API"),
      clsMobile: unavailableMetric("Connect CrUX / PageSpeed API"),
      clsDesktop: unavailableMetric("Connect CrUX / PageSpeed API"),
      performanceScore: unavailableMetric("Connect Lighthouse / PSI"),
      seoScore: unavailableMetric("Connect Lighthouse / PSI"),
      accessibilityScore: unavailableMetric("Connect Lighthouse / PSI"),
      indexedPages: unavailableMetric("Connect Google Search Console"),
      excludedPages: unavailableMetric("Connect Google Search Console"),
      crawlErrors: unavailableMetric("Connect Google Search Console"),
      poorUrls: unavailableMetric("Connect Core Web Vitals URL report"),
      needsImprovementUrls: unavailableMetric("Connect Core Web Vitals URL report"),
      structuredDataErrors: unavailableMetric("Connect Search Console rich results"),
    };
  });

  if (dbData) return dbData;

  const draftNews = mockStore.news
    .filter((item) => item.status === "draft")
    .slice(0, 8)
    .map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      updatedAt: null,
    }));

  const lastEdits: LastEditItem[] = [
    ...mockStore.news.slice(0, 4).map((item) => ({ id: item.id, kind: "News" as const, title: item.title, updatedAt: null })),
    ...mockStore.pages.slice(0, 4).map((item) => ({ id: item.id, kind: "Page" as const, title: item.title, updatedAt: null })),
  ];

  return {
    pendingComments: mockStore.comments.filter((item) => item.status === "pending").length,
    pendingApprovals: mockStore.users.filter((item) => item.active === false).length,
    failedUploads: 0,
    draftNews,
    lastEdits,
    mostViewedNews: [],
    mostClickedNews: [],
    seoMissingNews: mockStore.news.filter((item) => !(item as { seoTitle?: string }).seoTitle || !(item as { seoDescription?: string }).seoDescription || !item.excerpt).length,
    seoMissingPages: mockStore.pages.filter((item) => !item.seoTitle).length,
    backupFail: 0,
    apiErrors: 0,
    dbIssue: 1,
    slug404Count: 0,
    missingCanonicalCount: mockStore.pages.length,
    duplicateSlugCount: 0,
    missingFeatureImageCount: mockStore.news.filter((item) => !(item as { featureImage?: string }).featureImage).length,
    wrongAspectRatioCount: 0,
    heavyImageCount: 0,
    searchTerms: [],
    shortArticleCount: 0,
    missingHeadingsCount: 0,
    noInternalLinksCount: 0,
    lcpMobile: unavailableMetric("Connect CrUX / PageSpeed API"),
    lcpDesktop: unavailableMetric("Connect CrUX / PageSpeed API"),
    inpMobile: unavailableMetric("Connect CrUX / PageSpeed API"),
    inpDesktop: unavailableMetric("Connect CrUX / PageSpeed API"),
    clsMobile: unavailableMetric("Connect CrUX / PageSpeed API"),
    clsDesktop: unavailableMetric("Connect CrUX / PageSpeed API"),
    performanceScore: unavailableMetric("Connect Lighthouse / PSI"),
    seoScore: unavailableMetric("Connect Lighthouse / PSI"),
    accessibilityScore: unavailableMetric("Connect Lighthouse / PSI"),
    indexedPages: unavailableMetric("Connect Google Search Console"),
    excludedPages: unavailableMetric("Connect Google Search Console"),
    crawlErrors: unavailableMetric("Connect Google Search Console"),
    poorUrls: unavailableMetric("Connect Core Web Vitals URL report"),
    needsImprovementUrls: unavailableMetric("Connect Core Web Vitals URL report"),
    structuredDataErrors: unavailableMetric("Connect Search Console rich results"),
  };
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
  const data = await getDashboardData();

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
