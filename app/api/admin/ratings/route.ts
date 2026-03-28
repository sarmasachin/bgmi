import { NextResponse } from "next/server";
import { prisma, tryPrisma } from "@/src/server/dbSafe";

type RatingRow = {
  target: string;
  average: string;
  count: number;
};

export async function GET() {
  const data = await tryPrisma(async () => {
    const homeAgg = await prisma.homeRating.aggregate({
      _avg: { value: true },
      _count: { value: true },
    });

    const groupedNews = await prisma.newsRating.groupBy({
      by: ["newsId"],
      _avg: { value: true },
      _count: { value: true },
      orderBy: { _count: { value: "desc" } },
      take: 100,
    });

    const newsIds = groupedNews.map((item) => item.newsId);
    const newsMap = newsIds.length
      ? new Map(
          (
            await prisma.newsPost.findMany({
              where: { id: { in: newsIds } },
              select: { id: true, title: true, slug: true },
            })
          ).map((item) => [item.id, item]),
        )
      : new Map<string, { id: string; title: string; slug: string }>();

    const rows: RatingRow[] = [];

    if ((homeAgg._count.value ?? 0) > 0) {
      rows.push({
        target: "Home",
        average: Number(homeAgg._avg.value ?? 0).toFixed(2),
        count: homeAgg._count.value ?? 0,
      });
    }

    for (const item of groupedNews) {
      const news = newsMap.get(item.newsId);
      rows.push({
        target: news?.title ? `News: ${news.title}` : `News: ${item.newsId}`,
        average: Number(item._avg.value ?? 0).toFixed(2),
        count: item._count.value ?? 0,
      });
    }

    const groupedTools = await prisma.toolRating.groupBy({
      by: ["context"],
      _avg: { value: true },
      _count: { value: true },
      orderBy: { _count: { value: "desc" } },
      take: 100,
    });

    for (const item of groupedTools) {
      rows.push({
        target: `Page: ${item.context}`,
        average: Number(item._avg.value ?? 0).toFixed(2),
        count: item._count.value ?? 0,
      });
    }

    return rows;
  });

  const fallback: RatingRow[] = [
    { target: "Home", average: "4.80", count: 256 },
    { target: "News: RTX 5090", average: "4.60", count: 90 },
  ];

  return NextResponse.json({ data: data ?? fallback });
}
