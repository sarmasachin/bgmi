import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/src/server/rateLimit";
import { sendEmail } from "@/src/server/services/emailService";

const SUPPORT_EMAIL = "support@sensitivitysettings.com";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(200),
  subject: z.string().trim().min(3).max(120),
  message: z.string().trim().min(10).max(4000),
});

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

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
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.55;color:#0f172a;">
      <h2 style="margin:0 0 12px;">New contact message</h2>
      <p style="margin:0 0 8px;"><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p style="margin:0 0 8px;"><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p style="margin:0 0 8px;"><strong>Subject:</strong> ${escapeHtml(subject)}</p>
      <p style="margin:16px 0 8px;"><strong>Message:</strong></p>
      <pre style="white-space:pre-wrap;font-family:Arial,Helvetica,sans-serif;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;margin:0;">${escapeHtml(message)}</pre>
    </div>
  `.trim();

  try {
    const result = await sendEmail(
      SUPPORT_EMAIL,
      `[Contact] ${subject}`,
      html,
      { replyTo: email },
    );
    if (!result.sent) {
      if (process.env.NODE_ENV !== "production") {
        console.info("[contact] SMTP not configured. Message accepted for local testing.", {
          name,
          email,
          subject,
        });
        return NextResponse.json({ ok: true });
      }
      return NextResponse.json({ error: "Could not send message right now." }, { status: 503 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] send failed:", err);
    return NextResponse.json({ error: "Could not send message. Please try again." }, { status: 503 });
  }
}
