import {
  listComments,
  moderateComment,
  removeComment,
} from "@/src/server/repositories/commentsRepository";
import {
  listAllPageComments,
  moderatePageComment,
  removePageComment,
} from "@/src/server/repositories/pageCommentsRepository";
import { addAuditLog } from "@/src/server/repositories/auditRepository";
import { readAdminJsonBody } from "@/src/server/admin/adminApiHelpers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { enforceAdminApiAccess } from "@/src/server/rbac/enforceAdminApiAccess";

function toIso(value: unknown) {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return "";
}

export async function GET(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  const [newsComments, pageComments] = await Promise.all([
    listComments(),
    listAllPageComments(),
  ]);

  const newsMapped = newsComments.map((item) => ({
    ...item,
    createdAt: toIso((item as { createdAt?: unknown }).createdAt),
    source: "news" as const,
    pageKey: "",
  }));

  const pageMapped = pageComments.map((item) => ({
    id: item.id,
    name: item.name,
    message: item.message,
    status: item.status,
    createdAt: toIso(item.createdAt),
    newsId: "",
    source: "page" as const,
    pageKey: item.pageKey,
    email: "email" in item && item.email ? String(item.email) : "",
  }));

  const data = [...newsMapped, ...pageMapped].sort((a, b) => {
    const ta = Date.parse(a.createdAt || "") || 0;
    const tb = Date.parse(b.createdAt || "") || 0;
    return tb - ta;
  });

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
    const item =
      (await moderateComment(parsed.data.id, parsed.data.status)) ??
      (await moderatePageComment(parsed.data.id, parsed.data.status));
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
  const ok = (await removeComment(id)) || (await removePageComment(id));
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await addAuditLog({
    actor: "admin",
    action: "comment.delete",
    target: id,
  });
  return NextResponse.json({ ok: true });
}
