import {
  createNews,
  deleteNews,
  getNewsById,
  listNews,
  newsSlugExists,
  newsTitleExists,
  updateNews,
  updateNewsStatus,
} from "@/src/server/repositories/newsRepository";
import { isValidCategorySlugFormat, newsArticlePath } from "@/src/lib/newsCategories";
import { addAuditLog } from "@/src/server/repositories/auditRepository";
import { listNewsCategorySlugs } from "@/src/server/repositories/newsCategoryRepository";
import { readAdminJsonBody } from "@/src/server/admin/adminApiHelpers";
import { getAutoNotifySettings } from "@/src/server/repositories/autoNotifySettingsRepository";
import { maybeSendPublishPush } from "@/src/server/services/publishPushNotify";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { enforceAdminApiAccess } from "@/src/server/rbac/enforceAdminApiAccess";

const seoFields = {
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  canonicalUrl: z.string().optional(),
  ogImageUrl: z.string().optional(),
  socialTitle: z.string().optional(),
  socialDescription: z.string().optional(),
  socialImageAlt: z.string().optional(),
  metaKeywords: z.string().optional(),
};

const categorySlugSchema = z
  .string()
  .min(1)
  .max(64)
  .refine((value) => isValidCategorySlugFormat(value), "Invalid category slug");

const createSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(1),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  featureImage: z.string().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
  primaryCategory: categorySlugSchema.optional(),
  extraCategories: z.array(categorySlugSchema).optional(),
  ...seoFields,
});

async function assertKnownCategories(input: {
  primaryCategory?: string;
  extraCategories?: string[];
}) {
  const known = await listNewsCategorySlugs();
  const knownSet = new Set(known);
  if (input.primaryCategory && !knownSet.has(input.primaryCategory)) {
    return NextResponse.json({ error: "Unknown primary category." }, { status: 400 });
  }
  for (const cat of input.extraCategories ?? []) {
    if (!knownSet.has(cat)) {
      return NextResponse.json({ error: "Unknown extra category." }, { status: 400 });
    }
  }
  return null;
}

function mapNewsWriteError(error: unknown) {
  if (error instanceof Error && error.message === "SLUG_EXISTS") {
    return NextResponse.json({ error: "Slug already exists." }, { status: 409 });
  }
  if (error instanceof Error && error.message === "TITLE_EXISTS") {
    return NextResponse.json({ error: "Title already exists." }, { status: 409 });
  }
  if (error instanceof Error && error.message === "INVALID_SLUG") {
    return NextResponse.json({ error: "Slug is required." }, { status: 400 });
  }
  return NextResponse.json({ error: "Could not save news." }, { status: 500 });
}

export async function GET(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  const id = request.nextUrl.searchParams.get("id");
  if (id) {
    const item = await getNewsById(id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: item });
  }

  const slug = request.nextUrl.searchParams.get("slug");
  const title = request.nextUrl.searchParams.get("title");
  const excludeId = request.nextUrl.searchParams.get("excludeId") ?? undefined;
  if (slug) {
    const exists = await newsSlugExists(slug, excludeId);
    return NextResponse.json({ exists });
  }
  if (title) {
    const exists = await newsTitleExists(title, excludeId);
    return NextResponse.json({ exists });
  }

  const page = Number(request.nextUrl.searchParams.get("page") ?? "1");
  const pageSize = Number(request.nextUrl.searchParams.get("pageSize") ?? "10");
  const result = await listNews(page, pageSize);
  return NextResponse.json({
    data: result.data,
    page,
    pageSize,
    total: result.total,
  });
}

export async function POST(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  const bodyResult = await readAdminJsonBody(request);
  if (!bodyResult.ok) return bodyResult.response;
  const parsed = createSchema.safeParse(bodyResult.data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid news payload" }, { status: 400 });
  }
  const categoryError = await assertKnownCategories(parsed.data);
  if (categoryError) return categoryError;
  try {
    const item = await createNews(parsed.data);
    await addAuditLog({
      actor: "admin",
      action: "news.create",
      target: item.id,
      payload: { slug: parsed.data.slug },
    });
    return NextResponse.json({ ok: true, data: item });
  } catch (error) {
    return mapNewsWriteError(error);
  }
}

export async function PATCH(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  const bodyResult = await readAdminJsonBody(request);
  if (!bodyResult.ok) return bodyResult.response;
  const body = bodyResult.data;
  const statusUpdateSchema = z.object({
    id: z.string(),
    status: z.enum(["draft", "published"]),
  });
  const contentUpdateSchema = z
    .object({
      id: z.string(),
      title: z.string().min(3),
      slug: z.string().min(1),
      excerpt: z.string().optional(),
      content: z.string().optional(),
      featureImage: z.string().optional(),
      status: z.enum(["draft", "published"]).optional(),
      primaryCategory: categorySlugSchema.optional(),
      extraCategories: z.array(categorySlugSchema).optional(),
      ...seoFields,
    })
    .strict();

  const statusParsed = statusUpdateSchema.safeParse(body);
  if (statusParsed.success) {
    try {
      const item = await updateNewsStatus(statusParsed.data.id, statusParsed.data.status);
      if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
      const autoNotify = await getAutoNotifySettings();
      const sendPush =
        statusParsed.data.status === "published" && autoNotify.newsOnPublish;

      await addAuditLog({
        actor: "admin",
        action: "news.status.update",
        target: statusParsed.data.id,
        payload: {
          status: statusParsed.data.status,
          sendPush,
        },
      });

      let warning: string | undefined;
      let pushSent = false;
      if (sendPush) {
        const pushResult = await maybeSendPublishPush({
          sendPush: true,
          source: "news",
          title: item.title,
          body: item.excerpt || undefined,
          urlPath: newsArticlePath(
            (item as { primaryCategory?: string | null }).primaryCategory,
            item.slug,
          ),
        });
        warning = pushResult.warning;
        pushSent = pushResult.sent;
      }

      return NextResponse.json({
        ok: true,
        data: item,
        pushSent,
        ...(warning ? { warning } : {}),
      });
    } catch {
      return NextResponse.json({ error: "Could not update news status." }, { status: 500 });
    }
  }

  const contentParsed = contentUpdateSchema.safeParse(body);
  if (!contentParsed.success) {
    return NextResponse.json({ error: "Invalid update" }, { status: 400 });
  }
  const categoryError = await assertKnownCategories(contentParsed.data);
  if (categoryError) return categoryError;
  try {
    const item = await updateNews(contentParsed.data);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await addAuditLog({
      actor: "admin",
      action: "news.update",
      target: contentParsed.data.id,
      payload: { slug: contentParsed.data.slug },
    });
    return NextResponse.json({ ok: true, data: item });
  } catch (error) {
    return mapNewsWriteError(error);
  }
}

export async function DELETE(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const ok = await deleteNews(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await addAuditLog({
    actor: "admin",
    action: "news.delete",
    target: id,
  });
  return NextResponse.json({ ok: true });
}
