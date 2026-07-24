import { NextResponse, NextRequest } from "next/server";
import { addAuditLog } from "@/src/server/repositories/auditRepository";
import { saveUploadedImage } from "@/src/server/media/localImageUpload";
import { enforceAdminApiAccess } from "@/src/server/rbac/enforceAdminApiAccess";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Image file is required." }, { status: 400 });
  }

  try {
    const { filename, url } = await saveUploadedImage(file);
    await addAuditLog({
      actor: "admin",
      action: "media.upload",
      target: filename,
      payload: { url },
    });
    return NextResponse.json({ ok: true, url, filename });
  } catch (e) {
    if (e instanceof Error && e.message === "INVALID_TYPE") {
      return NextResponse.json({ error: "Only jpg, png, webp, avif are allowed." }, { status: 400 });
    }
    if (e instanceof Error && e.message === "TOO_LARGE") {
      return NextResponse.json({ error: "Image must be 8MB or smaller." }, { status: 400 });
    }
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
