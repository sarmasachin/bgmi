import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { enforceAdminApiAccess } from "@/src/server/rbac/enforceAdminApiAccess";
import { readAdminJsonBody } from "@/src/server/admin/adminApiHelpers";
import { addAuditLog } from "@/src/server/repositories/auditRepository";
import {
  createNewsCategory,
  deleteNewsCategory,
  listNewsCategories,
  updateNewsCategory,
} from "@/src/server/repositories/newsCategoryRepository";

const createSchema = z.object({
  slug: z.string().min(1).max(64),
  label: z.string().min(1).max(80),
});

const updateSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1).max(80),
  slug: z.string().min(1).max(64).optional(),
});

function mapError(error: unknown) {
  if (error instanceof Error) {
    if (error.message === "SLUG_EXISTS") {
      return NextResponse.json({ error: "Category slug already exists." }, { status: 409 });
    }
    if (error.message === "INVALID_SLUG") {
      return NextResponse.json(
        { error: "Slug must be lowercase letters, numbers, and hyphens." },
        { status: 400 },
      );
    }
    if (error.message === "INVALID_LABEL") {
      return NextResponse.json({ error: "Label is required." }, { status: 400 });
    }
    if (error.message === "DB_UNAVAILABLE") {
      return NextResponse.json({ error: "Database unavailable." }, { status: 503 });
    }
  }
  return NextResponse.json({ error: "Could not save category." }, { status: 500 });
}

export async function GET(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  const data = await listNewsCategories();
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  const bodyResult = await readAdminJsonBody(request);
  if (!bodyResult.ok) return bodyResult.response;
  const parsed = createSchema.safeParse(bodyResult.data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid category payload." }, { status: 400 });
  }
  try {
    const item = await createNewsCategory(parsed.data);
    await addAuditLog({
      actor: "admin",
      action: "newsCategory.create",
      target: item.id,
      payload: { slug: item.slug },
    });
    return NextResponse.json({ ok: true, data: item });
  } catch (error) {
    return mapError(error);
  }
}

export async function PATCH(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  const bodyResult = await readAdminJsonBody(request);
  if (!bodyResult.ok) return bodyResult.response;
  const parsed = updateSchema.safeParse(bodyResult.data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update." }, { status: 400 });
  }
  try {
    const item = await updateNewsCategory(parsed.data);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await addAuditLog({
      actor: "admin",
      action: "newsCategory.update",
      target: item.id,
      payload: { slug: item.slug },
    });
    return NextResponse.json({ ok: true, data: item });
  } catch (error) {
    return mapError(error);
  }
}

export async function DELETE(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  try {
    const result = await deleteNewsCategory(id);
    if (!result.ok) {
      if (result.reason === "NOT_FOUND") {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      if (result.reason === "IN_USE_PRIMARY" || result.reason === "IN_USE_EXTRA") {
        return NextResponse.json(
          { error: "Category is used by news articles. Move or remove those posts first." },
          { status: 409 },
        );
      }
      if (result.reason === "LAST_CATEGORY") {
        return NextResponse.json(
          { error: "At least one category is required." },
          { status: 409 },
        );
      }
      return NextResponse.json({ error: "Could not delete." }, { status: 400 });
    }
    await addAuditLog({
      actor: "admin",
      action: "newsCategory.delete",
      target: id,
      payload: { slug: result.slug },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return mapError(error);
  }
}
