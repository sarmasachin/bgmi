import { createWriteStream } from "node:fs";
import { mkdir, unlink } from "node:fs/promises";
import path from "node:path";
import { once } from "node:events";

/** 1GB. Admin APK upload for Free Fire, Free Fire India, and Free Fire Max. */
export const MAX_APK_UPLOAD_BYTES = 1024 * 1024 * 1024;

const ALLOWED_EXT = new Set([".apk", ".xapk", ".apks", ".zip"]);

/** Private folder. Public URLs are served by app/apk-files/[filename]/route.ts after Save. */
export function getApkFileDir() {
  return path.join(process.cwd(), "storage", "apk-files");
}

export function resolveStoredApkPath(filename: string): string | null {
  if (!isSafeApkFilename(filename)) return null;
  const dir = path.resolve(getApkFileDir());
  const full = path.resolve(dir, filename);
  if (!full.startsWith(dir + path.sep)) return null;
  return full;
}

export function isSafeApkFilename(name: string) {
  return (
    typeof name === "string" &&
    name.length > 0 &&
    name.length < 180 &&
    /^[a-z0-9][a-z0-9._-]*\.(apk|xapk|apks|zip)$/i.test(name) &&
    !name.includes("..")
  );
}

function extFromName(name: string) {
  const ext = path.extname(name).toLowerCase();
  return ALLOWED_EXT.has(ext) ? ext : "";
}

function sanitizeBaseName(name: string) {
  return (
    path
      .basename(name)
      .toLowerCase()
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-z0-9-_]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "apk"
  );
}

/** Real zip local-file header only: bytes 50 4B 03 04. */
function isZipHeader(buf: Buffer) {
  return buf.length >= 4 && buf[0] === 0x50 && buf[1] === 0x4b && buf[2] === 0x03 && buf[3] === 0x04;
}

export function apkContentType(filename: string) {
  switch (path.extname(filename).toLowerCase()) {
    case ".apk":
      return "application/vnd.android.package-archive";
    case ".zip":
      return "application/zip";
    default:
      return "application/octet-stream";
  }
}

/** Stream the upload to disk. Rejects over 1GB and non-zip APK packages. */
export async function saveUploadedApk(file: File): Promise<{ filename: string; size: number }> {
  if (file.size <= 0) throw new Error("EMPTY");
  if (file.size > MAX_APK_UPLOAD_BYTES) throw new Error("TOO_LARGE");
  const ext = extFromName(file.name || "");
  if (!ext) throw new Error("INVALID_TYPE");

  const dir = getApkFileDir();
  await mkdir(dir, { recursive: true });
  const filename = `${sanitizeBaseName(file.name)}-${Date.now()}${ext}`;
  const fullPath = path.join(dir, filename);
  const out = createWriteStream(fullPath);
  let streamError: Error | null = null;
  out.on("error", (error) => {
    streamError = error;
  });

  let seen = 0;
  let header = Buffer.alloc(0);
  try {
    const chunkSize = 1024 * 1024;
    for (let offset = 0; offset < file.size; offset += chunkSize) {
      const end = Math.min(file.size, offset + chunkSize);
      const buf = Buffer.from(await file.slice(offset, end).arrayBuffer());
      if (buf.length === 0) break;
      seen += buf.length;
      if (seen > MAX_APK_UPLOAD_BYTES) throw new Error("TOO_LARGE");
      if (header.length < 4) {
        header = Buffer.concat([header, buf.subarray(0, Math.min(buf.length, 4 - header.length))]);
      }
      if (streamError) throw streamError;
      if (!out.write(buf)) await once(out, "drain");
    }
    out.end();
    await once(out, "finish");
    if (streamError) throw streamError;
    if (seen <= 0) throw new Error("EMPTY");
    if (!isZipHeader(header)) throw new Error("INVALID_TYPE");
  } catch (error) {
    out.destroy();
    await unlink(fullPath).catch(() => undefined);
    throw error;
  }

  return { filename, size: seen };
}
