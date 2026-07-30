import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactForm } from "@/src/components/ContactForm";
import { HomeHeader } from "@/src/components/HomeHeader";
import { SiteFooter } from "@/src/components/SiteFooter";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import { buildSocialMetadata } from "@/src/lib/socialMeta";
import { getContactSeo } from "@/src/server/repositories/listingSeoRepository";
import { getSettings } from "@/src/server/repositories/settingsRepository";

const SUPPORT_EMAIL = "support@sensitivitysettings.com";
const canonical = toCanonicalUrl("/contact");

function ContactNotice({ variant }: { variant: "desktop" | "mobile" }) {
  const cta =
    variant === "mobile"
      ? "please contact us using the form above or the email on this page."
      : "please contact us using the form or email below.";

  return (
    <div className={`contact-notice contact-notice--${variant}`} role="note">
      <p className="contact-notice-title">Please note</p>
      <p className="contact-notice-text">
        Sensitivity Settings is a fan-made website and is not a Garena, Free Fire, PUBG
        Mobile, or BGMI service. We cannot help with game accounts, top-ups, bans, or
        publisher support.
      </p>
      <p className="contact-notice-text">
        For anything related to <strong>this website</strong> — the calculator, pages, content, or
        technical issues — {cta}
      </p>
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getContactSeo();
  const title = seo.general.title;
  const description = seo.general.description;
  return {
    title,
    description,
    alternates: { canonical },
    ...buildSocialMetadata({
      title,
      description,
      url: canonical,
    }),
  };
}

export default async function ContactPage() {
  const settings = await getSettings();

  return (
    <div>
      <HomeHeader siteTitle={settings.homeDisplay.headerTitle} navigation={settings.navigation} />
      <main className="page-container contact-page">
        <section className="contact-shell">
          <div className="contact-intro">
            <p className="contact-eyebrow">Support</p>
            <h1 className="contact-title">Contact us</h1>
            <p className="contact-lead">
              Have a question about this website or our sensitivity calculator tools? Send us a
              message and we&apos;ll get back to you as soon as we can.
            </p>

            <ContactNotice variant="desktop" />

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
            <Suspense fallback={<p className="contact-panel-lead">Loading form…</p>}>
              <ContactForm />
            </Suspense>
            <ContactNotice variant="mobile" />
          </div>
        </section>
      </main>
      <SiteFooter settings={settings} />
    </div>
  );
}
