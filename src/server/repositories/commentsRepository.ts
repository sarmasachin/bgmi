import { mockStore } from "@/src/server/mockStore";
import { prisma, tryPrisma } from "@/src/server/dbSafe";

export async function listComments() {
  const dbData = await tryPrisma(async () =>
    prisma.newsComment.findMany({
      orderBy: { createdAt: "desc" },
    }),
  );
  return dbData ?? mockStore.comments;
}

export async function moderateComment(id: string, status: "pending" | "approved" | "rejected" | "spam") {
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
