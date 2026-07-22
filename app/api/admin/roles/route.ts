import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addAuditLog } from "@/src/server/repositories/auditRepository";
import {
  createAdminRoleDefinition,
  deleteAdminRoleDefinition,
  ensureSystemRoleDefinitions,
  getAdminRoleDefinitionById,
  listAdminRoleDefinitions,
  updateAdminRoleDefinition,
} from "@/src/server/repositories/adminRolesRepository";
import { requirePermission } from "@/src/server/rbac/requirePermission";
import { ADMIN_PERMISSIONS } from "@/src/server/rbac/permissions";
import { readAdminJsonBody } from "@/src/server/admin/adminApiHelpers";
import { auditActorFromSubject } from "@/src/server/rbac/auditActor";

const permissionSchema = z.enum(ADMIN_PERMISSIONS);

export async function GET(request: NextRequest) {
  const gate = await requirePermission("users.manage");
  if (!gate.ok) return gate.response;

  await ensureSystemRoleDefinitions();
  const id = request.nextUrl.searchParams.get("id")?.trim();
  if (id) {
    const row = await getAdminRoleDefinitionById(id);
    if (!row) return NextResponse.json({ error: "Role not found." }, { status: 404 });
    return NextResponse.json({ data: row });
  }

  const data = await listAdminRoleDefinitions();
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const gate = await requirePermission("users.manage");
  if (!gate.ok) return gate.response;

  const bodyResult = await readAdminJsonBody(request);
  if (!bodyResult.ok) return bodyResult.response;

  const parsed = z
    .object({
      name: z.string().min(2).max(60),
      permissions: z.array(permissionSchema).max(80).optional(),
    })
    .safeParse(bodyResult.data);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid role payload." }, { status: 400 });
  }

  const result = await createAdminRoleDefinition(parsed.data);
  if ("error" in result) {
    if (result.error === "duplicate") {
      return NextResponse.json({ error: "A role with this name already exists." }, { status: 409 });
    }
    if (result.error === "invalid") {
      return NextResponse.json({ error: "Invalid or reserved role name." }, { status: 400 });
    }
    return NextResponse.json(
      {
        error:
          "Could not create role. Database unavailable — check DATABASE_URL or run: npx prisma db push",
      },
      { status: 503 },
    );
  }

  await addAuditLog({
    actor: auditActorFromSubject(gate.subject),
    action: "roles.create",
    target: result.name,
    payload: { id: result.id, permissions: result.permissions },
  });

  return NextResponse.json({ ok: true, data: result }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const gate = await requirePermission("users.manage");
  if (!gate.ok) return gate.response;

  const bodyResult = await readAdminJsonBody(request);
  if (!bodyResult.ok) return bodyResult.response;

  const parsed = z
    .object({
      id: z.string().min(1),
      name: z.string().min(2).max(60).optional(),
      permissions: z.array(permissionSchema).max(80).optional(),
    })
    .safeParse(bodyResult.data);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid role update." }, { status: 400 });
  }

  const result = await updateAdminRoleDefinition(parsed.data);
  if (!result.ok) {
    const status =
      result.code === "notfound" ? 404 : result.code === "duplicate" ? 409 : result.code === "locked" ? 403 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  await addAuditLog({
    actor: auditActorFromSubject(gate.subject),
    action: "roles.update",
    target: result.data.name,
    payload: { id: result.data.id, permissions: result.data.permissions },
  });

  return NextResponse.json({ ok: true, data: result.data });
}

export async function DELETE(request: NextRequest) {
  const gate = await requirePermission("users.manage");
  if (!gate.ok) return gate.response;

  const id = request.nextUrl.searchParams.get("id")?.trim();
  if (!id) return NextResponse.json({ error: "Missing role id." }, { status: 400 });

  const result = await deleteAdminRoleDefinition(id);
  if (!result.ok) {
    const status =
      result.code === "notfound"
        ? 404
        : result.code === "locked" || result.code === "in_use"
          ? 409
          : 503;
    return NextResponse.json({ error: result.error }, { status });
  }

  await addAuditLog({
    actor: auditActorFromSubject(gate.subject),
    action: "roles.delete",
    target: id,
    payload: {},
  });

  return NextResponse.json({ ok: true });
}
