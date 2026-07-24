import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addAuditLog } from "@/src/server/repositories/auditRepository";
import { enforceAdminApiAccess } from "@/src/server/rbac/enforceAdminApiAccess";
import {
  getHomeFaqItems,
  getStoredHomeFaqRaw,
  saveHomeFaqItems,
} from "@/src/server/repositories/homeFaqRepository";

const SETTINGS_KEY = "settings:homeFaq";

const itemSchema = z.object({
  id: z.string().max(80).optional(),
  question: z.string().max(500),
  answer: z.string().max(4000),
});

const postSchema = z.object({
  items: z.array(itemSchema).max(50),
});

export async function GET(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  const stored = await getStoredHomeFaqRaw();
  const effective = await getHomeFaqItems();
  return NextResponse.json({ effectiveItems: effective, storedItems: stored });
}

export async function POST(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const payload = parsed.data.items.map((row) => ({
    id: row.id?.trim() ?? "",
    question: row.question,
    answer: row.answer,
  }));
  let saved: { id: string; question: string; answer: string }[];
  try {
    saved = await saveHomeFaqItems(payload);
  } catch {
    return NextResponse.json({ error: "Could not save FAQ." }, { status: 503 });
  }
  await addAuditLog({
    actor: "admin",
    action: "faq.home.update",
    target: SETTINGS_KEY,
    payload: { count: saved.length },
  });
  return NextResponse.json({ ok: true, savedCount: saved.length });
}
