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

    // Background thank-you — never block the success response.
    void (async () => {
      try {
        const mail = buildEmailSubscribeThankYouEmailHtml({ email });
        const result = await sendEmail(email, mail.subject, mail.html, {
          replyTo: SUPPORT_EMAIL,
        });
        if (!result.sent) {
          console.warn("[subscribe-email] thank-you email not sent:", result.reason);
        }
      } catch (err) {
        console.error("[subscribe-email] thank-you email failed:", err);
      }
    })();

    return NextResponse.json({ ok: true, subscribed: true });
  } catch (error) {
    const unavailable = error instanceof Error && error.message === "DB_UNAVAILABLE";
    return NextResponse.json(
      { error: unavailable ? "Service temporarily unavailable." : "Could not save subscription." },
      { status: unavailable ? 503 : 500 },
    );
  }
}
