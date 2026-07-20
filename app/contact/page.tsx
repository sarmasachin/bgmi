import type { Metadata } from "next";
import { ContactForm } from "@/src/components/ContactForm";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import { buildSocialMetadata } from "@/src/lib/socialMeta";

const SUPPORT_EMAIL = "support@sensitivitysettings.com";

const title = "Contact";
const description =
  "Contact Sensitivity Settings for support or feedback about the BGMI and PUBG Mobile sensitivity calculator.";
const canonical = toCanonicalUrl("/contact");

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical },
  ...buildSocialMetadata({ title, description, url: canonical }),
};

export default function ContactPage() {
  return (
    <main className="page-container contact-page">
      <section className="contact-shell">
        <div className="contact-intro">
          <p className="contact-eyebrow">Support</p>
          <h1 className="contact-title">Contact me</h1>
          <p className="contact-lead">
            Questions, feedback, or help with sensitivity settings — send a message and we&apos;ll reply
            as soon as we can.
          </p>

          <div className="contact-direct">
            <p className="contact-direct-label">Email</p>
            <a className="contact-direct-email" href={`mailto:${SUPPORT_EMAIL}`}>
              {SUPPORT_EMAIL}
            </a>
            <p className="contact-direct-note">Prefer email? Write to us directly at the address above.</p>
          </div>
        </div>

        <div className="contact-panel">
          <h2 className="contact-panel-title">Send a message</h2>
          <p className="contact-panel-lead">Fill the form below. All fields are required.</p>
          <ContactForm />
        </div>
      </section>
    </main>
  );
}
