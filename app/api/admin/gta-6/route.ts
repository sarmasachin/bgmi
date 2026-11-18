import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { readAdminJsonBody } from "@/src/server/admin/adminApiHelpers";
import { addAuditLog } from "@/src/server/repositories/auditRepository";
import {
  clearGta6Page,
  getGta6PageForAdmin,
  saveGta6Page,
} from "@/src/server/repositories/gta6PageRepository";
import { enforceAdminApiAccess } from "@/src/server/rbac/enforceAdminApiAccess";

export async function GET(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  try {
    const data = await getGta6PageForAdmin();
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Could not load GTA 6 page." }, { status: 503 });
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
      const result = await clearGta6Page();
      await addAuditLog({
        actor: "admin",
        action: "gta-6.reset",
        target: "gta-6",
        payload: { usingDefault: true },
      });
      return NextResponse.json({ ok: true, ...result });
    }

    if (parsed.data.page === undefined) {
      return NextResponse.json({ error: "Missing page payload" }, { status: 400 });
    }

    const result = await saveGta6Page(parsed.data.page);
    await addAuditLog({
      actor: "admin",
      action: "gta-6.update",
      target: "gta-6",
      payload: { usingDefault: false },
    });
    return NextResponse.json({ ok: true, ...result });
  } catch {
    return NextResponse.json({ error: "Could not save GTA 6 page." }, { status: 503 });
  }
}
