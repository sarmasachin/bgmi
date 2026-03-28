import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addAuditLog } from "@/src/server/repositories/auditRepository";
import {
  createAdminUser,
  listAdminUsers,
  setAdminUserActive,
  updateAdminUserPassword,
} from "@/src/server/repositories/adminUsersRepository";

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).max(200).optional(),
});

const patchSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("setActive"),
    id: z.string().min(1),
    isActive: z.boolean(),
  }),
  z.object({
    action: z.literal("resetPassword"),
    id: z.string().min(1),
    newPassword: z.string().min(6),
  }),
]);

export async function GET() {
  const data = await listAdminUsers();
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid admin user payload" }, { status: 400 });
  }

  const result = await createAdminUser(parsed.data);
  if ("error" in result) {
    return NextResponse.json({ error: "An admin with this email already exists." }, { status: 409 });
  }

  await addAuditLog({
    actor: "admin",
    action: "users.create",
    target: result.email,
    payload: { email: result.email, name: result.name },
  });

  return NextResponse.json({ ok: true, data: result }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (parsed.data.action === "setActive") {
    const r = await setAdminUserActive(parsed.data.id, parsed.data.isActive);
    if (!r.ok) {
      const status = r.error.includes("last active") ? 409 : 404;
      return NextResponse.json({ error: r.error }, { status });
    }
    await addAuditLog({
      actor: "admin",
      action: parsed.data.isActive ? "users.activate" : "users.deactivate",
      target: parsed.data.id,
      payload: { isActive: parsed.data.isActive },
    });
    return NextResponse.json({ ok: true });
  }

  const ok = await updateAdminUserPassword(parsed.data.id, parsed.data.newPassword);
  if (!ok) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }
  await addAuditLog({
    actor: "admin",
    action: "users.resetPassword",
    target: parsed.data.id,
    payload: {},
  });
  return NextResponse.json({ ok: true });
}
