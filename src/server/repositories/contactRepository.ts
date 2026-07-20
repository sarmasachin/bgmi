import { mockStore } from "@/src/server/mockStore";
import { prisma, tryPrisma } from "@/src/server/dbSafe";

export type ContactStatus = "new" | "read" | "archived";

export type ContactMessageInput = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export async function createContactMessage(input: ContactMessageInput) {
  const data = {
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    subject: input.subject.trim(),
    message: input.message.trim(),
    status: "new",
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

export async function updateContactMessageStatus(id: string, status: ContactStatus) {
  const dbData = await tryPrisma(async () =>
    prisma.contactMessage.update({
      where: { id },
      data: { status },
    }),
  );
  if (dbData) return dbData;

  const item = mockStore.contactMessages.find((row) => row.id === id);
  if (!item) return null;
  item.status = status;
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
