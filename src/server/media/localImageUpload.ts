import { mkdir, readdir, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  getMediaImageOutputPreference,
  resolveUploadFormat,
} from "@/src/server/repositories/mediaImageSettingsRepository";
import { transcodeImageBuffer } from "@/src/server/media/imageEncode";

export const ALLOWED_IMAGE_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

/** Max upload size (bytes) for admin image uploads / convert. */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

const IMAGE_MAGIC: { mime: string; test: (b: Buffer) => boolean }[] = [
  { mime: "image/jpeg", test: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { mime: "image/png", test: (b) => b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  { mime: "image/webp", test: (b) => b.length >= 12 && b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP" },
  { mime: "image/avif", test: (b) => b.length >= 12 && b.toString("ascii", 4, 8) === "ftyp" },
];

export function detectImageMime(buf: Buffer): string | null {
  for (const row of IMAGE_MAGIC) {
    if (row.test(buf)) return row.mime;
  }
  return null;
}

export function getPublicUploadDir() {
  return path.join(process.cwd(), "public", "uploads");
}

export function extFromMime(mime: string) {
  if (mime === "image/jpeg") return ".jpg";
  if (mime === "image/png") return ".png";
  if (mime === "image/webp") return ".webp";
  if (mime === "image/avif") return ".avif";
  return ".bin";
}

export function sanitizeBaseName(name: string) {
  return (
    name
      .toLowerCase()
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-z0-9-_]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "image"
  );
}

/** Safe filename for delete/list (no path segments). */
export function isSafeUploadFilename(name: string) {
  return typeof name === "string" && name.length > 0 && name.length < 200 && /^[a-zA-Z0-9._-]+$/.test(name);
}

export async function saveUploadedImage(file: File): Promise<{ filename: string; url: string }> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("TOO_LARGE");
  }

  const raw = Buffer.from(await file.arrayBuffer());
  if (raw.byteLength > MAX_UPLOAD_BYTES) {
    throw new Error("TOO_LARGE");
  }

  const detected = detectImageMime(raw);
  if (!detected || !ALLOWED_IMAGE_MIME.has(detected)) {
    throw new Error("INVALID_TYPE");
  }
  // Prefer magic-bytes MIME over client-provided file.type.
  const mime = detected;

  const uploadDir = getPublicUploadDir();
  await mkdir(uploadDir, { recursive: true });

  const base = sanitizeBaseName(file.name);

  const pref = await getMediaImageOutputPreference();
  const target = resolveUploadFormat(pref);

  let outBuf: Buffer = raw;
  let ext = extFromMime(mime);

  if (target !== "original") {
    try {
      const encoded = await transcodeImageBuffer(raw, target);
      outBuf = encoded.buffer as Buffer;
      ext = encoded.ext;
    } catch {
      /* broken image or sharp fail — keep original */
      outBuf = raw;
      ext = extFromMime(mime);
    }
  }

  const filename = `${base}-${Date.now()}${ext}`;
  const absolutePath = path.join(uploadDir, filename);
  await writeFile(absolutePath, outBuf);

  return { filename, url: `/uploads/${filename}` };
}

export type ListedUpload = {
  filename: string;
  url: string;
  size: number;
  createdAt: string;
  format: string;
};

export async function listUploadedImages(): Promise<ListedUpload[]> {
  const dir = getPublicUploadDir();
  await mkdir(dir, { recursive: true });
  const names = await readdir(dir);
  const out: ListedUpload[] = [];

  for (const name of names) {
    if (name.startsWith(".")) continue;
    if (!isSafeUploadFilename(name)) continue;
    const full = path.join(dir, name);
    const s = await stat(full);
    if (!s.isFile()) continue;
    out.push({
      filename: name,
      url: `/uploads/${name}`,
      size: s.size,
      createdAt: s.mtime.toISOString(),
      format: path.extname(name).replace(/^\./, "").toLowerCase() || "—",
    });
  }

  out.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return out;
}

export async function removeUploadedImage(filename: string): Promise<boolean> {
  if (!isSafeUploadFilename(filename)) return false;
  const full = path.join(getPublicUploadDir(), filename);
  try {
    await unlink(full);
    return true;
  } catch {
    return false;
  }
}
