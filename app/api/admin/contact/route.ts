import {
  deleteContactMessage,
  listContactMessages,
  updateContactMessageStatus,
} from "@/src/server/repositories/contactRepository";
import { addAuditLog } from "@/src/server/repositories/auditRepository";
import { readAdminJsonBody } from "@/src/server/admin/adminApiHelpers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET() {
  const data = await listContactMessages();
  return NextResponse.json({ data });
}

export async function PATCH(request: NextRequest) {
  const bodyResult = await readAdminJsonBody(request);
  if (!bodyResult.ok) return bodyResult.response;
  const parsed = z
    .object({
      id: z.string().min(1),
      status: z.enum(["new", "read", "archived"]),
    })
    .safeParse(bodyResult.data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update payload" }, { status: 400 });
  }

  try {
    const item = await updateContactMessageStatus(parsed.data.id, parsed.data.status);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await addAuditLog({
      actor: "admin",
      action: "contact.status",
      target: parsed.data.id,
      payload: { status: parsed.data.status },
    });
    return NextResponse.json({ ok: true, data: item });
  } catch {
    return NextResponse.json({ error: "Could not update message." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const ok = await deleteContactMessage(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await addAuditLog({
    actor: "admin",
    action: "contact.delete",
    target: id,
  });
  return NextResponse.json({ ok: true });
}
