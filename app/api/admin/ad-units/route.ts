import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addAuditLog } from "@/src/server/repositories/auditRepository";
import { listAdSlots, updateAdSlot } from "@/src/server/repositories/adsRepository";
import { readAdminJsonBody } from "@/src/server/admin/adminApiHelpers";

export async function GET() {
  const data = await listAdSlots();
  return NextResponse.json({ data });
}

export async function PATCH(request: NextRequest) {
  const bodyResult = await readAdminJsonBody(request);
  if (!bodyResult.ok) return bodyResult.response;
  const parsed = z
    .object({
      id: z.string(),
      enabled: z.boolean().optional(),
      code: z.string().optional(),
    })
    .safeParse(bodyResult.data);
  if (!parsed.success) return NextResponse.json({ error: "Invalid ad payload" }, { status: 400 });
  try {
    const ad = await updateAdSlot(parsed.data);
    if (!ad) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await addAuditLog({
      actor: "admin",
      action: "ads.update",
      target: parsed.data.id,
      payload: parsed.data,
    });
    return NextResponse.json({ ok: true, data: ad });
  } catch {
    return NextResponse.json({ error: "Could not save ad slot." }, { status: 500 });
  }
}
