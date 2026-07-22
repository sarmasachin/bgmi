import { randomUUID } from "crypto";
import { mockStore } from "@/src/server/mockStore";
import { prisma, tryPrisma } from "@/src/server/dbSafe";

export type CommentStatus = "pending" | "approved" | "rejected" | "spam";

export type PublicComment = {
  id: string;
  name: string;
  message: string;
  createdAt: string;
};

export type CreateCommentInput = {
  newsId: string;
  name: string;
  message: string;
};

export async function listComments() {
  const dbData = await tryPrisma(async () =>
    prisma.newsComment.findMany({
      orderBy: { createdAt: "desc" },
    }),
  );
  return dbData ?? mockStore.comments;
}

/** Public: approved comments for one news article (newest first). */
export async function listApprovedCommentsByNewsId(newsId: string): Promise<PublicComment[]> {
  const id = newsId.trim();
  if (!id) return [];

  const dbData = await tryPrisma(async () =>
    prisma.newsComment.findMany({
      where: { newsId: id, status: "approved" },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { id: true, name: true, message: true, createdAt: true },
    }),
  );

  if (dbData) {
    return dbData.map((row) => ({
      id: row.id,
      name: row.name,
      message: row.message,
      createdAt: row.createdAt.toISOString(),
    }));
  }

  return mockStore.comments
    .filter((c) => c.newsId === id && c.status === "approved")
    .map((c) => ({
      id: c.id,
      name: c.name,
      message: c.message,
      createdAt: new Date().toISOString(),
    }));
}

export async function createComment(input: CreateCommentInput) {
  const newsId = input.newsId.trim();
  const name = input.name.trim().slice(0, 80);
  const message = input.message.trim().slice(0, 1000);
  if (!newsId || !name || message.length < 2) return null;

  const dbData = await tryPrisma(async () =>
    prisma.newsComment.create({
      data: {
        newsId,
        name,
        message,
        status: "pending",
      },
    }),
  );
  if (dbData) return dbData;

  const item = {
    id: randomUUID(),
    newsId,
    name,
    message,
    status: "pending",
  };
  mockStore.comments.unshift(item);
  return item;
}

export async function moderateComment(id: string, status: CommentStatus) {
  const dbData = await tryPrisma(async () =>
    prisma.newsComment.update({
      where: { id },
      data: { status },
    }),
  );
  if (dbData) return dbData;

  const item = mockStore.comments.find((comment) => comment.id === id);
  if (!item) return null;
  item.status = status;
  return item;
}

export async function removeComment(id: string) {
  const dbResult = await tryPrisma(async () => {
    await prisma.newsComment.delete({ where: { id } });
    return true;
  });
  if (dbResult) return true;

  const index = mockStore.comments.findIndex((comment) => comment.id === id);
  if (index === -1) return false;
  mockStore.comments.splice(index, 1);
  return true;
}
