import { NextResponse } from "next/server";
import { prisma, tryPrisma } from "@/src/server/dbSafe";
import { exportMockBackup } from "@/src/server/mockStore";
import crypto from "crypto";

export async function GET() {
  const dbBackup = await tryPrisma(async () => {
    const [news, pages, comments, ads, users, settings] = await Promise.all([
      prisma.newsPost.findMany(),
      prisma.pageTemplate.findMany(),
      prisma.newsComment.findMany(),
      prisma.adSlot.findMany(),
      prisma.adminUser.findMany(),
      prisma.siteSetting.findMany(),
    ]);
    return { news, pages, comments, ads, users, settings };
  });

  const payload = dbBackup ?? exportMockBackup();
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
