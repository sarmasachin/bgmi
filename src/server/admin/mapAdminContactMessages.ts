export type AdminContactItem = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  topic: "report" | "feedback" | "general";
  status: "new" | "read" | "archived" | "in_progress" | "solved";
  etaHours: 24 | 48 | null;
  createdAt: string;
};

function asStatus(value: unknown): AdminContactItem["status"] {
  if (
    value === "read" ||
    value === "archived" ||
    value === "new" ||
    value === "in_progress" ||
    value === "solved"
  ) {
    return value;
  }
  return "new";
}

function asTopic(value: unknown, subject: string): AdminContactItem["topic"] {
  const topic = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (topic === "report" || topic === "issue") return "report";
  if (topic === "feedback") return "feedback";
  const sub = subject.trim().toLowerCase();
  if (sub.includes("report") || sub.includes("issue")) return "report";
  if (sub.includes("feedback")) return "feedback";
  return "general";
}

function asEtaHours(value: unknown): AdminContactItem["etaHours"] {
  if (value === 24 || value === "24") return 24;
  if (value === 48 || value === "48") return 48;
  return null;
}

export function mapAdminContactMessages(
  items: Array<{
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    topic?: string | null;
    status?: string | null;
    etaHours?: number | null;
    createdAt?: Date | string | null;
  }>,
): AdminContactItem[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    email: item.email,
    subject: item.subject,
    message: item.message,
    topic: asTopic(item.topic, item.subject),
    status: asStatus(item.status),
    etaHours: asEtaHours(item.etaHours),
    createdAt:
      item.createdAt instanceof Date
        ? item.createdAt.toISOString()
        : typeof item.createdAt === "string"
          ? item.createdAt
          : "",
  }));
}
