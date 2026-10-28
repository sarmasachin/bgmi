import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { readAdminJsonBody } from "@/src/server/admin/adminApiHelpers";
import { addAuditLog } from "@/src/server/repositories/auditRepository";
import { FREE_FIRE_INDIA_STYLISH_NAME_PATH } from "@/src/lib/freeFireIndiaNamePage";
import {
  clearFreeFireIndiaStylishNamePage,
  getFreeFireIndiaStylishNamePageForAdmin,
  saveFreeFireIndiaStylishNamePage,
} from "@/src/server/repositories/freeFireIndiaStylishNameRepository";
import { enforceAdminApiAccess } from "@/src/server/rbac/enforceAdminApiAccess";
import { autoNotifyStylishNamesSave } from "@/src/server/services/autoNotifyOnCmsSave";

export async function GET(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  try {
    const data = await getFreeFireIndiaStylishNamePageForAdmin();
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: "Could not load Free Fire India stylish name page." },
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
      const result = await clearFreeFireIndiaStylishNamePage();
      await addAuditLog({
        actor: "admin",
        action: "free-fire-india-stylish.reset",
        target: "free-fire-india-stylish-name",
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
      beforePage = (await getFreeFireIndiaStylishNamePageForAdmin()).page;
      compared = true;
    } catch {
      /* still save */
    }
    const result = await saveFreeFireIndiaStylishNamePage(parsed.data.page);
    await addAuditLog({
      actor: "admin",
      action: "free-fire-india-stylish.update",
      target: "free-fire-india-stylish-name",
      payload: { usingDefault: false },
    });
    const push = await autoNotifyStylishNamesSave({
      beforePage,
      afterPage: result.page,
      title: result.page.title,
      urlPath: result.page.path || FREE_FIRE_INDIA_STYLISH_NAME_PATH,
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
      { error: "Could not save Free Fire India stylish name page." },
      { status: 503 },
    );
  }
}
