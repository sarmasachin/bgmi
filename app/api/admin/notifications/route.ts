import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail } from "@/src/server/services/emailService";
import { logError, logInfo } from "@/src/server/monitoring";
import { readAdminJsonBody } from "@/src/server/admin/adminApiHelpers";
import { enforceAdminApiAccess } from "@/src/server/rbac/enforceAdminApiAccess";

const schema = z.object({
  title: z.string().min(2),
  body: z.string().min(2),
  channel: z.enum(["push", "email"]),
  segment: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  const bodyResult = await readAdminJsonBody(request);
  if (!bodyResult.ok) return bodyResult.response;
  const parsed = schema.safeParse(bodyResult.data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid campaign payload" }, { status: 400 });
  }
  if (parsed.data.channel === "email") {
    try {
      const recipient = process.env.NOTIFICATION_TEST_EMAIL || "subscriber@localhost";
      const result = await sendEmail(
        recipient,
        parsed.data.title,
        `<p>${parsed.data.body}</p>`,
      );
      logInfo("campaign.email.sent", { segment: parsed.data.segment });
      return NextResponse.json({ ok: true, queued: true, email: result });
    } catch (error) {
      logError("campaign.email.failed", error);
      return NextResponse.json({ error: "Email send failed" }, { status: 500 });
    }
  }
  return NextResponse.json({
    ok: true,
    queued: true,
    message: "Campaign queued for segmented delivery.",
  });
}
