import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { resetPassword } from "@/src/server/authService";

const schema = z.object({
  token: z.string().min(10),
  newPassword: z.string().min(6),
});

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  const ok = await resetPassword(parsed.data.token, parsed.data.newPassword);
  if (!ok) return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  return NextResponse.json({ ok: true });
}
