import { mockStore } from "@/src/server/mockStore";
import { prisma, tryPrismaLong } from "@/src/server/dbSafe";

export type ContactStatus = "new" | "read" | "archived" | "in_progress" | "solved";
export type ContactTopic = "report" | "feedback" | "general";
export type ContactEtaHours = 24 | 48;

export type ContactMessageInput = {
  name: string;
  email: string;
  subject: string;
  message: string;
  topic?: ContactTopic;
};

function requireDbOrMockDisabled() {
  if (process.env.DATABASE_URL) {
    throw new Error("DB_UNAVAILABLE");
  }
}

export async function createContactMessage(input: ContactMessageInput) {
  const data = {
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    subject: input.subject.trim(),
    message: input.message.trim(),
    topic: input.topic ?? "general",
    status: "new",
    etaHours: null as number | null,
  };

  // Use long timeout — short tryPrisma was silently falling back to in-memory mock,
  // so the API returned 200 while admin (DB) never saw the message.
  const dbData = await tryPrismaLong(async () =>
    prisma.contactMessage.create({
      data,
    }),
  );
  if (dbData) return dbData;

  requireDbOrMockDisabled();

  const item = {
    id: `cm${Date.now()}`,
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockStore.contactMessages.unshift(item);
  return item;
}

export async function listContactMessages() {
  const dbData = await tryPrismaLong(async () =>
    prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    }),
  );
  if (dbData) return dbData;

  if (process.env.DATABASE_URL) {
    // Prefer empty over mixed mock/DB ghosts when DB is temporarily down.
    console.error("[contact] listContactMessages: database unavailable");
    return [];
  }

  return mockStore.contactMessages;
}

export async function getContactMessageById(id: string) {
  const dbData = await tryPrismaLong(async () =>
    prisma.contactMessage.findUnique({ where: { id } }),
  );
  if (dbData) return dbData;
  if (process.env.DATABASE_URL) return null;
  return mockStore.contactMessages.find((row) => row.id === id) ?? null;
}

export async function updateContactMessageStatus(
  id: string,
  status: ContactStatus,
  options?: { etaHours?: ContactEtaHours | null },
) {
  const etaHours =
    status === "in_progress"
      ? (options?.etaHours ?? null)
      : status === "solved"
        ? null
        : options?.etaHours === undefined
          ? undefined
          : options.etaHours;

  const data: { status: ContactStatus; etaHours?: number | null } = { status };
  if (etaHours !== undefined) data.etaHours = etaHours;

  const dbData = await tryPrismaLong(async () =>
    prisma.contactMessage.update({
      where: { id },
      data,
    }),
  );
  if (dbData) return dbData;

  if (process.env.DATABASE_URL) {
    throw new Error("DB_UNAVAILABLE");
  }

  const item = mockStore.contactMessages.find((row) => row.id === id);
  if (!item) return null;
  item.status = status;
  if (etaHours !== undefined) item.etaHours = etaHours;
  item.updatedAt = new Date().toISOString();
  return item;
}

export async function deleteContactMessage(id: string) {
  const dbResult = await tryPrismaLong(async () => {
    try {
      await prisma.contactMessage.delete({ where: { id } });
      return true as const;
    } catch (error) {
      // Prisma P2025: record not found — not a DB outage.
      const code =
        error && typeof error === "object" && "code" in error
          ? String((error as { code?: unknown }).code ?? "")
          : "";
      if (code === "P2025") return false as const;
      throw error;
    }
  });
  if (dbResult === true) return true;
  if (dbResult === false) return false;

  if (process.env.DATABASE_URL) {
    throw new Error("DB_UNAVAILABLE");
  }

  const index = mockStore.contactMessages.findIndex((row) => row.id === id);
  if (index === -1) return false;
  mockStore.contactMessages.splice(index, 1);
  return true;
}
