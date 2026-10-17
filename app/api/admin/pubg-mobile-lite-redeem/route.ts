import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { readAdminJsonBody } from "@/src/server/admin/adminApiHelpers";
import { addAuditLog } from "@/src/server/repositories/auditRepository";
import { PUBG_MOBILE_LITE_REDEEM_CODE_PATH } from "@/src/lib/pubgMobileLiteRedeemCodes";
import {
  clearPubgMobileLiteRedeemPage,
  getPubgMobileLiteRedeemPageForAdmin,
  savePubgMobileLiteRedeemPage,
} from "@/src/server/repositories/pubgMobileLiteRedeemCodesRepository";
import { enforceAdminApiAccess } from "@/src/server/rbac/enforceAdminApiAccess";
import { autoNotifyRedeemSave } from "@/src/server/services/autoNotifyOnCmsSave";

export async function GET(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  const data = await getPubgMobileLiteRedeemPageForAdmin();
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
      const result = await clearPubgMobileLiteRedeemPage();
      await addAuditLog({
        actor: "admin",
        action: "pubg-mobile-lite-redeem.reset",
        target: "pubg-mobile-lite-redeem-code",
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
      beforeCodes = (await getPubgMobileLiteRedeemPageForAdmin()).page.codes;
      compared = true;
    } catch {
      /* still save */
    }
    const result = await savePubgMobileLiteRedeemPage(parsed.data.page);
    await addAuditLog({
      actor: "admin",
      action: "pubg-mobile-lite-redeem.update",
      target: "pubg-mobile-lite-redeem-code",
      payload: { usingDefault: false },
    });
    const push = await autoNotifyRedeemSave({
      beforeCodes,
      afterCodes: result.page.codes,
      title: result.page.title,
      urlPath: result.page.path || PUBG_MOBILE_LITE_REDEEM_CODE_PATH,
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
      { error: "Could not save PUBG Mobile Flash redeem codes page." },
      { status: 503 },
    );
  }
}
