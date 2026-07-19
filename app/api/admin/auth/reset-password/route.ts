import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { resetPassword } from "@/src/server/authService";
import { readAdminJsonBody } from "@/src/server/admin/adminApiHelpers";

const schema = z.object({
  token: z.string().min(10),
  newPassword: z.string().min(6),
});

export async function POST(request: NextRequest) {
  const bodyResult = await readAdminJsonBody(request);
  if (!bodyResult.ok) return bodyResult.response;
  const parsed = schema.safeParse(bodyResult.data);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  try {
    const ok = await resetPassword(parsed.data.token, parsed.data.newPassword);
    if (!ok) return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not reset password." }, { status: 500 });
  }
}
