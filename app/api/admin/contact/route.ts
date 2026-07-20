import {
  deleteContactMessage,
  getContactMessageById,
  listContactMessages,
  updateContactMessageStatus,
  type ContactEtaHours,
  type ContactStatus,
} from "@/src/server/repositories/contactRepository";
import { addAuditLog } from "@/src/server/repositories/auditRepository";
import { readAdminJsonBody } from "@/src/server/admin/adminApiHelpers";
import { sendEmail } from "@/src/server/services/emailService";
import {
  buildReportInProgressEmailHtml,
  buildReportSolvedEmailHtml,
  resolveContactTopic,
} from "@/src/lib/contactEmailTemplates";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const SUPPORT_EMAIL = "support@sensitivitysettings.com";

const statusSchema = z.enum(["new", "read", "archived", "in_progress", "solved"]);

export async function GET() {
  const data = await listContactMessages();
  return NextResponse.json({ data });
}

export async function PATCH(request: NextRequest) {
  const bodyResult = await readAdminJsonBody(request);
  if (!bodyResult.ok) return bodyResult.response;
  const parsed = z
    .object({
      id: z.string().min(1),
      status: statusSchema,
      etaHours: z.union([z.literal(24), z.literal(48)]).optional(),
    })
    .safeParse(bodyResult.data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update payload" }, { status: 400 });
  }

  const { id, status } = parsed.data;
  if (status === "in_progress" && !parsed.data.etaHours) {
    return NextResponse.json(
      { error: "Select 24 or 48 hours when marking In Progress." },
      { status: 400 },
    );
  }

  try {
    const existing = await getContactMessageById(id);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const etaHours = (parsed.data.etaHours ?? null) as ContactEtaHours | null;
    const item = await updateContactMessageStatus(id, status as ContactStatus, {
      etaHours: status === "in_progress" ? etaHours : null,
    });
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const topic = resolveContactTopic({
      topic: "topic" in existing ? String(existing.topic ?? "") : "",
      subject: existing.subject,
    });
    const shouldNotify =
      topic === "report" && (status === "in_progress" || status === "solved");

    let emailSent = false;
    let emailReason: string | undefined;

    if (shouldNotify) {
      try {
        if (status === "in_progress" && etaHours) {
          const mail = buildReportInProgressEmailHtml({
            name: existing.name,
            subject: existing.subject,
            etaHours,
          });
          const result = await sendEmail(existing.email, mail.subject, mail.html, {
            replyTo: SUPPORT_EMAIL,
          });
          emailSent = result.sent;
          emailReason = result.reason;
        } else if (status === "solved") {
          const mail = buildReportSolvedEmailHtml({
            name: existing.name,
            subject: existing.subject,
          });
          const result = await sendEmail(existing.email, mail.subject, mail.html, {
            replyTo: SUPPORT_EMAIL,
          });
          emailSent = result.sent;
          emailReason = result.reason;
        }
      } catch (err) {
        console.error("[admin/contact] status email failed:", err, id);
        emailReason = "email_failed";
      }
    }

    await addAuditLog({
      actor: "admin",
      action: "contact.status",
      target: id,
      payload: { status, etaHours: etaHours ?? undefined, emailSent, emailReason },
    });

    return NextResponse.json({
      ok: true,
      data: item,
      emailSent,
      ...(emailReason && !emailSent ? { emailWarning: emailReason } : {}),
    });
  } catch {
    return NextResponse.json({ error: "Could not update message." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const ok = await deleteContactMessage(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await addAuditLog({
    actor: "admin",
    action: "contact.delete",
    target: id,
  });
  return NextResponse.json({ ok: true });
}
