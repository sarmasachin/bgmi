const SUPPORT_EMAIL = "support@sensitivitysettings.com";
const SITE_URL = "https://sensitivitysettings.com";

export type ContactTopic = "report" | "feedback" | "general";

export function escapeEmailHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function resolveContactTopic(input: {
  topic?: string | null;
  subject?: string | null;
}): ContactTopic {
  const topic = (input.topic ?? "").trim().toLowerCase();
  if (topic === "report" || topic === "issue") return "report";
  if (topic === "feedback") return "feedback";

  const subject = (input.subject ?? "").trim().toLowerCase();
  if (subject.includes("report") || subject.includes("issue")) return "report";
  if (subject.includes("feedback")) return "feedback";
  return "general";
}

function thankYouCopy(topic: ContactTopic, safeName: string, safeSubject: string) {
  if (topic === "report") {
    return {
      title: "Issue report received",
      eyebrow: "Report confirmed",
      lead: `Hi ${safeName}, thanks for reporting this issue. Our team has logged your report and will investigate as soon as possible.`,
      chipLabel: "Reported issue",
      chipValue: safeSubject,
      mailSubject: "We received your issue report — Sensitivity Settings",
      note: "We’ll follow up if we need more details. You can reply to this email anytime.",
    };
  }
  if (topic === "feedback") {
    return {
      title: "Feedback received",
      eyebrow: "Thank you",
      lead: `Hi ${safeName}, thanks for sharing your feedback. Your notes help us improve Sensitivity Settings for everyone.`,
      chipLabel: "Your feedback",
      chipValue: safeSubject,
      mailSubject: "Thanks for your feedback — Sensitivity Settings",
      note: "We read every message. If you’d like to add more thoughts, just reply to this email.",
    };
  }
  return {
    title: `Thank you, ${safeName}`,
    eyebrow: "Message received",
    lead: `Thanks for reaching out. Your message is in our support queue and our team will get back to you as soon as possible.`,
    chipLabel: "Your request",
    chipValue: safeSubject,
    mailSubject: "Thanks for contacting Sensitivity Settings",
    note: "Need to add more details? Reply to this email anytime.",
  };
}

/** Premium thank-you email sent to the user after contact / report / feedback submit. */
export function buildContactThankYouEmailHtml(input: {
  name: string;
  subject: string;
  topic?: ContactTopic | string | null;
}) {
  const topic = resolveContactTopic({ topic: input.topic, subject: input.subject });
  const safeName = escapeEmailHtml(input.name.trim() || "there");
  const safeSubject = escapeEmailHtml(input.subject.trim() || "your message");
  const copy = thankYouCopy(topic, safeName, safeSubject);
  const year = new Date().getFullYear();

  return {
    subject: copy.mailSubject,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>${escapeEmailHtml(copy.title)}</title>
</head>
<body style="margin:0;padding:0;background:#e8edf3;font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#e8edf3;padding:32px 14px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:580px;border-radius:18px;overflow:hidden;border:1px solid #d5dee8;background:#ffffff;">
          <tr>
            <td style="background:#0b1220;padding:0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding:28px 32px 24px;">
                    <p style="margin:0;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#5eead4;font-weight:700;">
                      Sensitivity Settings
                    </p>
                    <p style="margin:10px 0 0;font-size:26px;line-height:1.25;color:#f8fafc;font-weight:800;">
                      ${escapeEmailHtml(copy.title)}
                    </p>
                    <p style="margin:8px 0 0;font-size:14px;line-height:1.5;color:#94a3b8;">
                      ${escapeEmailHtml(copy.eyebrow)}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="height:3px;background:#2dd4bf;font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:32px 32px 8px;background:#ffffff;">
              <p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#475569;">
                ${copy.lead}
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:8px 32px 10px;background:#ffffff;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f0fdfa;border:1px solid #99f6e4;border-radius:14px;">
                <tr>
                  <td style="padding:18px 20px;">
                    <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#0f766e;font-weight:800;">
                      ${escapeEmailHtml(copy.chipLabel)}
                    </p>
                    <p style="margin:0;font-size:16px;line-height:1.45;color:#042f2e;font-weight:700;">
                      ${copy.chipValue}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:18px 32px 10px;background:#ffffff;">
              <p style="margin:0 0 12px;font-size:14px;line-height:1.65;color:#64748b;">
                ${escapeEmailHtml(copy.note)}
                For support, write to
                <a href="mailto:${SUPPORT_EMAIL}" style="color:#0f766e;font-weight:700;text-decoration:none;">${SUPPORT_EMAIL}</a>.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:6px 0 0;">
                <tr>
                  <td align="center" style="background:#0b1220;border-radius:999px;padding:12px 22px;">
                    <a href="${SITE_URL}" style="display:inline-block;font-size:13px;font-weight:800;letter-spacing:0.04em;color:#f8fafc;text-decoration:none;">
                      Visit Sensitivity Settings
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:18px 32px 28px;background:#ffffff;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;">
                <tr>
                  <td style="padding:14px 16px;font-size:13px;line-height:1.55;color:#64748b;">
                    This is an automated confirmation. If you didn’t submit this form, you can ignore this email.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:16px 32px 22px;background:#f8fafc;border-top:1px solid #eef2f7;text-align:center;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:#94a3b8;">
                © ${year} Sensitivity Settings · <a href="${SITE_URL}" style="color:#94a3b8;text-decoration:none;">sensitivitysettings.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim(),
  };
}

export function buildContactAdminNotifyHtml(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
  topic?: ContactTopic | string | null;
}) {
  const topic = resolveContactTopic({ topic: input.topic, subject: input.subject });
  const topicLabel =
    topic === "report" ? "Report Issue" : topic === "feedback" ? "Feedback" : "Contact";

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.55;color:#0f172a;">
      <h2 style="margin:0 0 12px;">New ${escapeEmailHtml(topicLabel)} message</h2>
      <p style="margin:0 0 8px;"><strong>Type:</strong> ${escapeEmailHtml(topicLabel)}</p>
      <p style="margin:0 0 8px;"><strong>Name:</strong> ${escapeEmailHtml(input.name)}</p>
      <p style="margin:0 0 8px;"><strong>Email:</strong> ${escapeEmailHtml(input.email)}</p>
      <p style="margin:0 0 8px;"><strong>Subject:</strong> ${escapeEmailHtml(input.subject)}</p>
      <p style="margin:16px 0 8px;"><strong>Message:</strong></p>
      <pre style="white-space:pre-wrap;font-family:Arial,Helvetica,sans-serif;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;margin:0;">${escapeEmailHtml(input.message)}</pre>
    </div>
  `.trim();
}
