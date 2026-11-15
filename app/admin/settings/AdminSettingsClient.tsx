"use client";

import { FormEvent, useEffect, useState } from "react";
import type { AdminSettingsPageData } from "@/src/server/admin/prefetchAdminSettingsPageData";
import { useAdminFlash } from "@/src/components/admin/AdminToast";
import { AdminSettingsExtraPanels } from "./AdminSettingsExtraPanels";
import { AdminSettingsFormFields } from "./AdminSettingsFormFields";
import { DEFAULT_FF_TRUST_BAR } from "@/src/lib/ffTrustBar";
import { defaultSeoSettings } from "@/src/lib/siteSettings";

type LinkItem = { label: string; href: string };

type FaqItem = { id: string; question: string; answer: string };

type TrustItem = { label: string; sublabel: string };

type Props = {
  initialData?: AdminSettingsPageData;
};

function keywordsToText(list: string[]): string {
  return list.join("\n");
}

function textToKeywords(raw: string): string[] {
  return raw
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function AdminSettingsClient({ initialData }: Props) {
  /** False until /api/admin/settings + head-snippets load — avoids showing default useState text then swapping. */
  const [settingsReady, setSettingsReady] = useState(!!initialData);
  const setMessage = useAdminFlash();
  const [phoneModelsText, setPhoneModelsText] = useState(initialData?.phoneModelsText ?? "");
  const setPhoneModelsMessage = useAdminFlash();
  const [headerSiteTitle, setHeaderSiteTitle] = useState(
    initialData?.headerSiteTitle ?? "Sensitivity Settings",
  );
  const [homeHeroTitle, setHomeHeroTitle] = useState(
    initialData?.homeHeroTitle ?? "BGMI Sensitivity Settings calculator",
  );
  const [siteTitle, setSiteTitle] = useState(
    initialData?.siteTitle ?? defaultSeoSettings.siteTitle,
  );
  const [defaultTitle, setDefaultTitle] = useState(
    initialData?.defaultTitle ?? defaultSeoSettings.defaultTitle,
  );
  const [titleTemplate, setTitleTemplate] = useState(
    initialData?.titleTemplate ?? defaultSeoSettings.titleTemplate,
  );
  const [metaDescription, setMetaDescription] = useState(
    initialData?.metaDescription ?? defaultSeoSettings.metaDescription,
  );
  const [keywordsText, setKeywordsText] = useState(
    keywordsToText(initialData?.keywords ?? defaultSeoSettings.keywords),
  );
  const [googleVerification, setGoogleVerification] = useState(initialData?.googleVerification ?? "");
  const [analyticsScript, setAnalyticsScript] = useState(initialData?.analyticsScript ?? "");
  const [adsenseScript, setAdsenseScript] = useState(initialData?.adsenseScript ?? "");
  const [cdnBaseUrl, setCdnBaseUrl] = useState(initialData?.cdnBaseUrl ?? "");
  const [smtpHost, setSmtpHost] = useState(initialData?.smtpHost ?? "");
  const [showShareRail, setShowShareRail] = useState(initialData?.showShareRail ?? true);
  const [showDiwaliDiyas, setShowDiwaliDiyas] = useState(initialData?.showDiwaliDiyas ?? false);
  const [footerCopyright, setFooterCopyright] = useState(
    initialData?.footerCopyright ?? "© 2026 Sensitivity Settings. All rights reserved.",
  );
  const [footerBrandTitle, setFooterBrandTitle] = useState(
    initialData?.footerBrandTitle ?? "Sensitivity Settings",
  );
  const [footerTagline, setFooterTagline] = useState(
    initialData?.footerTagline ??
      "Free Fire, BGMI & PUBG Mobile sensitivity calculator for better aim.",
  );
  const [navigationLinks, setNavigationLinks] = useState<LinkItem[]>(
    initialData?.navigationLinks ?? [
      { label: "Home", href: "/" },
      { label: "FF Max", href: "/free-fire-max-sensitivity-settings-calculator" },
      { label: "Advance Server", href: "/free-fire-advance-server" },
      { label: "BGMI", href: "/bgmi" },
      { label: "PUBG Mobile", href: "/pubg" },
    ],
  );
  const [footerLinks, setFooterLinks] = useState<LinkItem[]>(
    initialData?.footerLinks ?? [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Disclaimer", href: "/disclaimer" },
      { label: "Contact", href: "/contact" },
      { label: "News", href: "/news" },
      { label: "Sitemap", href: "/sitemap.xml" },
    ],
  );
  const [faqItems, setFaqItems] = useState<FaqItem[]>(initialData?.faqItems ?? []);
  const setFaqMessage = useAdminFlash();
  const [ffTrustBar, setFfTrustBar] = useState<TrustItem[]>(
    initialData?.ffTrustBar ?? DEFAULT_FF_TRUST_BAR.map((row) => ({ ...row })),
  );

  useEffect(() => {
    if (initialData !== undefined) return;
    const opts = { cache: "no-store" as const, credentials: "include" as const };
    Promise.all([
      fetch("/api/admin/settings", opts),
      fetch("/api/admin/head-snippets", opts),
      fetch("/api/admin/calculator-phone-models", opts),
      fetch("/api/admin/faq", opts),
    ])
      .then(async ([settingsRes, snippetsRes, phoneModelsRes, faqRes]) => {
        if (faqRes.ok) {
          setFaqMessage("");
          const faq = (await faqRes.json()) as {
            effectiveItems?: FaqItem[];
            storedItems?: FaqItem[] | null;
          };
          const rawList =
            faq.storedItems !== null && faq.storedItems !== undefined
              ? faq.storedItems
              : faq.effectiveItems;
          if (Array.isArray(rawList)) {
            setFaqItems(
              rawList.map((row, i) => ({
                id: row.id?.trim() || `faq-load-${i}`,
                question: row.question ?? "",
                answer: row.answer ?? "",
              })),
            );
          }
        } else {
          setFaqMessage("Could not load home FAQ.");
        }
        if (!settingsRes.ok || !snippetsRes.ok) {
          setMessage("Could not load settings.");
          return;
        }
        setMessage("");
        const settings = await settingsRes.json();
        const snippets = await snippetsRes.json();
        if (phoneModelsRes.ok) {
          const phone = (await phoneModelsRes.json()) as {
            effectiveModels?: string[];
            storedModels?: string[] | null;
          };
          // null = using built-in defaults; keep textarea empty (do not paste defaults back in).
          if (phone.storedModels === null || phone.storedModels === undefined) {
            setPhoneModelsText("");
          } else if (Array.isArray(phone.storedModels)) {
            setPhoneModelsText(phone.storedModels.join(", "));
          }
        } else {
          setPhoneModelsMessage("Could not load calculator phone names.");
        }
        if (settings?.homeDisplay && typeof settings.homeDisplay === "object") {
          const hd = settings.homeDisplay as { headerTitle?: string; heroTitle?: string };
          if (typeof hd.headerTitle === "string" && hd.headerTitle.trim()) {
            setHeaderSiteTitle(hd.headerTitle);
          }
          if (typeof hd.heroTitle === "string" && hd.heroTitle.trim()) {
            setHomeHeroTitle(hd.heroTitle);
          }
        }
        if (settings?.seo?.titleTemplate) setTitleTemplate(settings.seo.titleTemplate);
        if (typeof settings?.seo?.siteTitle === "string" && settings.seo.siteTitle.trim()) {
          setSiteTitle(settings.seo.siteTitle.trim());
        }
        if (typeof settings?.seo?.defaultTitle === "string" && settings.seo.defaultTitle.trim()) {
          setDefaultTitle(settings.seo.defaultTitle.trim());
        }
        if (
          typeof settings?.seo?.metaDescription === "string" &&
          settings.seo.metaDescription.trim()
        ) {
          setMetaDescription(settings.seo.metaDescription.trim());
        }
        if (Array.isArray(settings?.seo?.keywords)) {
          const list = settings.seo.keywords
            .map((item: unknown) => (typeof item === "string" ? item.trim() : ""))
            .filter(Boolean);
          if (list.length) setKeywordsText(keywordsToText(list));
        }
        if (settings?.integrations?.cdn?.baseUrl) setCdnBaseUrl(settings.integrations.cdn.baseUrl);
        if (settings?.integrations?.smtp?.host) setSmtpHost(settings.integrations.smtp.host);
        setShowShareRail(settings?.integrations?.showShareRail !== false);
        setShowDiwaliDiyas(settings?.integrations?.showDiwaliDiyas === true);
        if (Array.isArray(settings?.navigation)) setNavigationLinks(settings.navigation);
        if (Array.isArray(settings?.footerLinks)) setFooterLinks(settings.footerLinks);
        if (typeof settings?.footerCopyright === "string" && settings.footerCopyright.trim()) {
          setFooterCopyright(settings.footerCopyright);
        }
        if (settings?.footerBranding && typeof settings.footerBranding === "object") {
          const fb = settings.footerBranding as { brandTitle?: string; tagline?: string };
          if (typeof fb.brandTitle === "string" && fb.brandTitle.trim()) {
            setFooterBrandTitle(fb.brandTitle);
          }
          if (typeof fb.tagline === "string" && fb.tagline.trim()) {
            setFooterTagline(fb.tagline);
          }
        }
        if (Array.isArray(settings?.ffTrustBar)) {
          setFfTrustBar(
            DEFAULT_FF_TRUST_BAR.map((fallback, index) => {
              const row = settings.ffTrustBar[index] as TrustItem | undefined;
              return {
                label: row?.label?.trim() || fallback.label,
                sublabel: row?.sublabel?.trim() || fallback.sublabel,
              };
            }),
          );
        }
        if (snippets?.googleVerificationMeta) setGoogleVerification(snippets.googleVerificationMeta);
        if (snippets?.analyticsScript) setAnalyticsScript(snippets.analyticsScript);
        if (snippets?.adsenseScript) setAdsenseScript(snippets.adsenseScript);
      })
      .catch(() => setMessage("Could not load settings."))
      .finally(() => setSettingsReady(true));
  }, [initialData]);

  async function saveSettings(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    const navigation = navigationLinks
      .map((item) => ({ label: item.label.trim(), href: item.href.trim() }))
      .filter((item) => item.label && item.href);
    const footer = footerLinks
      .map((item) => ({ label: item.label.trim(), href: item.href.trim() }))
      .filter((item) => item.label && item.href);

    if (!navigation.length || !footer.length) {
      setMessage("Navigation/Footer links required.");
      return;
    }

    try {
      const settingsRes = await fetch("/api/admin/settings", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seo: {
            siteTitle: siteTitle.trim() || defaultSeoSettings.siteTitle,
            defaultTitle: defaultTitle.trim() || defaultSeoSettings.defaultTitle,
            titleTemplate: titleTemplate.trim() || defaultSeoSettings.titleTemplate,
            metaDescription: metaDescription.trim() || defaultSeoSettings.metaDescription,
            keywords: textToKeywords(keywordsText),
            ogImage: defaultSeoSettings.ogImage,
            twitterCard: defaultSeoSettings.twitterCard,
          },
          integrations: {
            smtp: { host: smtpHost, user: "" },
            pushKeys: { publicKey: "" },
            cdn: { provider: "supabase", baseUrl: cdnBaseUrl },
            showShareRail,
            showDiwaliDiyas,
          },
          navigation,
          footerLinks: footer,
          footerCopyright: footerCopyright.trim() || undefined,
          footerBranding: {
            brandTitle: footerBrandTitle.trim(),
            tagline: footerTagline.trim(),
          },
          homeDisplay: {
            headerTitle: headerSiteTitle.trim(),
            heroTitle: homeHeroTitle.trim(),
          },
          ffTrustBar: ffTrustBar.map((row) => ({
            label: row.label.trim(),
            sublabel: row.sublabel.trim(),
          })),
        }),
      });
      const snippetRes = await fetch("/api/admin/head-snippets", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googleVerificationMeta: googleVerification,
          analyticsScript,
          adsenseScript,
        }),
      });

      let failText = "";
      if (!settingsRes.ok) {
        const j = (await settingsRes.json().catch(() => ({}))) as { error?: string };
        failText = j.error?.trim() || `Settings save failed (${settingsRes.status}).`;
      }
      if (!snippetRes.ok) {
        const j = (await snippetRes.json().catch(() => ({}))) as { error?: string };
        failText = failText || j.error?.trim() || `Head snippets save failed (${snippetRes.status}).`;
      }
      setMessage(settingsRes.ok && snippetRes.ok ? "Settings saved." : failText || "Failed to save settings.");
    } catch {
      setMessage("Network error. Please retry.");
    }
  }




  return (
    <section className="admin-section">
      <h1>Website Settings</h1>
      {!settingsReady ? (
        <p className="admin-ratings-message">Loading settings…</p>
      ) : (
        <>
          <AdminSettingsFormFields
            headerSiteTitle={headerSiteTitle}
            setHeaderSiteTitle={setHeaderSiteTitle}
            homeHeroTitle={homeHeroTitle}
            setHomeHeroTitle={setHomeHeroTitle}
            ffTrustBar={ffTrustBar}
            setFfTrustBar={setFfTrustBar}
            siteTitle={siteTitle}
            setSiteTitle={setSiteTitle}
            defaultTitle={defaultTitle}
            setDefaultTitle={setDefaultTitle}
            metaDescription={metaDescription}
            setMetaDescription={setMetaDescription}
            keywordsText={keywordsText}
            setKeywordsText={setKeywordsText}
            titleTemplate={titleTemplate}
            setTitleTemplate={setTitleTemplate}
            googleVerification={googleVerification}
            setGoogleVerification={setGoogleVerification}
            analyticsScript={analyticsScript}
            setAnalyticsScript={setAnalyticsScript}
            adsenseScript={adsenseScript}
            setAdsenseScript={setAdsenseScript}
            cdnBaseUrl={cdnBaseUrl}
            setCdnBaseUrl={setCdnBaseUrl}
            smtpHost={smtpHost}
            setSmtpHost={setSmtpHost}
            showShareRail={showShareRail}
            setShowShareRail={setShowShareRail}
            showDiwaliDiyas={showDiwaliDiyas}
            setShowDiwaliDiyas={setShowDiwaliDiyas}
            footerBrandTitle={footerBrandTitle}
            setFooterBrandTitle={setFooterBrandTitle}
            footerTagline={footerTagline}
            setFooterTagline={setFooterTagline}
            navigationLinks={navigationLinks}
            setNavigationLinks={setNavigationLinks}
            footerLinks={footerLinks}
            setFooterLinks={setFooterLinks}
            footerCopyright={footerCopyright}
            setFooterCopyright={setFooterCopyright}
            onSubmit={saveSettings}
          />


      <AdminSettingsExtraPanels
        faqItems={faqItems}
        setFaqItems={setFaqItems}
        phoneModelsText={phoneModelsText}
        setPhoneModelsText={setPhoneModelsText}
      />
        </>
      )}
    </section>
  );
}
