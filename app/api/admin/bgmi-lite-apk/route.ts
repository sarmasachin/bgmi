import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addAuditLog } from "@/src/server/repositories/auditRepository";
import { readAdminJsonBody } from "@/src/server/admin/adminApiHelpers";
import { enforceAdminApiAccess } from "@/src/server/rbac/enforceAdminApiAccess";
import {
  clearBgmiLiteApkPage,
  getBgmiLiteApkPageForAdmin,
  saveBgmiLiteApkPage,
} from "@/src/server/repositories/bgmiLiteApkPageRepository";

export async function GET(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  try {
    const data = await getBgmiLiteApkPageForAdmin();
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Could not load BGMI Lite APK page." }, { status: 503 });
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

    const result = await saveBgmiLiteApkPage(parsed.data.page);
    await addAuditLog({
      actor: "admin",
      action: "bgmi-lite-apk.update",
      target: "bgmi-lite-apk",
      payload: { usingDefault: false },
    });
    return NextResponse.json({ ok: true, ...result });
  } catch {
    return NextResponse.json({ error: "Could not save BGMI Lite APK page." }, { status: 503 });
  }
}
