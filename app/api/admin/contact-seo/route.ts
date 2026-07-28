import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addAuditLog } from "@/src/server/repositories/auditRepository";
import { readAdminJsonBody } from "@/src/server/admin/adminApiHelpers";
import { enforceAdminApiAccess } from "@/src/server/rbac/enforceAdminApiAccess";
import {
  getContactSeoForAdmin,
  saveContactSeo,
} from "@/src/server/repositories/listingSeoRepository";

const topicSchema = z.object({
  title: z.string().max(160),
  description: z.string().max(320),
});

export async function GET(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  const data = await getContactSeoForAdmin();
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  const bodyResult = await readAdminJsonBody(request);
  if (!bodyResult.ok) return bodyResult.response;

  const parsed = z
    .object({
      general: topicSchema,
      report: topicSchema,
      feedback: topicSchema,
    })
    .safeParse(bodyResult.data);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    const result = await saveContactSeo(parsed.data);
    await addAuditLog({
      actor: "admin",
      action: "contact-seo.update",
      target: "contact",
      payload: { usingDefault: false },
    });
    return NextResponse.json({ ok: true, ...result });
  } catch {
    return NextResponse.json({ error: "Could not save contact SEO." }, { status: 503 });
  }
}
