import {
  createLegalPage,
  deleteLegalPage,
  ensureCoreLegalPages,
  legalSlugExists,
  listLegalPages,
  updateLegalPage,
} from "@/src/server/repositories/legalPagesRepository";
import { addAuditLog } from "@/src/server/repositories/auditRepository";
import { readAdminJsonBody } from "@/src/server/admin/adminApiHelpers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { enforceAdminApiAccess } from "@/src/server/rbac/enforceAdminApiAccess";

const writeSchema = z.object({
  title: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(1).max(80),
  content: z.string().optional(),
  seoTitle: z.string().trim().max(160).optional(),
  seoDescription: z.string().trim().max(320).optional(),
  status: z.enum(["draft", "published"]).default("draft"),
});

function mapWriteError(error: unknown) {
  if (error instanceof Error && error.message === "SLUG_EXISTS") {
    return NextResponse.json({ error: "Slug already exists." }, { status: 409 });
  }
  if (error instanceof Error && error.message === "INVALID_SLUG") {
    return NextResponse.json({ error: "Slug is required." }, { status: 400 });
  }
  if (error instanceof Error && error.message === "DB_UNAVAILABLE") {
    return NextResponse.json(
      { error: "Database temporarily unavailable. Please try again." },
      { status: 503 },
    );
  }
  return NextResponse.json({ error: "Could not save legal page." }, { status: 500 });
}

export async function GET(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  const slug = request.nextUrl.searchParams.get("slug");
  const excludeId = request.nextUrl.searchParams.get("excludeId") ?? undefined;
  const ensure = request.nextUrl.searchParams.get("ensure") === "1";

  if (slug) {
    const exists = await legalSlugExists(slug, excludeId);
    return NextResponse.json({ exists });
  }

  const data = ensure ? await ensureCoreLegalPages() : await listLegalPages();
  return NextResponse.json({ data, total: data.length });
}

export async function POST(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  const bodyResult = await readAdminJsonBody(request);
  if (!bodyResult.ok) return bodyResult.response;

  const parsed = writeSchema.safeParse(bodyResult.data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid legal page payload" }, { status: 400 });
  }

  let page;
  try {
    page = await createLegalPage(parsed.data);
  } catch (error) {
    return mapWriteError(error);
  }

  await addAuditLog({
    actor: "admin",
    action: "legal.create",
    target: page.id,
    payload: { slug: parsed.data.slug, status: parsed.data.status },
  });
  return NextResponse.json({ ok: true, data: page });
}

export async function PATCH(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  const bodyResult = await readAdminJsonBody(request);
  if (!bodyResult.ok) return bodyResult.response;

  const parsed = z
    .object({
      id: z.string().min(1),
      title: z.string().trim().min(2).max(160).optional(),
      slug: z.string().trim().min(1).max(80).optional(),
      content: z.string().optional(),
      seoTitle: z.string().trim().max(160).optional().nullable(),
      seoDescription: z.string().trim().max(320).optional().nullable(),
      status: z.enum(["draft", "published"]).optional(),
    })
    .safeParse(bodyResult.data);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update payload" }, { status: 400 });
  }

  const { id, ...rest } = parsed.data;
  const payload = {
    ...rest,
    seoTitle: rest.seoTitle === null ? "" : rest.seoTitle,
    seoDescription: rest.seoDescription === null ? "" : rest.seoDescription,
  };

  let page;
  try {
    page = await updateLegalPage(id, payload);
  } catch (error) {
    return mapWriteError(error);
  }
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await addAuditLog({
    actor: "admin",
    action: "legal.update",
    target: id,
    payload: { slug: page.slug, status: page.status },
  });
  return NextResponse.json({ ok: true, data: page });
}

export async function DELETE(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  try {
    const ok = await deleteLegalPage(id);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (error) {
    return mapWriteError(error);
  }

  await addAuditLog({
    actor: "admin",
    action: "legal.delete",
    target: id,
  });
  return NextResponse.json({ ok: true });
}
