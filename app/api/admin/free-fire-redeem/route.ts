import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { readAdminJsonBody } from "@/src/server/admin/adminApiHelpers";
import { addAuditLog } from "@/src/server/repositories/auditRepository";
import { FREE_FIRE_REDEEM_CODE_PATH } from "@/src/lib/freeFireRedeemCodes";
import {
  clearFreeFireRedeemPage,
  getFreeFireRedeemPageForAdmin,
  saveFreeFireRedeemPage,
} from "@/src/server/repositories/freeFireRedeemCodesRepository";
import { enforceAdminApiAccess } from "@/src/server/rbac/enforceAdminApiAccess";
import { autoNotifyRedeemSave } from "@/src/server/services/autoNotifyOnCmsSave";

export async function GET(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  try {
    const data = await getFreeFireRedeemPageForAdmin();
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: "Could not load Free Fire redeem codes page." },
      { status: 503 },
    );
  }
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
      const result = await clearFreeFireRedeemPage();
      await addAuditLog({
        actor: "admin",
        action: "free-fire-redeem.reset",
        target: "free-fire-redeem-code",
        payload: { usingDefault: true },
      });
      return NextResponse.json({ ok: true, ...result });
    }

    if (parsed.data.page === undefined) {
      return NextResponse.json({ error: "Missing page payload" }, { status: 400 });
    }

    let beforeCodes: unknown = [];
    let compared = false;
    try {
      beforeCodes = (await getFreeFireRedeemPageForAdmin()).page.codes;
      compared = true;
    } catch {
      /* still save */
    }
    const result = await saveFreeFireRedeemPage(parsed.data.page);
    await addAuditLog({
      actor: "admin",
      action: "free-fire-redeem.update",
      target: "free-fire-redeem-code",
      payload: { usingDefault: false },
    });
    const push = await autoNotifyRedeemSave({
      beforeCodes,
      afterCodes: result.page.codes,
      title: result.page.title,
      urlPath: result.page.path || FREE_FIRE_REDEEM_CODE_PATH,
      compared,
    });
    return NextResponse.json({
      ok: true,
      ...result,
      pushSent: push.pushSent,
      ...(push.warning ? { warning: push.warning } : {}),
    });
  } catch {
    return NextResponse.json(
      { error: "Could not save Free Fire redeem codes page." },
      { status: 503 },
    );
  }
}
