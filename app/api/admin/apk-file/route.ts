import { NextResponse, type NextRequest } from "next/server";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import { isAdminMutationOriginAllowed } from "@/src/server/adminRequestOrigin";
import { addAuditLog } from "@/src/server/repositories/auditRepository";
import { MAX_APK_UPLOAD_BYTES, saveUploadedApk } from "@/src/server/media/apkFileUpload";
import { assertApkStoreWithinQuota, pruneUnreferencedApkFiles } from "@/src/server/media/apkPublishedFiles";
import { enforceAdminApiAccess } from "@/src/server/rbac/enforceAdminApiAccess";
import { auditActorFromSubject } from "@/src/server/rbac/auditActor";
import { checkRateLimit } from "@/src/server/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const MULTIPART_OVERHEAD_BYTES = 1024 * 1024;
const APK_UPLOAD_WINDOW_MS = 10 * 60 * 1000;
const DEFAULT_APK_UPLOADS_PER_WINDOW = 8;

function apkUploadRateLimit(): number {
  const raw = Number(process.env.APK_UPLOAD_RATE_LIMIT);
  if (Number.isFinite(raw) && raw >= 1 && raw <= 100) return Math.floor(raw);
  return DEFAULT_APK_UPLOADS_PER_WINDOW;
}

export async function POST(request: NextRequest) {
  if (!isAdminMutationOriginAllowed(request)) {
    return NextResponse.json({ error: "Forbidden origin." }, { status: 403 });
  }

  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;

  const rate = checkRateLimit(
    `apk-upload:${gate.subject.userId}`,
    apkUploadRateLimit(),
    APK_UPLOAD_WINDOW_MS,
  );
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Too many uploads. Wait a few minutes and try again." },
      { status: 429 },
    );
  }

  const contentLength = Number(request.headers.get("content-length") || "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_APK_UPLOAD_BYTES + MULTIPART_OVERHEAD_BYTES) {
    return NextResponse.json({ error: "File must be 1GB or smaller." }, { status: 413 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Upload failed. File must be 1GB or smaller." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose an APK file." }, { status: 400 });
  }

  try {
    const saved = await saveUploadedApk(file);
    await pruneUnreferencedApkFiles([saved.filename]);
    await assertApkStoreWithinQuota(saved.filename);
    const url = toCanonicalUrl(`/apk-files/${saved.filename}`);
    await addAuditLog({
      actor: auditActorFromSubject(gate.subject),
      action: "apk-file.upload",
      target: saved.filename,
      payload: { url, size: saved.size },
    });
    return NextResponse.json({ ok: true, url, filename: saved.filename, size: saved.size });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "TOO_LARGE") {
      return NextResponse.json({ error: "File must be 1GB or smaller." }, { status: 413 });
    }
    if (code === "QUOTA") {
      return NextResponse.json(
        { error: "Storage is full. Remove an old APK and save, then try again." },
        { status: 413 },
      );
    }
    if (code === "INVALID_TYPE") {
      return NextResponse.json(
        { error: "Only .apk, .xapk, .apks, and .zip files are allowed." },
        { status: 400 },
      );
    }
    if (code === "EMPTY") {
      return NextResponse.json({ error: "Choose an APK file." }, { status: 400 });
    }
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
