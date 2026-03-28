import {
  createPage,
  deletePage,
  listPages,
  pageSlugExists,
  updatePage,
} from "@/src/server/repositories/pagesRepository";
import { addAuditLog } from "@/src/server/repositories/auditRepository";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(3),
  slug: z.string().min(1),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  canonicalUrl: z.string().optional(),
  ogImageUrl: z.string().optional(),
  templateType: z.enum(["home", "article", "landing"]).optional(),
  socialTitle: z.string().optional(),
  socialDescription: z.string().optional(),
  socialImageAlt: z.string().optional(),
  content: z.string().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
  publishAsNews: z.boolean().default(false),
});

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  const excludeId = request.nextUrl.searchParams.get("excludeId") ?? undefined;
  if (slug) {
    const exists = await pageSlugExists(slug, excludeId);
    return NextResponse.json({ exists });
  }

  const data = await listPages();
  return NextResponse.json({ data, total: data.length });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid page payload" }, { status: 400 });
  }
  let page;
  try {
    page = await createPage(parsed.data);
  } catch (error) {
    if (error instanceof Error && error.message === "SLUG_EXISTS") {
      return NextResponse.json({ error: "Slug already exists." }, { status: 409 });
    }
    throw error;
  }
  await addAuditLog({
    actor: "admin",
    action: "page.create",
    target: page.id,
    payload: { slug: parsed.data.slug, publishAsNews: parsed.data.publishAsNews },
  });
  return NextResponse.json({ ok: true, data: page });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const parsed = z
    .object({
      id: z.string(),
      title: z.string().optional(),
      slug: z.string().optional(),
      seoTitle: z.string().optional(),
      seoDescription: z.string().optional(),
      canonicalUrl: z.string().optional(),
      ogImageUrl: z.string().optional(),
      templateType: z.enum(["home", "article", "landing"]).optional(),
      socialTitle: z.string().optional(),
      socialDescription: z.string().optional(),
      socialImageAlt: z.string().optional(),
      content: z.string().optional(),
      status: z.enum(["draft", "published"]).optional(),
    })
    .safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid update payload" }, { status: 400 });
  let page;
  try {
    page = await updatePage(parsed.data.id, parsed.data);
  } catch (error) {
    if (error instanceof Error && error.message === "SLUG_EXISTS") {
      return NextResponse.json({ error: "Slug already exists." }, { status: 409 });
    }
    throw error;
  }
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await addAuditLog({
    actor: "admin",
    action: "page.update",
    target: parsed.data.id,
    payload: parsed.data,
  });
  return NextResponse.json({ ok: true, data: page });
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const ok = await deletePage(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await addAuditLog({
    actor: "admin",
    action: "page.delete",
    target: id,
  });
  return NextResponse.json({ ok: true });
}
