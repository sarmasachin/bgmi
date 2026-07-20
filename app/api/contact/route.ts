import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/src/server/rateLimit";
import { createContactMessage } from "@/src/server/repositories/contactRepository";
import { sendEmail } from "@/src/server/services/emailService";
import {
  buildContactAdminNotifyHtml,
  buildContactThankYouEmailHtml,
} from "@/src/lib/contactEmailTemplates";

const SUPPORT_EMAIL = "support@sensitivitysettings.com";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(200),
  subject: z.string().trim().min(3).max(120),
  message: z.string().trim().min(10).max(4000),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
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

  let saved: { id: string };
  try {
    saved = await createContactMessage({ name, email, subject, message });
  } catch (err) {
    console.error("[contact] db save failed:", err);
    return NextResponse.json({ error: "Could not save message. Please try again." }, { status: 500 });
  }

  // 1) Notify support inbox
  try {
    const adminMail = await sendEmail(
      SUPPORT_EMAIL,
      `[Contact] ${subject}`,
      buildContactAdminNotifyHtml({ name, email, subject, message }),
      { replyTo: email },
    );
    if (!adminMail.sent) {
      console.warn("[contact] saved to DB but support email not sent:", adminMail.reason, saved.id);
    }
  } catch (err) {
    console.error("[contact] saved to DB but support email failed:", err, saved.id);
  }

  // 2) Thank-you confirmation to the user
  try {
    const thanksMail = await sendEmail(
      email,
      "Thanks for contacting Sensitivity Settings",
      buildContactThankYouEmailHtml({ name, subject }),
      { replyTo: SUPPORT_EMAIL },
    );
    if (!thanksMail.sent) {
      console.warn("[contact] thank-you email not sent:", thanksMail.reason, saved.id);
    }
  } catch (err) {
    console.error("[contact] thank-you email failed:", err, saved.id);
  }

  return NextResponse.json({ ok: true, id: saved.id });
}
