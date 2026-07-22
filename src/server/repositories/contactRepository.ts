import { mockStore } from "@/src/server/mockStore";
import { prisma } from "@/src/server/dbSafe";

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

  // Never fake-success into mockStore when DATABASE_URL is set.
  if (!process.env.DATABASE_URL?.trim()) {
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
  if (!process.env.DATABASE_URL?.trim()) {
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
  const targetId = id.trim();
  if (!targetId) return null;

  if (!process.env.DATABASE_URL?.trim()) {
    return mockStore.contactMessages.find((row) => row.id === targetId) ?? null;
  }

  try {
    return await prisma.contactMessage.findUnique({ where: { id: targetId } });
  } catch (error) {
    console.error("[contact] getContactMessageById failed:", error);
    throw new Error("DB_UNAVAILABLE");
  }
}

export async function updateContactMessageStatus(
  id: string,
  status: ContactStatus,
  options?: { etaHours?: ContactEtaHours | null },
) {
  const targetId = id.trim();
  if (!targetId) return null;

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

  if (!process.env.DATABASE_URL?.trim()) {
    const item = mockStore.contactMessages.find((row) => row.id === targetId);
    if (!item) return null;
    item.status = status;
    if (etaHours !== undefined) item.etaHours = etaHours;
    item.updatedAt = new Date().toISOString();
    return item;
  }

  try {
    return await prisma.contactMessage.update({
      where: { id: targetId },
      data,
    });
  } catch (error) {
    const code =
      error && typeof error === "object" && "code" in error
        ? String((error as { code?: unknown }).code ?? "")
        : "";
    if (code === "P2025") return null;
    console.error("[contact] updateContactMessageStatus failed:", error);
    throw new Error("DB_UNAVAILABLE");
  }
}

export async function deleteContactMessage(id: string) {
  const targetId = id.trim();
  if (!targetId) return false;

  if (!process.env.DATABASE_URL?.trim()) {
    const index = mockStore.contactMessages.findIndex((row) => row.id === targetId);
    if (index === -1) return false;
    mockStore.contactMessages.splice(index, 1);
    return true;
  }

  try {
    // deleteMany avoids P2025 throw; count===0 means truly missing.
    const result = await prisma.contactMessage.deleteMany({ where: { id: targetId } });
    if (result.count === 0) {
      console.warn("[contact] deleteContactMessage miss:", targetId);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[contact] deleteContactMessage failed:", targetId, error);
    throw new Error("DB_UNAVAILABLE");
  }
}
