export type AdminContactItem = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "new" | "read" | "archived";
  createdAt: string;
};

function asStatus(value: unknown): AdminContactItem["status"] {
  if (value === "read" || value === "archived" || value === "new") return value;
  return "new";
}

export function mapAdminContactMessages(
  items: Array<{
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    status?: string | null;
    createdAt?: Date | string | null;
  }>,
): AdminContactItem[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    email: item.email,
    subject: item.subject,
    message: item.message,
    status: asStatus(item.status),
    createdAt:
      item.createdAt instanceof Date
        ? item.createdAt.toISOString()
        : typeof item.createdAt === "string"
          ? item.createdAt
          : "",
  }));
}
