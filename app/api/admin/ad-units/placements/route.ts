import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addAuditLog } from "@/src/server/repositories/auditRepository";
import { enforceAdminApiAccess } from "@/src/server/rbac/enforceAdminApiAccess";
import {
  getAdPlacementVisibility,
  saveAdPlacementVisibility,
} from "@/src/server/repositories/adPlacementRepository";

const schema = z.object({
  home: z.object({
    home_above_calculator: z.boolean(),
    home_between_tool_and_article: z.boolean(),
  }),
  newsArticle: z.object({
    news_detail_top: z.boolean(),
    news_detail_mid: z.boolean(),
    news_detail_bottom: z.boolean(),
  }),
});

export async function GET(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  const data = await getAdPlacementVisibility();
  return NextResponse.json({ data });
}

export async function PATCH(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  try {
    await saveAdPlacementVisibility(parsed.data);
    await addAuditLog({
      actor: "admin",
      action: "ads.placements",
      target: "visibility",
      payload: parsed.data,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not save placements." }, { status: 500 });
  }
}
