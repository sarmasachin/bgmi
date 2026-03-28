import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addAuditLog } from "@/src/server/repositories/auditRepository";
import { listAdSlots, updateAdSlot } from "@/src/server/repositories/adsRepository";

export async function GET() {
  const data = await listAdSlots();
  return NextResponse.json({ data });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const parsed = z
    .object({
      id: z.string(),
      enabled: z.boolean().optional(),
      code: z.string().optional(),
    })
    .safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid ad payload" }, { status: 400 });
  const ad = await updateAdSlot(parsed.data);
  if (!ad) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await addAuditLog({
    actor: "admin",
    action: "ads.update",
    target: parsed.data.id,
    payload: parsed.data,
  });
  return NextResponse.json({ ok: true, data: ad });
}
