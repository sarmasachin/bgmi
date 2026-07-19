import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { restoreMockBackup } from "@/src/server/mockStore";
import { prisma, tryPrismaLong } from "@/src/server/dbSafe";
import crypto from "crypto";
import { addAuditLog } from "@/src/server/repositories/auditRepository";

function restoreStr(v: unknown): string {
  if (v == null) return "";
  return String(v);
}

function restoreStrNull(v: unknown): string | null {
  if (v == null || v === "") return null;
  return String(v);
}

function restoreDate(v: unknown): Date {
  if (v instanceof Date && !Number.isNaN(v.getTime())) return v;
  if (typeof v === "string" || typeof v === "number") {
    const d = new Date(v);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date();
}

function restoreDateNull(v: unknown): Date | null {
  if (v == null || v === "") return null;
  if (v instanceof Date && !Number.isNaN(v.getTime())) return v;
  if (typeof v === "string" || typeof v === "number") {
    const d = new Date(v);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return null;
}

function restoreJson(v: unknown): Prisma.InputJsonValue {
  if (v != null && typeof v === "object") return v as Prisma.InputJsonValue;
  return {};
}

function restoreAdminActive(item: Record<string, unknown>): boolean {
  if (typeof item.isActive === "boolean") return item.isActive;
  if (typeof item.active === "boolean") return item.active;
  return true;
}

const schema = z.object({
  dryRun: z.boolean().default(true),
  version: z.number().optional(),
  checksum: z.string().optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  let raw: unknown = {};
  try {
    const text = await request.text();
    if (text.trim()) {
      raw = JSON.parse(text) as unknown;
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid backup payload" }, { status: 400 });
  }

  const payload = (parsed.data.payload ?? {}) as Record<string, unknown>;
  if (parsed.data.checksum) {
    const serialized = JSON.stringify(payload);
    const computed = crypto.createHash("sha256").update(serialized).digest("hex");
    if (computed !== parsed.data.checksum) {
      return NextResponse.json({ error: "Checksum mismatch" }, { status: 400 });
    }
  }

  if (parsed.data.dryRun) {
    return NextResponse.json({
      ok: true,
      dryRun: true,
      validation: "passed",
      checksumVerified: Boolean(parsed.data.checksum),
    });
  }

  const usersForRestore = Array.isArray(payload.users) ? payload.users : [];
  if (usersForRestore.length === 0) {
    return NextResponse.json(
      { error: "Restore refused: payload must include at least one admin user (payload.users)." },
      { status: 400 },
    );
  }

  const restoredInDb = await tryPrismaLong(async () => {
    await prisma.$transaction([
      prisma.newsComment.deleteMany(),
      prisma.newsRating.deleteMany(),
      prisma.newsPost.deleteMany(),
      prisma.pageTemplate.deleteMany(),
      prisma.adSlot.deleteMany(),
      prisma.siteSetting.deleteMany(),
      prisma.adminUser.deleteMany(),
    ]);

    const news = Array.isArray(payload.news) ? (payload.news as Record<string, unknown>[]) : [];
    const pages = Array.isArray(payload.pages) ? (payload.pages as Record<string, unknown>[]) : [];
    const comments = Array.isArray(payload.comments) ? (payload.comments as Record<string, unknown>[]) : [];
    const ads = Array.isArray(payload.ads) ? (payload.ads as Record<string, unknown>[]) : [];
    const users = Array.isArray(payload.users) ? (payload.users as Record<string, unknown>[]) : [];
    const settings = Array.isArray(payload.settings) ? (payload.settings as Record<string, unknown>[]) : [];

    for (const item of news) {
      await prisma.newsPost.create({
        data: {
          id: restoreStr(item.id),
          title: restoreStr(item.title),
          slug: restoreStr(item.slug),
          excerpt: restoreStrNull(item.excerpt),
          content: restoreJson(item.content),
          featureImage: restoreStrNull(item.featureImage),
          status: restoreStr(item.status) || "draft",
          seoTitle: restoreStrNull(item.seoTitle),
          seoDescription: restoreStrNull(item.seoDescription),
          authorName: restoreStrNull(item.authorName),
          publishedAt: restoreDateNull(item.publishedAt),
          createdAt: restoreDate(item.createdAt),
          updatedAt: restoreDate(item.updatedAt),
        },
      });
    }

    for (const item of pages) {
      await prisma.pageTemplate.create({
        data: {
          id: restoreStr(item.id),
          title: restoreStr(item.title),
          slug: restoreStr(item.slug),
          status: restoreStr(item.status) || "draft",
          content: restoreJson(item.content),
          seoTitle: restoreStrNull(item.seoTitle),
          seoDescription: restoreStrNull(item.seoDescription),
          canonicalUrl: restoreStrNull(item.canonicalUrl),
          ogImageUrl: restoreStrNull(item.ogImageUrl),
          publishAsNews: Boolean(item.publishAsNews),
          createdAt: restoreDate(item.createdAt),
          updatedAt: restoreDate(item.updatedAt),
        },
      });
    }

    for (const item of comments) {
      await prisma.newsComment.create({
        data: {
          id: restoreStr(item.id),
          newsId: restoreStr(item.newsId),
          name: restoreStr(item.name),
          message: restoreStr(item.message),
          status: restoreStr(item.status) || "pending",
          createdAt: restoreDate(item.createdAt),
        },
      });
    }

    for (const item of ads) {
      const slotKey = restoreStr(item.slotKey);
      await prisma.adSlot.create({
        data: {
          id: restoreStr(item.id),
          slotKey,
          title: restoreStrNull(item.title) ?? slotKey,
          code: restoreStrNull(item.code),
          isEnabled: Boolean(item.isEnabled ?? item.enabled),
          createdAt: restoreDate(item.createdAt),
          updatedAt: restoreDate(item.updatedAt),
        },
      });
    }

    for (const item of users) {
      await prisma.adminUser.create({
        data: {
          id: restoreStr(item.id),
          email: restoreStr(item.email),
          passwordHash: restoreStr(item.passwordHash),
          name: restoreStrNull(item.name),
          role: restoreStr(item.role) || "admin",
          isActive: restoreAdminActive(item),
          createdAt: restoreDate(item.createdAt),
          updatedAt: restoreDate(item.updatedAt),
        },
      });
    }

    for (const item of settings) {
      await prisma.siteSetting.create({
        data: {
          id: restoreStr(item.id),
          key: restoreStr(item.key),
          value: restoreJson(item.value),
          createdAt: restoreDate(item.createdAt),
          updatedAt: restoreDate(item.updatedAt),
        },
      });
    }
    return true;
  });

  if (!restoredInDb) {
    if (process.env.NODE_ENV === "production" && process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Database restore failed. Please try again shortly." },
        { status: 503 },
      );
    }
    restoreMockBackup(payload as never);
  }

  await addAuditLog({
    actor: "admin",
    action: "backup.restore",
    target: "system",
    payload: { dryRun: false, version: parsed.data.version ?? 1 },
  });

  return NextResponse.json({
    ok: true,
    dryRun: false,
    message: "Backup restored successfully.",
  });
}
