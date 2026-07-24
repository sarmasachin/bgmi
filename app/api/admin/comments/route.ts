import {
  listComments,
  moderateComment,
  removeComment,
} from "@/src/server/repositories/commentsRepository";
import { addAuditLog } from "@/src/server/repositories/auditRepository";
import { readAdminJsonBody } from "@/src/server/admin/adminApiHelpers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { enforceAdminApiAccess } from "@/src/server/rbac/enforceAdminApiAccess";

export async function GET(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  const data = await listComments();
  return NextResponse.json({ data });
}

export async function PATCH(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  const bodyResult = await readAdminJsonBody(request);
  if (!bodyResult.ok) return bodyResult.response;
  const parsed = z
    .object({ id: z.string(), status: z.enum(["pending", "approved", "rejected", "spam"]) })
    .safeParse(bodyResult.data);
  if (!parsed.success) return NextResponse.json({ error: "Invalid moderation payload" }, { status: 400 });
  try {
    const item = await moderateComment(parsed.data.id, parsed.data.status);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await addAuditLog({
      actor: "admin",
      action: "comment.moderate",
      target: parsed.data.id,
      payload: { status: parsed.data.status },
    });
    return NextResponse.json({ ok: true, data: item });
  } catch {
    return NextResponse.json({ error: "Could not update comment." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const ok = await removeComment(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await addAuditLog({
    actor: "admin",
    action: "comment.delete",
    target: id,
  });
  return NextResponse.json({ ok: true });
}
