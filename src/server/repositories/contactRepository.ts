import { mockStore } from "@/src/server/mockStore";
import { prisma, tryPrisma } from "@/src/server/dbSafe";

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

  const dbData = await tryPrisma(async () =>
    prisma.contactMessage.create({
      data,
    }),
  );
  if (dbData) return dbData;

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
  const dbData = await tryPrisma(async () =>
    prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    }),
  );
  return dbData ?? mockStore.contactMessages;
}

export async function getContactMessageById(id: string) {
  const dbData = await tryPrisma(async () =>
    prisma.contactMessage.findUnique({ where: { id } }),
  );
  if (dbData) return dbData;
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

  const dbData = await tryPrisma(async () =>
    prisma.contactMessage.update({
      where: { id },
      data,
    }),
  );
  if (dbData) return dbData;

  const item = mockStore.contactMessages.find((row) => row.id === id);
  if (!item) return null;
  item.status = status;
  if (etaHours !== undefined) item.etaHours = etaHours;
  item.updatedAt = new Date().toISOString();
  return item;
}

export async function deleteContactMessage(id: string) {
  const dbResult = await tryPrisma(async () => {
    await prisma.contactMessage.delete({ where: { id } });
    return true;
  });
  if (dbResult) return true;

  const index = mockStore.contactMessages.findIndex((row) => row.id === id);
  if (index === -1) return false;
  mockStore.contactMessages.splice(index, 1);
  return true;
}
