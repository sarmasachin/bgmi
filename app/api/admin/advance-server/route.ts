import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addAuditLog } from "@/src/server/repositories/auditRepository";
import { readAdminJsonBody } from "@/src/server/admin/adminApiHelpers";
import { enforceAdminApiAccess } from "@/src/server/rbac/enforceAdminApiAccess";
import { FREE_FIRE_ADVANCE_SERVER_PATH } from "@/src/lib/ffAdvanceServerPage";
import {
  clearAdvanceServerPage,
  getAdvanceServerPageForAdmin,
  saveAdvanceServerPage,
} from "@/src/server/repositories/advanceServerPageRepository";
import { autoNotifyAdvanceServerSave } from "@/src/server/services/autoNotifyOnCmsSave";

export async function GET(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  const data = await getAdvanceServerPageForAdmin();
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  const bodyResult = await readAdminJsonBody(request);
  if (!bodyResult.ok) return bodyResult.response;

  const parsed = z
    .object({
      action: z.enum(["save", "reset"]).default("save"),
      page: z.unknown().optional(),
    })
    .safeParse(bodyResult.data);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    if (parsed.data.action === "reset") {
      const result = await clearAdvanceServerPage();
      await addAuditLog({
        actor: "admin",
        action: "advance-server.reset",
        target: "free-fire-advance-server",
        payload: { usingDefault: true },
      });
      return NextResponse.json({ ok: true, ...result });
    }

    if (parsed.data.page === undefined) {
      return NextResponse.json({ error: "Missing page payload" }, { status: 400 });
    }

    let beforePage: unknown = null;
    let compared = false;
    try {
      beforePage = (await getAdvanceServerPageForAdmin()).page;
      compared = true;
    } catch {
      /* still save */
    }
    const result = await saveAdvanceServerPage(parsed.data.page);
    await addAuditLog({
      actor: "admin",
      action: "advance-server.update",
      target: "free-fire-advance-server",
      payload: { usingDefault: false },
    });
    const push = await autoNotifyAdvanceServerSave({
      beforePage,
      afterPage: result.page,
      title: result.page.heroTitle || result.page.title,
      urlPath: result.page.path || FREE_FIRE_ADVANCE_SERVER_PATH,
      compared,
    });
    return NextResponse.json({
      ok: true,
      ...result,
      pushSent: push.pushSent,
      ...(push.warning ? { warning: push.warning } : {}),
    });
  } catch {
    return NextResponse.json({ error: "Could not save Advance Server page." }, { status: 503 });
  }
}
