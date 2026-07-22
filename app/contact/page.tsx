import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactForm } from "@/src/components/ContactForm";
import { HomeHeader } from "@/src/components/HomeHeader";
import { SiteFooter } from "@/src/components/SiteFooter";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import { buildSocialMetadata } from "@/src/lib/socialMeta";
import { getSettings } from "@/src/server/repositories/settingsRepository";

const SUPPORT_EMAIL = "support@sensitivitysettings.com";

type ContactTopic = "report" | "feedback" | "general";

type Props = {
  searchParams: Promise<{ topic?: string }>;
};

function resolveTopic(raw?: string): ContactTopic {
  const topic = raw?.trim().toLowerCase();
  if (topic === "report" || topic === "issue") return "report";
  if (topic === "feedback") return "feedback";
  return "general";
}

function copyForTopic(topic: ContactTopic) {
  if (topic === "report") {
    return {
      title: "Report Issue",
      description:
        "Report an issue with Sensitivity Settings — BGMI and PUBG Mobile sensitivity calculator support.",
      eyebrow: "Support",
      heading: "Report Issue",
      lead: "Found a bug or something not working? Tell us what happened and we'll look into it.",
      canonical: toCanonicalUrl("/contact?topic=report"),
    };
  }
  if (topic === "feedback") {
    return {
      title: "Feedback",
      description:
        "Share feedback about Sensitivity Settings — BGMI and PUBG Mobile sensitivity calculator.",
      eyebrow: "Support",
      heading: "Feedback",
      lead: "Ideas, suggestions, or thoughts on the site — we'd love to hear from you.",
      canonical: toCanonicalUrl("/contact?topic=feedback"),
    };
  }
  return {
    title: "Contact",
    description:
      "Contact Sensitivity Settings for support or feedback about the BGMI and PUBG Mobile sensitivity calculator.",
    eyebrow: "Support",
    heading: "Contact us",
    lead: "Questions, feedback, or help with sensitivity settings — send a message and we'll reply as soon as we can.",
    canonical: toCanonicalUrl("/contact"),
  };
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const copy = copyForTopic(resolveTopic(params.topic));
  return {
    title: copy.title,
    description: copy.description,
    alternates: { canonical: copy.canonical },
    ...buildSocialMetadata({
      title: copy.title,
      description: copy.description,
      url: copy.canonical,
    }),
  };
}

export default async function ContactPage({ searchParams }: Props) {
  const [settings, params] = await Promise.all([getSettings(), searchParams]);
  const copy = copyForTopic(resolveTopic(params.topic));

  return (
    <div>
      <HomeHeader siteTitle={settings.homeDisplay.headerTitle} navigation={settings.navigation} />
      <main className="page-container contact-page">
        <section className="contact-shell">
          <div className="contact-intro">
            <p className="contact-eyebrow">{copy.eyebrow}</p>
            <h1 className="contact-title">{copy.heading}</h1>
            <p className="contact-lead">{copy.lead}</p>

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
          </div>
        </section>
      </main>
      <SiteFooter settings={settings} />
    </div>
  );
}
