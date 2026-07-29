import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { buildEmailSubscribeThankYouEmailHtml } from "@/src/lib/contactEmailTemplates";
import { checkRateLimit } from "@/src/server/rateLimit";
import { getRequestIp } from "@/src/server/requestIp";
import { upsertEmailSubscriber } from "@/src/server/repositories/emailSubscribersRepository";
import { sendEmail } from "@/src/server/services/emailService";

const SUPPORT_EMAIL = "support@sensitivitysettings.com";

const schema = z.object({
  email: z.string().email(),
  tags: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  const ip = getRequestIp(request);
  const rl = checkRateLimit(`subscribe-email:${ip}`, 10, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();

  try {
    await upsertEmailSubscriber({
      email,
      tags: parsed.data.tags,
      reactivate: true,
    });

    // Await send so PM2/Node does not drop the mail after the response is returned.
    let emailSent = false;
    let emailError: string | undefined;
    try {
      const mail = buildEmailSubscribeThankYouEmailHtml({ email });
      const result = await sendEmail(email, mail.subject, mail.html, {
        replyTo: SUPPORT_EMAIL,
      });
      emailSent = result.sent === true;
      if (!result.sent) {
        emailError = result.reason || "not sent";
        console.warn("[subscribe-email] thank-you email not sent:", result.reason);
      }
    } catch (err) {
      emailError = err instanceof Error ? err.message : "send failed";
      console.error("[subscribe-email] thank-you email failed:", err);
    }

    return NextResponse.json({
      ok: true,
      subscribed: true,
      emailSent,
      ...(emailError ? { emailError } : {}),
    });
  } catch (error) {
    const unavailable = error instanceof Error && error.message === "DB_UNAVAILABLE";
    return NextResponse.json(
      { error: unavailable ? "Service temporarily unavailable." : "Could not save subscription." },
      { status: unavailable ? 503 : 500 },
    );
  }
}
