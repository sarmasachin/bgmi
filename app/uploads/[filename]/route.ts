import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import {
  getPublicUploadDir,
  isSafeUploadFilename,
} from "@/src/server/media/localImageUpload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Serve /uploads/* from disk via an explicit route.
 * Otherwise app/[slug]/[newsSlug] can catch paths like /uploads/foo.webp
 * and return a Next 404 HTML page when static public lookup misses.
 */
function contentTypeFor(filename: string) {
  switch (path.extname(filename).toLowerCase()) {
    case ".webp":
      return "image/webp";
    case ".avif":
      return "image/avif";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".gif":
      return "image/gif";
    default:
      return "application/octet-stream";
  }
}

type Ctx = { params: Promise<{ filename: string }> };

export async function GET(_request: Request, context: Ctx) {
  const { filename } = await context.params;
  if (!isSafeUploadFilename(filename)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const fullPath = path.join(getPublicUploadDir(), filename);
  try {
    const fileStat = await stat(fullPath);
    if (!fileStat.isFile()) {
      return new NextResponse("Not found", { status: 404 });
    }
    const body = await readFile(fullPath);
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentTypeFor(filename),
        "Content-Length": String(body.byteLength),
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
