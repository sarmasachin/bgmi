import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { prisma, tryPrisma } from "@/src/server/dbSafe";
import { mockStore } from "@/src/server/mockStore";

export type DashboardItem = {
  id: string;
  title: string;
  slug?: string;
  updatedAt?: Date | string | null;
};

export type RankedNews = {
  id: string;
  title: string;
  count: number;
};

export type LastEditItem = {
  id: string;
  kind: "News" | "Page";
  title: string;
  updatedAt?: Date | string | null;
};

export type SearchTermItem = {
  term: string;
  count: number;
};

export type IntegrationMetric = {
  value: string;
  note: string;
};

export type DashboardData = {
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

const missingStringOrEmpty = (field: string) => [{ [field]: null }, { [field]: "" }];

async function analyzeImageAlerts(featureImages: string[]) {
  const localPaths = Array.from(
    new Set(
      featureImages
        .filter((url) => url.startsWith("/uploads/"))
        .map((url) => path.join(process.cwd(), "public", url.replace(/^\//, "").replaceAll("/", path.sep))),
    ),
  );

  const results = await Promise.all(
    localPaths.map(async (filePath) => {
      let heavy = false;
      let wrongRatio = false;

      try {
        const fileStat = await stat(filePath);
        if (fileStat.size > 800 * 1024) {
          heavy = true;
        }

        const buffer = await readFile(filePath);
        const size = getPngSize(buffer) ?? getJpegSize(buffer);
        if (size?.width && size?.height) {
          const ratio = size.width / size.height;
          const target = 1200 / 675;
          if (Math.abs(ratio - target) > 0.08) {
            wrongRatio = true;
          }
        }
      } catch {
        // Ignore broken file path, continue analyzing others.
      }

      return { heavy, wrongRatio };
    }),
  );

  return {
    heavyImageCount: results.filter((item) => item.heavy).length,
    wrongAspectRatioCount: results.filter((item) => item.wrongRatio).length,
  };
}

function countDuplicateSlugs(newsSlugs: Array<{ slug: string }>, pageSlugs: Array<{ slug: string }>) {
  const slugFreq = new Map<string, number>();
  for (const slug of [...newsSlugs, ...pageSlugs]
    .map((item) => item.slug.trim().toLowerCase())
    .filter(Boolean)) {
    slugFreq.set(slug, (slugFreq.get(slug) ?? 0) + 1);
  }
  return Array.from(slugFreq.values()).filter((count) => count > 1).length;
}

function buildSearchTerms(auditLogs: Array<{ action: string; payload: unknown }>) {
  const termMap = new Map<string, number>();
  auditLogs.forEach((log) => {
    const action = log.action.toLowerCase();
    if (!action.includes("search")) return;
    const payload = log.payload as Record<string, unknown> | null;
    const rawTerm = String(payload?.query ?? payload?.term ?? payload?.q ?? "").trim().toLowerCase();
    if (!rawTerm) return;
    termMap.set(rawTerm, (termMap.get(rawTerm) ?? 0) + 1);
  });
  return Array.from(termMap.entries())
    .map(([term, count]) => ({ term, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

function analyzeNewsContent(newsContentRows: Array<{ content: unknown }>) {
  let shortArticleCount = 0;
  let missingHeadingsCount = 0;
  let noInternalLinksCount = 0;

  for (const item of newsContentRows) {
    const html = extractHtml(item.content);
    if (extractPlainText(html).length < 300) shortArticleCount += 1;
    if (!hasHeading(html)) missingHeadingsCount += 1;
    if (!hasInternalLink(html)) noInternalLinksCount += 1;
  }

  return { shortArticleCount, missingHeadingsCount, noInternalLinksCount };
}

function buildIntegrationMetrics(): Pick<
  DashboardData,
  | "lcpMobile"
  | "lcpDesktop"
  | "inpMobile"
  | "inpDesktop"
  | "clsMobile"
  | "clsDesktop"
  | "performanceScore"
  | "seoScore"
  | "accessibilityScore"
  | "indexedPages"
  | "excludedPages"
  | "crawlErrors"
  | "poorUrls"
  | "needsImprovementUrls"
  | "structuredDataErrors"
> {
  return {
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

function countAuditIssues(auditLogs: Array<{ action: string; payload: unknown }>) {
  let failedUploads = 0;
  let backupFail = 0;
  let apiErrors = 0;
  let slug404Count = 0;

  for (const log of auditLogs) {
    const action = log.action.toLowerCase();
    if (action.includes("upload") && (action.includes("fail") || hasFailure(log.payload))) {
      failedUploads += 1;
    }
    if (action.includes("backup") && (action.includes("fail") || hasFailure(log.payload))) {
      backupFail += 1;
    }
    if (action.includes("api") && (action.includes("error") || action.includes("fail") || hasFailure(log.payload))) {
      apiErrors += 1;
    }
    const code = getStatusCode(log.payload);
    if (action.includes("404") || code === 404) {
      slug404Count += 1;
    }
  }

  return { failedUploads, backupFail, apiErrors, slug404Count };
}

export async function getAdminDashboardData(): Promise<DashboardData> {
  const dbData = await tryPrisma(async () => {
    const [
      pendingComments,
      pendingApprovals,
      draftNews,
      newsEdits,
      pageEdits,
      newsSlugs,
      pageSlugs,
      newsContentRows,
      newsFeatureImages,
      seoMissingNews,
      seoMissingPages,
      missingCanonicalCount,
      missingFeatureImageCount,
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
      prisma.newsPost.findMany({ select: { slug: true } }),
      prisma.pageTemplate.findMany({ select: { slug: true } }),
      prisma.newsPost.findMany({ select: { content: true } }),
      prisma.newsPost.findMany({ select: { featureImage: true } }),
      prisma.newsPost.count({
        where: {
          OR: [
            ...missingStringOrEmpty("seoTitle"),
            ...missingStringOrEmpty("seoDescription"),
            ...missingStringOrEmpty("featureImage"),
          ],
        },
      }),
      prisma.pageTemplate.count({
        where: {
          OR: [
            ...missingStringOrEmpty("seoTitle"),
            ...missingStringOrEmpty("seoDescription"),
            ...missingStringOrEmpty("ogImageUrl"),
          ],
        },
      }),
      prisma.pageTemplate.count({
        where: { OR: missingStringOrEmpty("canonicalUrl") },
      }),
      prisma.newsPost.count({
        where: { OR: missingStringOrEmpty("featureImage") },
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

    const rankIds = Array.from(
      new Set([...clickedGroups.map((item) => item.newsId), ...viewedGroups.map((item) => item.newsId)]),
    );

    const [{ shortArticleCount, missingHeadingsCount, noInternalLinksCount }, imageAlerts, titles] =
      await Promise.all([
        Promise.resolve(analyzeNewsContent(newsContentRows)),
        analyzeImageAlerts(newsFeatureImages.map((item) => item.featureImage ?? "").filter(Boolean)),
        rankIds.length
          ? prisma.newsPost.findMany({
              where: { id: { in: rankIds } },
              select: { id: true, title: true },
            })
          : Promise.resolve([]),
      ]);

    const titleMap = new Map(titles.map((item) => [item.id, item.title]));
    const auditIssues = countAuditIssues(auditLogs);

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

    return {
      pendingComments,
      pendingApprovals,
      failedUploads: auditIssues.failedUploads,
      draftNews,
      lastEdits,
      mostViewedNews,
      mostClickedNews,
      seoMissingNews,
      seoMissingPages,
      backupFail: auditIssues.backupFail,
      apiErrors: auditIssues.apiErrors,
      dbIssue: 0,
      slug404Count: auditIssues.slug404Count,
      missingCanonicalCount,
      duplicateSlugCount: countDuplicateSlugs(newsSlugs, pageSlugs),
      missingFeatureImageCount,
      wrongAspectRatioCount: imageAlerts.wrongAspectRatioCount,
      heavyImageCount: imageAlerts.heavyImageCount,
      searchTerms: buildSearchTerms(auditLogs),
      shortArticleCount,
      missingHeadingsCount,
      noInternalLinksCount,
      ...buildIntegrationMetrics(),
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
    seoMissingNews: mockStore.news.filter(
      (item) => !(item as { seoTitle?: string }).seoTitle || !(item as { seoDescription?: string }).seoDescription || !item.excerpt,
    ).length,
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
    ...buildIntegrationMetrics(),
  };
}
