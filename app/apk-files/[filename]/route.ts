import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { apkContentType, resolveStoredApkPath } from "@/src/server/media/apkFileUpload";
import { publishedPagePathForApk } from "@/src/server/media/apkPublishedFiles";
import { isOwnSiteReferer } from "@/src/server/adminRequestOrigin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ filename: string }> };

function attachmentName(filename: string) {
  return filename.replace(/["\r\n]/g, "");
}

function fileHeaders(extra: Record<string, string>) {
  return {
    "X-Content-Type-Options": "nosniff",
    Vary: "Referer",
    "Cache-Control": "private, no-store",
    ...extra,
  };
}

export async function GET(request: Request, context: Ctx) {
  const { filename } = await context.params;
  const fullPath = resolveStoredApkPath(filename);
  if (!fullPath) {
    return new NextResponse("Not found", { status: 404 });
  }

  const pagePath = await publishedPagePathForApk(filename);
  if (!pagePath) {
    return new NextResponse("Not found", { status: 404 });
  }

  let size = 0;
  try {
    const fileStat = await stat(fullPath);
    if (!fileStat.isFile()) return new NextResponse("Not found", { status: 404 });
    size = fileStat.size;
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }

  if (!isOwnSiteReferer(request.headers.get("referer"), request.headers.get("host"))) {
    const location = new URL(pagePath, request.url);
    return new NextResponse(null, {
      status: 302,
      headers: {
        Location: location.toString(),
        "Cache-Control": "no-store",
        Vary: "Referer",
      },
    });
  }

  const type = apkContentType(filename);
  const disposition = `attachment; filename="${attachmentName(filename)}"`;
  const range = request.headers.get("range");

  if (range) {
    const match = /^bytes=(\d+)-(\d*)$/.exec(range.trim());
    if (!match) {
      return new NextResponse(null, {
        status: 416,
        headers: { "Content-Range": `bytes */${size}` },
      });
    }
    const start = Number(match[1]);
    const end = match[2] ? Number(match[2]) : size - 1;
    if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end >= size || start > end) {
      return new NextResponse(null, {
        status: 416,
        headers: { "Content-Range": `bytes */${size}` },
      });
    }
    const stream = Readable.toWeb(createReadStream(fullPath, { start, end })) as ReadableStream;
    return new NextResponse(stream, {
      status: 206,
      headers: fileHeaders({
        "Content-Type": type,
        "Content-Length": String(end - start + 1),
        "Content-Range": `bytes ${start}-${end}/${size}`,
        "Accept-Ranges": "bytes",
        "Content-Disposition": disposition,
      }),
    });
  }

  const stream = Readable.toWeb(createReadStream(fullPath)) as ReadableStream;
  return new NextResponse(stream, {
    status: 200,
    headers: fileHeaders({
      "Content-Type": type,
      "Content-Length": String(size),
      "Accept-Ranges": "bytes",
      "Content-Disposition": disposition,
    }),
  });
}
