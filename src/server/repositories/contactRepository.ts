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

  // Direct DB write — never return mock success when DATABASE_URL is set.
  // Old tryPrisma timeout fallback saved to memory and showed "Message sent"
  // while admin (Postgres) never received the row.
  if (!process.env.DATABASE_URL) {
    const item = {
      id: `cm${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockStore.contactMessages.unshift(item);
    return item;
  }

  try {
    return await prisma.contactMessage.create({ data });
  } catch (error) {
    console.error("[contact] createContactMessage failed:", error);
    throw new Error("DB_UNAVAILABLE");
  }
}

export async function listContactMessages() {
  if (!process.env.DATABASE_URL) {
    return mockStore.contactMessages;
  }

  try {
    return await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("[contact] listContactMessages failed:", error);
    throw new Error("DB_UNAVAILABLE");
  }
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
  const targetId = id.trim();
  if (!targetId) return false;

  // Admin delete must hit the real DB — no short tryPrisma timeout/mock fallback.
  // Those caused DELETE 404 while rows stayed in Postgres (refresh brought them back).
  if (!process.env.DATABASE_URL) {
    const index = mockStore.contactMessages.findIndex((row) => row.id === targetId);
    if (index === -1) return false;
    mockStore.contactMessages.splice(index, 1);
    return true;
  }

  try {
    const result = await prisma.contactMessage.deleteMany({ where: { id: targetId } });
    return result.count > 0;
  } catch (error) {
    console.error("[contact] deleteContactMessage failed:", targetId, error);
    throw new Error("DB_UNAVAILABLE");
  }
}
