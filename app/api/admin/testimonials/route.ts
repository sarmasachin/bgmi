import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addAuditLog } from "@/src/server/repositories/auditRepository";
import { enforceAdminApiAccess } from "@/src/server/rbac/enforceAdminApiAccess";
import {
  countApprovedTestimonials,
  deleteTestimonial,
  listAdminTestimonials,
  MAX_APPROVED_TESTIMONIALS,
  setTestimonialStatus,
  type TestimonialStatus,
} from "@/src/server/repositories/testimonialsRepository";

/** Admin: list testimonials (optional ?status=pending|approved|rejected). */
export async function GET(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  const statusParam = request.nextUrl.searchParams.get("status");
  let status: TestimonialStatus | undefined;
  if (
    statusParam === "pending" ||
    statusParam === "approved" ||
    statusParam === "rejected"
  ) {
    status = statusParam;
  } else if (statusParam) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const [data, approvedCount] = await Promise.all([
    listAdminTestimonials({ status }),
    countApprovedTestimonials(),
  ]);

  return NextResponse.json({
    data,
    approvedCount: approvedCount ?? 0,
    maxApproved: MAX_APPROVED_TESTIMONIALS,
  });
}

/** Admin: approve or reject. Approve triggers FIFO trim to max 20. */
export async function PATCH(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = z
    .object({
      id: z.string().min(1),
      status: z.enum(["pending", "approved", "rejected"]),
    })
    .safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid moderation payload" }, { status: 400 });
  }

  const result = await setTestimonialStatus(parsed.data.id, parsed.data.status);
  if (!result.ok) {
    if (result.error === "unavailable") {
      return NextResponse.json(
        { error: "Database busy or unavailable. Please retry in a moment." },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await addAuditLog({
    actor: "admin",
    action: "testimonial.moderate",
    target: parsed.data.id,
    payload: {
      status: parsed.data.status,
      trimmed: result.trimmed,
      name: result.item?.name,
      game: result.item?.game,
    },
  });

  const approvedCount = await countApprovedTestimonials();

  return NextResponse.json({
    ok: true,
    data: result.item,
    trimmed: result.trimmed,
    approvedCount: approvedCount ?? 0,
    maxApproved: MAX_APPROVED_TESTIMONIALS,
  });
}

/** Admin: hard-delete a testimonial by id. */
export async function DELETE(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  const id = request.nextUrl.searchParams.get("id");
  if (!id?.trim()) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const ok = await deleteTestimonial(id.trim());
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await addAuditLog({
    actor: "admin",
    action: "testimonial.delete",
    target: id.trim(),
  });

  const approvedCount = await countApprovedTestimonials();

  return NextResponse.json({
    ok: true,
    approvedCount: approvedCount ?? 0,
    maxApproved: MAX_APPROVED_TESTIMONIALS,
  });
}
