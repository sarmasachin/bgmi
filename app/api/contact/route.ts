import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/src/server/rateLimit";
import { getRequestIp } from "@/src/server/requestIp";
import { createContactMessage } from "@/src/server/repositories/contactRepository";
import { sendEmail } from "@/src/server/services/emailService";
import {
  buildContactAdminNotifyHtml,
  buildContactThankYouEmailHtml,
  resolveContactTopic,
} from "@/src/lib/contactEmailTemplates";
import { canEmailSubmitFeedback } from "@/src/server/repositories/ratingSummaryRepository";

const SUPPORT_EMAIL = "support@sensitivitysettings.com";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(200),
  subject: z.string().trim().min(3).max(120),
  message: z.string().trim().min(10).max(4000),
  topic: z.enum(["report", "feedback", "general"]).optional(),
});

export async function POST(request: NextRequest) {
  const ip = getRequestIp(request);
  const rl = checkRateLimit(`contact-form:${ip}`, 8, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many messages. Please try again shortly." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please fill all fields correctly." }, { status: 400 });
  }

  const { name, email, subject, message } = parsed.data;
  const topic = resolveContactTopic({ topic: parsed.data.topic, subject });

  // Same email that rated on home must wait 20 days before feedback — no special UI copy.
  if (topic === "feedback") {
    const allowed = await canEmailSubmitFeedback(email);
    if (!allowed) {
      return NextResponse.json(
        { error: "Unable to submit right now. Please try again later." },
        { status: 429 },
      );
    }
  }

  let saved: { id: string };
  try {
    saved = await createContactMessage({ name, email, subject, message, topic });
  } catch (err) {
    console.error("[contact] db save failed:", err);
    const unavailable =
      err instanceof Error && (err.message === "DB_UNAVAILABLE" || /database|prisma|timeout/i.test(err.message));
    return NextResponse.json(
      {
        error: unavailable
          ? "Service temporarily unavailable. Please try again shortly."
          : "Could not save message. Please try again.",
      },
      { status: unavailable ? 503 : 500 },
    );
  }

  const adminPrefix =
    topic === "report" ? "[Report]" : topic === "feedback" ? "[Feedback]" : "[Contact]";

  // 1) Notify support inbox
  try {
    const adminMail = await sendEmail(
      SUPPORT_EMAIL,
      `${adminPrefix} ${subject}`,
      buildContactAdminNotifyHtml({ name, email, subject, message, topic }),
      { replyTo: email },
    );
    if (!adminMail.sent) {
      console.warn("[contact] saved to DB but support email not sent:", adminMail.reason, saved.id);
    }
  } catch (err) {
    console.error("[contact] saved to DB but support email failed:", err, saved.id);
  }

  // 2) Premium thank-you to the user (report / feedback / general)
  try {
    const thanks = buildContactThankYouEmailHtml({ name, subject, topic });
    const thanksMail = await sendEmail(email, thanks.subject, thanks.html, {
      replyTo: SUPPORT_EMAIL,
    });
    if (!thanksMail.sent) {
      console.warn("[contact] thank-you email not sent:", thanksMail.reason, saved.id);
    }
  } catch (err) {
    console.error("[contact] thank-you email failed:", err, saved.id);
  }

  return NextResponse.json({ ok: true, id: saved.id });
}
