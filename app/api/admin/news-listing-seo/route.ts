import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addAuditLog } from "@/src/server/repositories/auditRepository";
import { readAdminJsonBody } from "@/src/server/admin/adminApiHelpers";
import { enforceAdminApiAccess } from "@/src/server/rbac/enforceAdminApiAccess";
import {
  getNewsListingSeoForAdmin,
  saveNewsListingSeo,
} from "@/src/server/repositories/listingSeoRepository";

export async function GET(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  const data = await getNewsListingSeoForAdmin();
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  const bodyResult = await readAdminJsonBody(request);
  if (!bodyResult.ok) return bodyResult.response;

  const parsed = z
    .object({
      title: z.string().max(160),
      description: z.string().max(320),
    })
    .safeParse(bodyResult.data);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    const result = await saveNewsListingSeo(parsed.data);
    await addAuditLog({
      actor: "admin",
      action: "news-listing-seo.update",
      target: "news",
      payload: { usingDefault: false },
    });
    return NextResponse.json({ ok: true, ...result });
  } catch {
    return NextResponse.json({ error: "Could not save news listing SEO." }, { status: 503 });
  }
}
