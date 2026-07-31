import {
  createPage,
  deletePage,
  listPages,
  pageSlugExists,
  pageTitleExists,
  updatePage,
} from "@/src/server/repositories/pagesRepository";
import { addAuditLog } from "@/src/server/repositories/auditRepository";
import { readAdminJsonBody } from "@/src/server/admin/adminApiHelpers";
import { getAutoNotifySettings } from "@/src/server/repositories/autoNotifySettingsRepository";
import { maybeSendPublishPush } from "@/src/server/services/publishPushNotify";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { enforceAdminApiAccess } from "@/src/server/rbac/enforceAdminApiAccess";

const schema = z.object({
  title: z.string().min(3),
  slug: z.string().min(1),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  canonicalUrl: z.string().optional(),
  ogImageUrl: z.string().optional(),
  templateType: z.enum(["home", "article", "landing"]).optional(),
  game: z.enum(["bgmi", "pubg", "freefire", "freefire-max", "pubg-mobile-codes"]).optional(),
  socialTitle: z.string().optional(),
  socialDescription: z.string().optional(),
  socialImageAlt: z.string().optional(),
  metaKeywords: z.string().optional(),
  content: z.string().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
  publishAsNews: z.boolean().default(false),
});

function mapPageWriteError(error: unknown) {
  if (error instanceof Error && error.message === "SLUG_EXISTS") {
    return NextResponse.json({ error: "Slug already exists." }, { status: 409 });
  }
  if (error instanceof Error && error.message === "TITLE_EXISTS") {
    return NextResponse.json({ error: "Title already exists." }, { status: 409 });
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
  return NextResponse.json({ error: "Could not save page." }, { status: 500 });
}

export async function GET(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  const slug = request.nextUrl.searchParams.get("slug");
  const title = request.nextUrl.searchParams.get("title");
  const excludeId = request.nextUrl.searchParams.get("excludeId") ?? undefined;
  if (slug) {
    const exists = await pageSlugExists(slug, excludeId);
    return NextResponse.json({ exists });
  }
  if (title) {
    const exists = await pageTitleExists(title, excludeId);
    return NextResponse.json({ exists });
  }

  const data = await listPages();
  return NextResponse.json({ data, total: data.length });
}

export async function POST(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  const bodyResult = await readAdminJsonBody(request);
  if (!bodyResult.ok) return bodyResult.response;

  const parsed = schema.safeParse(bodyResult.data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid page payload" }, { status: 400 });
  }
  let page;
  try {
    page = await createPage(parsed.data);
  } catch (error) {
    return mapPageWriteError(error);
  }
  await addAuditLog({
    actor: "admin",
    action: "page.create",
    target: page.id,
    payload: { slug: parsed.data.slug, publishAsNews: parsed.data.publishAsNews },
  });
  return NextResponse.json({
    ok: true,
    data: page,
    newsPublished: Boolean(parsed.data.publishAsNews),
  });
}

export async function PATCH(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  const bodyResult = await readAdminJsonBody(request);
  if (!bodyResult.ok) return bodyResult.response;

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
      game: z.enum(["bgmi", "pubg", "freefire", "freefire-max", "pubg-mobile-codes"]).optional(),
      socialTitle: z.string().optional(),
      socialDescription: z.string().optional(),
      socialImageAlt: z.string().optional(),
      metaKeywords: z.string().optional(),
      content: z.string().optional(),
      status: z.enum(["draft", "published"]).optional(),
      publishAsNews: z.boolean().optional(),
    })
    .safeParse(bodyResult.data);
  if (!parsed.success) return NextResponse.json({ error: "Invalid update payload" }, { status: 400 });
  const pageUpdate = parsed.data;
  let updated;
  try {
    updated = await updatePage(pageUpdate.id, pageUpdate);
  } catch (error) {
    return mapPageWriteError(error);
  }
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const page = updated.page;

  const autoNotify = await getAutoNotifySettings();
  const sendPush = pageUpdate.status === "published" && autoNotify.pagesOnPublish;

  await addAuditLog({
    actor: "admin",
    action: "page.update",
    target: parsed.data.id,
    payload: { ...pageUpdate, sendPush, newsPublished: updated.newsPublished },
  });

  let warning: string | undefined;
  let pushSent = false;
  if (sendPush) {
    const pushResult = await maybeSendPublishPush({
      sendPush: true,
      source: "page",
      title: page.title,
      urlPath: `/${page.slug}`,
    });
    warning = pushResult.warning;
    pushSent = pushResult.sent;
  }

  return NextResponse.json({
    ok: true,
    data: page,
    newsPublished: updated.newsPublished,
    pushSent,
    ...(warning ? { warning } : {}),
  });
}

export async function DELETE(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
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
