import { randomUUID } from "crypto";
import { mockStore } from "@/src/server/mockStore";
import { prisma, tryPrisma } from "@/src/server/dbSafe";

export type PageCommentStatus = "pending" | "approved" | "rejected" | "spam";

export type PublicPageComment = {
  id: string;
  name: string;
  message: string;
  createdAt: string;
};

export type CreatePageCommentInput = {
  pageKey: string;
  name: string;
  email?: string | null;
  message: string;
};

type PageCommentRow = {
  id: string;
  pageKey: string;
  name: string;
  email?: string | null;
  message: string;
  status: string;
  createdAt: Date | string;
};

type PageCommentDelegate = {
  findMany: (args: unknown) => Promise<PageCommentRow[]>;
  findUnique: (args: unknown) => Promise<PageCommentRow | null>;
  create: (args: unknown) => Promise<PageCommentRow>;
  update: (args: unknown) => Promise<PageCommentRow>;
  delete: (args: unknown) => Promise<unknown>;
};

function pageCommentDb(): PageCommentDelegate | null {
  const delegate = (prisma as { pageComment?: PageCommentDelegate }).pageComment;
  return delegate ?? null;
}

/** Public page: only approved comments (no email). */
export async function listApprovedPageComments(pageKey: string): Promise<PublicPageComment[]> {
  const key = pageKey.trim();
  if (!key) return [];

  const dbData = await tryPrisma(async () => {
    const pc = pageCommentDb();
    if (!pc) return null;
    return pc.findMany({
      where: { pageKey: key, status: "approved" },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: { id: true, name: true, message: true, createdAt: true },
    });
  });

  if (dbData) {
    return dbData.map((row) => ({
      id: row.id,
      name: row.name,
      message: row.message,
      createdAt:
        row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
    }));
  }

  return mockStore.pageComments
    .filter((c) => c.pageKey === key && c.status === "approved")
    .map((c) => ({
      id: c.id,
      name: c.name,
      message: c.message,
      createdAt: c.createdAt || new Date().toISOString(),
    }));
}

/** Admin: all page comments (includes email). */
export async function listAllPageComments() {
  const dbData = await tryPrisma(async () => {
    const pc = pageCommentDb();
    if (!pc) return null;
    return pc.findMany({
      orderBy: { createdAt: "desc" },
    });
  });
  if (dbData) return dbData;

  return mockStore.pageComments.map((c) => ({
    ...c,
    email: c.email || "",
    createdAt: c.createdAt || new Date().toISOString(),
  }));
}

/** Create as pending — shows on page only after admin approval. */
export async function createPageComment(input: CreatePageCommentInput) {
  const pageKey = input.pageKey.trim().slice(0, 120);
  const name = input.name.trim().slice(0, 80);
  const emailRaw = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const email = emailRaw ? emailRaw.slice(0, 200) : null;
  const message = input.message.trim().slice(0, 1000);
  if (!pageKey || !name || message.length < 2) return null;

  const dbData = await tryPrisma(async () => {
    const pc = pageCommentDb();
    if (!pc) return null;
    return pc.create({
      data: {
        pageKey,
        name,
        email,
        message,
        status: "pending",
      },
    });
  });
  if (dbData) return dbData;

  const item = {
    id: randomUUID(),
    pageKey,
    name,
    email,
    message,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  mockStore.pageComments.unshift(item);
  return item;
}

export async function moderatePageComment(id: string, status: PageCommentStatus) {
  const dbData = await tryPrisma(async () => {
    const pc = pageCommentDb();
    if (!pc) return null;
    const existing = await pc.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) return null;
    return pc.update({
      where: { id },
      data: { status },
    });
  });
  if (dbData) return dbData;

  const item = mockStore.pageComments.find((c) => c.id === id);
  if (!item) return null;
  item.status = status;
  return item;
}

export async function removePageComment(id: string) {
  const dbResult = await tryPrisma(async () => {
    const pc = pageCommentDb();
    if (!pc) return null;
    const existing = await pc.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) return false;
    await pc.delete({ where: { id } });
    return true;
  });
  if (dbResult) return true;

  const index = mockStore.pageComments.findIndex((c) => c.id === id);
  if (index === -1) return false;
  mockStore.pageComments.splice(index, 1);
  return true;
}
