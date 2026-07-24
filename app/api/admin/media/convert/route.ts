import { NextResponse, NextRequest } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { addAuditLog } from "@/src/server/repositories/auditRepository";
import { enforceAdminApiAccess } from "@/src/server/rbac/enforceAdminApiAccess";
import {
  detectImageMime,
  getPublicUploadDir,
  MAX_UPLOAD_BYTES,
  sanitizeBaseName,
} from "@/src/server/media/localImageUpload";

export const runtime = "nodejs";

type OutFormat = "jpg" | "webp" | "avif";

function parseFormats(raw: string | null): OutFormat[] {
  if (!raw?.trim()) return ["webp"];
  const parts = raw.split(",").map((s) => s.trim().toLowerCase());
  const set = new Set<OutFormat>();
  for (const p of parts) {
    if (p === "jpeg" || p === "jpg") set.add("jpg");
    else if (p === "webp") set.add("webp");
    else if (p === "avif") set.add("avif");
  }
  return set.size ? [...set] : ["webp"];
}

export async function POST(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  const formData = await request.formData();
  const file = formData.get("file");
  const widthRaw = formData.get("width");
  const heightRaw = formData.get("height");
  const formatsRaw = formData.get("formats");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Image file is required (multipart field: file)." }, { status: 400 });
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Image must be 8MB or smaller." }, { status: 400 });
  }

  const width = Math.min(Math.max(Number(widthRaw) || 1200, 64), 4096);
  const height = Math.min(Math.max(Number(heightRaw) || 628, 64), 4096);
  const formats = parseFormats(typeof formatsRaw === "string" ? formatsRaw : null);

  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.byteLength > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Image must be 8MB or smaller." }, { status: 400 });
  }

  if (!detectImageMime(buf)) {
    return NextResponse.json({ error: "Only jpg, png, webp, avif are allowed." }, { status: 400 });
  }

  let pipeline: sharp.Sharp;
  try {
    pipeline = sharp(buf).rotate();
  } catch {
    return NextResponse.json({ error: "Could not read image." }, { status: 400 });
  }

  const resized = pipeline.resize(width, height, { fit: "cover", position: "centre" });

  const uploadDir = getPublicUploadDir();
  await mkdir(uploadDir, { recursive: true });

  const base = sanitizeBaseName(file.name);
  const stamp = Date.now();
  const outputs: { format: string; filename: string; url: string }[] = [];

  try {
    for (const fmt of formats) {
      let ext: string;
      let outBuf: Buffer;
      if (fmt === "jpg") {
        ext = "jpg";
        outBuf = await resized.clone().jpeg({ quality: 88, mozjpeg: true }).toBuffer();
      } else if (fmt === "webp") {
        ext = "webp";
        outBuf = await resized.clone().webp({ quality: 85 }).toBuffer();
      } else {
        ext = "avif";
        outBuf = await resized.clone().avif({ quality: 70 }).toBuffer();
      }

      const filename = `${base}-${width}x${height}-${stamp}.${ext}`;
      await writeFile(path.join(uploadDir, filename), outBuf);
      outputs.push({ format: ext, filename, url: `/uploads/${filename}` });
    }
  } catch {
    return NextResponse.json({ error: "Conversion failed." }, { status: 500 });
  }

  await addAuditLog({
    actor: "admin",
    action: "media.convert",
    target: outputs.map((o) => o.filename).join(","),
    payload: { width, height, formats },
  });

  return NextResponse.json({
    ok: true,
    outputSize: `${width}x${height}`,
    outputs,
  });
}
