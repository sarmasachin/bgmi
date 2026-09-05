import { prisma, tryPrismaLong } from "@/src/server/dbSafe";
import { mockStore } from "@/src/server/mockStore";

/** News article comments + landing-page comments waiting for moderation. */
export async function countPendingComments(): Promise<number> {
  const newsCount = await tryPrismaLong(() =>
    prisma.newsComment.count({ where: { status: "pending" } }),
  );
  const pageCount = await tryPrismaLong(() =>
    prisma.pageComment.count({ where: { status: "pending" } }),
  );

  const news =
    newsCount ?? mockStore.comments.filter((item) => item.status === "pending").length;
  const page =
    pageCount ?? mockStore.pageComments.filter((item) => item.status === "pending").length;

  return news + page;
}
