import { NextResponse } from "next/server";
import { prisma, tryPrisma } from "@/src/server/dbSafe";
import { exportMockBackup } from "@/src/server/mockStore";
import crypto from "crypto";

function stripUserSecrets(users: unknown) {
  if (!Array.isArray(users)) return [];
  return users.map((u) => {
    if (!u || typeof u !== "object") return u;
    const { passwordHash: _omit, ...rest } = u as Record<string, unknown>;
    return rest;
  });
}

export async function GET() {
  const dbBackup = await tryPrisma(async () => {
    const [news, pages, comments, ads, users, settings] = await Promise.all([
      prisma.newsPost.findMany(),
      prisma.pageTemplate.findMany(),
      prisma.newsComment.findMany(),
      prisma.adSlot.findMany(),
      prisma.adminUser.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.siteSetting.findMany(),
    ]);
    return { news, pages, comments, ads, users, settings };
  });

  const raw = dbBackup ?? exportMockBackup();
  const payload = {
    ...raw,
    users: stripUserSecrets(raw.users),
  };
  const body = JSON.stringify(payload);
  const checksum = crypto.createHash("sha256").update(body).digest("hex");
  return NextResponse.json({
    ok: true,
    version: 1,
    exportedAt: new Date().toISOString(),
    checksum,
    payload,
  });
}
