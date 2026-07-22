import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addAuditLog } from "@/src/server/repositories/auditRepository";
import {
  createAdminUser,
  listAdminUsers,
  setAdminUserActive,
  updateAdminUserAccess,
  updateAdminUserPassword,
} from "@/src/server/repositories/adminUsersRepository";
import { requirePermission } from "@/src/server/rbac/requirePermission";
import { ADMIN_PERMISSIONS } from "@/src/server/rbac/permissions";
import { readAdminJsonBody } from "@/src/server/admin/adminApiHelpers";

const permissionSchema = z.enum(ADMIN_PERMISSIONS);

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).max(200).optional(),
  role: z.enum(["superadmin", "subadmin"]).optional(),
  permissions: z.array(permissionSchema).max(80).optional(),
  roleDefinitionId: z.string().min(1).optional(),
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
  z.object({
    action: z.literal("setAccess"),
    id: z.string().min(1),
    role: z.enum(["superadmin", "subadmin"]).optional(),
    permissions: z.array(permissionSchema).max(80).optional(),
    roleDefinitionId: z.string().min(1).optional(),
  }),
]);

export async function GET() {
  const gate = await requirePermission("users.manage");
  if (!gate.ok) return gate.response;

  const data = await listAdminUsers();
  return NextResponse.json({
    data,
    me: {
      id: gate.subject.userId,
      email: gate.subject.email,
      role: gate.subject.role,
      permissions: gate.subject.permissions,
    },
  });
}

export async function POST(request: NextRequest) {
  const gate = await requirePermission("users.manage");
  if (!gate.ok) return gate.response;

  const bodyResult = await readAdminJsonBody(request);
  if (!bodyResult.ok) return bodyResult.response;

  const parsed = createSchema.safeParse(bodyResult.data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid admin user payload" }, { status: 400 });
  }

  const result = await createAdminUser({
    email: parsed.data.email,
    password: parsed.data.password,
    name: parsed.data.name,
    role: parsed.data.role ?? "superadmin",
    permissions: parsed.data.permissions,
    roleDefinitionId: parsed.data.roleDefinitionId,
  });
  if ("error" in result) {
    return NextResponse.json({ error: "An admin with this email already exists." }, { status: 409 });
  }

  await addAuditLog({
    actor: gate.subject.email,
    action: "users.create",
    target: result.email,
    payload: {
      email: result.email,
      name: result.name,
      role: result.role,
      roleDefinitionId: result.roleDefinitionId,
      roleDefinitionName: result.roleDefinitionName,
      permissions: result.role === "subadmin" ? result.permissions : [],
    },
  });

  return NextResponse.json({ ok: true, data: result }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const gate = await requirePermission("users.manage");
  if (!gate.ok) return gate.response;

  const bodyResult = await readAdminJsonBody(request);
  if (!bodyResult.ok) return bodyResult.response;

  const parsed = patchSchema.safeParse(bodyResult.data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (parsed.data.action === "setActive") {
    const r = await setAdminUserActive(parsed.data.id, parsed.data.isActive);
    if (!r.ok) {
      const status =
        r.code === "protected_superadmin" ? 403 : r.code === "last" ? 409 : 404;
      return NextResponse.json({ error: r.error }, { status });
    }
    await addAuditLog({
      actor: gate.subject.email,
      action: parsed.data.isActive ? "users.activate" : "users.deactivate",
      target: parsed.data.id,
      payload: { isActive: parsed.data.isActive },
    });
    return NextResponse.json({ ok: true });
  }

  if (parsed.data.action === "setAccess") {
    if (!parsed.data.roleDefinitionId && !parsed.data.role) {
      return NextResponse.json({ error: "Role is required." }, { status: 400 });
    }
    const r = await updateAdminUserAccess({
      id: parsed.data.id,
      role: parsed.data.role,
      permissions: parsed.data.permissions,
      roleDefinitionId: parsed.data.roleDefinitionId,
      actorUserId: gate.subject.userId,
    });
    if (!r.ok) {
      const status =
        r.code === "protected_superadmin"
          ? 403
          : r.code === "notfound" || r.code === "invalid_role"
            ? 404
            : 409;
      return NextResponse.json({ error: r.error }, { status });
    }
    await addAuditLog({
      actor: gate.subject.email,
      action: "users.setAccess",
      target: r.data.email,
      payload: {
        role: r.data.role,
        roleDefinitionId: r.data.roleDefinitionId,
        roleDefinitionName: r.data.roleDefinitionName,
        permissions: r.data.role === "subadmin" ? r.data.permissions : [],
      },
    });
    return NextResponse.json({ ok: true, data: r.data });
  }

  const pwd = await updateAdminUserPassword(parsed.data.id, parsed.data.newPassword);
  if (!pwd.ok) {
    const status = pwd.code === "protected_superadmin" ? 403 : 404;
    return NextResponse.json({ error: pwd.error }, { status });
  }
  await addAuditLog({
    actor: gate.subject.email,
    action: "users.resetPassword",
    target: parsed.data.id,
    payload: {},
  });
  return NextResponse.json({ ok: true });
}
