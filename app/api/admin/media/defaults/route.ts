import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addAuditLog } from "@/src/server/repositories/auditRepository";
import {
  getMediaImageOutputPreference,
  saveMediaImageOutputPreference,
  type MediaImageOutputPreference,
} from "@/src/server/repositories/mediaImageSettingsRepository";

export const runtime = "nodejs";

const schema = z.object({
  webp: z.boolean(),
  avif: z.boolean(),
  jpeg: z.boolean(),
});

export async function GET() {
  const pref = await getMediaImageOutputPreference();
  return NextResponse.json({ data: pref });
}

export async function PUT(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const pref: MediaImageOutputPreference = {
    webp: parsed.data.webp,
    avif: parsed.data.avif,
    jpeg: parsed.data.jpeg,
  };

  await saveMediaImageOutputPreference(pref);
  await addAuditLog({
    actor: "admin",
    action: "media.defaults",
    target: "image-output",
    payload: pref,
  });

  return NextResponse.json({ ok: true, data: pref });
}
