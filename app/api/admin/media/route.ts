import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addAuditLog } from "@/src/server/repositories/auditRepository";
import { isSafeUploadFilename, listUploadedImages, removeUploadedImage } from "@/src/server/media/localImageUpload";

export const runtime = "nodejs";

export async function GET() {
  const files = await listUploadedImages();
  return NextResponse.json({ data: files });
}

const deleteSchema = z.object({
  filename: z.string(),
});

export async function DELETE(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success || !isSafeUploadFilename(parsed.data.filename)) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }

  const ok = await removeUploadedImage(parsed.data.filename);
  if (!ok) {
    return NextResponse.json({ error: "Could not delete file" }, { status: 404 });
  }

  await addAuditLog({
    actor: "admin",
    action: "media.delete",
    target: parsed.data.filename,
    payload: {},
  });

  return NextResponse.json({ ok: true });
}
