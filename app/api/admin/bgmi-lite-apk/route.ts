import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addAuditLog } from "@/src/server/repositories/auditRepository";
import { readAdminJsonBody } from "@/src/server/admin/adminApiHelpers";
import { enforceAdminApiAccess } from "@/src/server/rbac/enforceAdminApiAccess";
import { BGMI_LITE_APK_PATH } from "@/src/lib/bgmiLiteBetaApkPage";
import {
  clearBgmiLiteApkPage,
  getBgmiLiteApkPageForAdmin,
  saveBgmiLiteApkPage,
} from "@/src/server/repositories/bgmiLiteApkPageRepository";
import { autoNotifyLiteApkSave } from "@/src/server/services/autoNotifyOnCmsSave";

export async function GET(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  try {
    const data = await getBgmiLiteApkPageForAdmin();
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Could not load BGMI Air APK page." }, { status: 503 });
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
      const result = await clearBgmiLiteApkPage();
      await addAuditLog({
        actor: "admin",
        action: "bgmi-lite-apk.reset",
        target: "bgmi-lite-apk",
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
      beforePage = (await getBgmiLiteApkPageForAdmin()).page;
      compared = true;
    } catch {
      /* still save */
    }
    const result = await saveBgmiLiteApkPage(parsed.data.page);
    await addAuditLog({
      actor: "admin",
      action: "bgmi-lite-apk.update",
      target: "bgmi-lite-apk",
      payload: { usingDefault: false },
    });
    const push = await autoNotifyLiteApkSave({
      beforePage,
      afterPage: result.page,
      title: result.page.heroTitle || result.page.seoTitle,
      urlPath: result.page.path || BGMI_LITE_APK_PATH,
      compared,
    });
    return NextResponse.json({
      ok: true,
      ...result,
      pushSent: push.pushSent,
      ...(push.warning ? { warning: push.warning } : {}),
    });
  } catch {
    return NextResponse.json({ error: "Could not save BGMI Air APK page." }, { status: 503 });
  }
}
