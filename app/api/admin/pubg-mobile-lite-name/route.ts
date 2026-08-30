import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { readAdminJsonBody } from "@/src/server/admin/adminApiHelpers";
import { addAuditLog } from "@/src/server/repositories/auditRepository";
import {
  clearPubgMobileLiteNamePage,
  getPubgMobileLiteNamePageForAdmin,
  savePubgMobileLiteNamePage,
} from "@/src/server/repositories/pubgMobileLiteNameRepository";
import { enforceAdminApiAccess } from "@/src/server/rbac/enforceAdminApiAccess";

export async function GET(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  const data = await getPubgMobileLiteNamePageForAdmin();
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
      const result = await clearPubgMobileLiteNamePage();
      await addAuditLog({
        actor: "admin",
        action: "pubg-mobile-lite-name.reset",
        target: "pubg-mobile-lite-name",
        payload: { usingDefault: true },
      });
      return NextResponse.json({ ok: true, ...result });
    }

    if (parsed.data.page === undefined) {
      return NextResponse.json({ error: "Missing page payload" }, { status: 400 });
    }

    const result = await savePubgMobileLiteNamePage(parsed.data.page);
    await addAuditLog({
      actor: "admin",
      action: "pubg-mobile-lite-name.update",
      target: "pubg-mobile-lite-name",
      payload: { usingDefault: false },
    });
    return NextResponse.json({ ok: true, ...result });
  } catch {
    return NextResponse.json(
      { error: "Could not save PUBG Mobile Lite name page." },
      { status: 503 },
    );
  }
}
