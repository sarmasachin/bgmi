"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  countPhoneNamesInInput,
  dedupePhoneNamesPreserveOrder,
  expandCalculatorPhoneModelStrings,
} from "@/src/lib/calculatorPhoneModelsInput";
import type { AdminSettingsPageData } from "@/src/server/admin/prefetchAdminSettingsPageData";
import { useAdminFlash } from "@/src/components/admin/AdminToast";

type LinkItem = { label: string; href: string };

type FaqItem = { id: string; question: string; answer: string };

type Props = {
  initialData?: AdminSettingsPageData;
};

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
  const [titleTemplate, setTitleTemplate] = useState(
    initialData?.titleTemplate ?? "%s | Sensitivity Settings",
  );
  const [googleVerification, setGoogleVerification] = useState(initialData?.googleVerification ?? "");
  const [analyticsScript, setAnalyticsScript] = useState(initialData?.analyticsScript ?? "");
  const [adsenseScript, setAdsenseScript] = useState(initialData?.adsenseScript ?? "");
  const [cdnBaseUrl, setCdnBaseUrl] = useState(initialData?.cdnBaseUrl ?? "");
  const [smtpHost, setSmtpHost] = useState(initialData?.smtpHost ?? "");
  const [showShareRail, setShowShareRail] = useState(initialData?.showShareRail ?? true);
  const [footerCopyright, setFooterCopyright] = useState(
    initialData?.footerCopyright ?? "© 2026 Sensitivity Settings. All rights reserved.",
  );
  const [footerBrandTitle, setFooterBrandTitle] = useState(
    initialData?.footerBrandTitle ?? "Sensitivity Settings",
  );
  const [footerTagline, setFooterTagline] = useState(
    initialData?.footerTagline ??
      "BGMI & PUBG Mobile sensitivity calculator for better aim.",
  );
  const [navigationLinks, setNavigationLinks] = useState<LinkItem[]>(
    initialData?.navigationLinks ?? [
      { label: "BGMI", href: "/" },
      { label: "PUBG Mobile", href: "/pubg" },
      { label: "Free Fire", href: "/free-fire-sensitivity-settings-calculator" },
      { label: "Free Fire Max", href: "/free-fire-max-sensitivity-settings-calculator" },
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
        if (settings?.integrations?.cdn?.baseUrl) setCdnBaseUrl(settings.integrations.cdn.baseUrl);
        if (settings?.integrations?.smtp?.host) setSmtpHost(settings.integrations.smtp.host);
        setShowShareRail(settings?.integrations?.showShareRail !== false);
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
            titleTemplate,
            metaDefault: "BGMI Sensitivity Tool",
            ogDefault: "/og-default.png",
            twitterCard: "summary_large_image",
          },
          integrations: {
            smtp: { host: smtpHost, user: "" },
            pushKeys: { publicKey: "" },
            cdn: { provider: "supabase", baseUrl: cdnBaseUrl },
            showShareRail,
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

  async function savePhoneModels() {
    const expanded = expandCalculatorPhoneModelStrings([phoneModelsText]);
    const unique = dedupePhoneNamesPreserveOrder(expanded);
    const removedDuplicates = Math.max(0, expanded.length - unique.length);

    // Show cleaned list with commas (same format admin prefers).
    setPhoneModelsText(unique.join(", "));

    try {
      // Send as one text blob — more reliable for 500+ names than a huge JSON array.
      const res = await fetch("/api/admin/calculator-phone-models", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: unique.join(", ") }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
        savedCount?: number;
        removedDuplicates?: number;
        models?: string[];
      };
      if (!res.ok) {
        setPhoneModelsMessage(
          body.error?.trim() ||
            (res.status === 503
              ? "Could not save phone models (database busy). Wait a few seconds and try again."
              : `Save failed (${res.status}).`),
        );
        return;
      }

      const savedModels = Array.isArray(body.models) ? body.models : unique;
      setPhoneModelsText(savedModels.join(", "));

      const removed = body.removedDuplicates ?? removedDuplicates;
      if (savedModels.length === 0) {
        setPhoneModelsMessage(
          "Custom list cleared. Calculator will use built-in default names until you save a new list.",
        );
      } else if (removed > 0) {
        setPhoneModelsMessage(
          `Saved ${body.savedCount ?? savedModels.length} phone name(s). Removed ${removed} duplicate${removed === 1 ? "" : "s"}.`,
        );
      } else {
        setPhoneModelsMessage(`Saved ${body.savedCount ?? savedModels.length} phone name(s).`);
      }
    } catch {
      setPhoneModelsMessage("Network error. Please retry.");
    }
  }

  function newFaqId() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `faq-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  async function saveFaq() {
    setFaqMessage("");
    try {
      const res = await fetch("/api/admin/faq", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: faqItems }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string; savedCount?: number };
      if (!res.ok) {
        setFaqMessage(body.error?.trim() || `Save failed (${res.status}).`);
        return;
      }
      setFaqMessage(`Saved ${body.savedCount ?? 0} FAQ item(s).`);
      const reload = await fetch("/api/admin/faq", { cache: "no-store", credentials: "include" });
      if (reload.ok) {
        const faq = (await reload.json()) as {
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
      }
    } catch {
      setFaqMessage("Network error. Please retry.");
    }
  }

  return (
    <section className="admin-section">
      <h1>Website Settings</h1>
      {!settingsReady ? (
        <p className="admin-ratings-message">Loading settings…</p>
      ) : (
        <>
          <form onSubmit={saveSettings}>
        <div className="form-group">
          <label htmlFor="headerSiteTitle">Home — top bar title</label>
          <input
            id="headerSiteTitle"
            value={headerSiteTitle}
            onChange={(e) => setHeaderSiteTitle(e.target.value)}
            maxLength={120}
            placeholder="Sensitivity Settings"
          />
          <small style={{ display: "block", marginTop: 6, opacity: 0.85 }}>
            Text next to the logo in the header (only on the main home page).
          </small>
        </div>
        <div className="form-group">
          <label htmlFor="homeHeroTitle">Home — large heading above calculator</label>
          <input
            id="homeHeroTitle"
            value={homeHeroTitle}
            onChange={(e) => setHomeHeroTitle(e.target.value)}
            maxLength={120}
            placeholder="Sensitivity Settings"
          />
          <small style={{ display: "block", marginTop: 6, opacity: 0.85 }}>
            Big cyan title above the sensitivity calculator on <code>/</code>. Empty saves as default.
          </small>
        </div>
        <div className="form-group">
          <label htmlFor="seoTitleTemplate">Title Template</label>
          <input
            id="seoTitleTemplate"
            value={titleTemplate}
            onChange={(e) => setTitleTemplate(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="googleVerification">Google Verification Meta</label>
          <input
            id="googleVerification"
            value={googleVerification}
            onChange={(e) => setGoogleVerification(e.target.value)}
            placeholder="google-site-verification=..."
          />
        </div>
        <div className="form-group">
          <label htmlFor="analyticsTag">Analytics Script</label>
          <input
            id="analyticsTag"
            value={analyticsScript}
            onChange={(e) => setAnalyticsScript(e.target.value)}
            placeholder="window.dataLayer..."
          />
        </div>
        <div className="form-group">
          <label htmlFor="adsenseScript">AdSense Script</label>
          <input
            id="adsenseScript"
            value={adsenseScript}
            onChange={(e) => setAdsenseScript(e.target.value)}
            placeholder="(adsbygoogle = ...)"
          />
        </div>
        <div className="form-group">
          <label htmlFor="cdnBaseUrl">CDN Base URL</label>
          <input
            id="cdnBaseUrl"
            value={cdnBaseUrl}
            onChange={(e) => setCdnBaseUrl(e.target.value)}
            placeholder="https://cdn.example.com"
          />
        </div>
        <div className="form-group">
          <label htmlFor="smtpHost">SMTP Host</label>
          <input
            id="smtpHost"
            value={smtpHost}
            onChange={(e) => setSmtpHost(e.target.value)}
            placeholder="smtp.example.com"
          />
        </div>
        <div className="form-group">
          <label className="admin-ads-enable" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="checkbox"
              checked={showShareRail}
              onChange={(e) => setShowShareRail(e.target.checked)}
            />
            <span>Show social share buttons in the site footer</span>
          </label>
        </div>
        <div className="form-group">
          <label htmlFor="footerBrandTitle">Footer — brand title (left, bold)</label>
          <input
            id="footerBrandTitle"
            value={footerBrandTitle}
            onChange={(e) => setFooterBrandTitle(e.target.value)}
            maxLength={120}
          />
        </div>
        <div className="form-group">
          <label htmlFor="footerTagline">Footer — short description (under title)</label>
          <textarea
            id="footerTagline"
            value={footerTagline}
            onChange={(e) => setFooterTagline(e.target.value)}
            rows={3}
            maxLength={500}
            style={{ width: "100%", fontFamily: "inherit" }}
          />
        </div>
        <div className="form-group">
          <label>Header &amp; footer — main link column</label>
          <small style={{ display: "block", marginBottom: 8, opacity: 0.85 }}>
            Shown in the site header (home) and the right column above the sub-footer. Add, edit, or remove
            rows; at least one link required.
          </small>
          <div className="admin-link-editor">
            {navigationLinks.map((item, index) => (
              <div key={`nav-${index}`} className="admin-link-row">
                <input
                  value={item.label}
                  onChange={(e) =>
                    setNavigationLinks((prev) =>
                      prev.map((entry, entryIndex) =>
                        entryIndex === index ? { ...entry, label: e.target.value } : entry,
                      ),
                    )
                  }
                  placeholder="Label"
                />
                <input
                  value={item.href}
                  onChange={(e) =>
                    setNavigationLinks((prev) =>
                      prev.map((entry, entryIndex) =>
                        entryIndex === index ? { ...entry, href: e.target.value } : entry,
                      ),
                    )
                  }
                  placeholder="/path"
                />
                <button
                  type="button"
                  className="btn-reset"
                  onClick={() =>
                    setNavigationLinks((prev) => prev.filter((_, entryIndex) => entryIndex !== index))
                  }
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn-reset"
              onClick={() => setNavigationLinks((prev) => [...prev, { label: "", href: "" }])}
            >
              Add link
            </button>
          </div>
        </div>
        <div className="form-group">
          <label>Sub-footer — bottom link row</label>
          <small style={{ display: "block", marginBottom: 8, opacity: 0.85 }}>
            Privacy, Terms, etc. Add, edit, delete with the row buttons; at least one link required.
          </small>
          <div className="admin-link-editor">
            {footerLinks.map((item, index) => (
              <div key={`footer-${index}`} className="admin-link-row">
                <input
                  value={item.label}
                  onChange={(e) =>
                    setFooterLinks((prev) =>
                      prev.map((entry, entryIndex) =>
                        entryIndex === index ? { ...entry, label: e.target.value } : entry,
                      ),
                    )
                  }
                  placeholder="Label"
                />
                <input
                  value={item.href}
                  onChange={(e) =>
                    setFooterLinks((prev) =>
                      prev.map((entry, entryIndex) =>
                        entryIndex === index ? { ...entry, href: e.target.value } : entry,
                      ),
                    )
                  }
                  placeholder="/path"
                />
                <button
                  type="button"
                  className="btn-reset"
                  onClick={() => setFooterLinks((prev) => prev.filter((_, entryIndex) => entryIndex !== index))}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn-reset"
              onClick={() => setFooterLinks((prev) => [...prev, { label: "", href: "" }])}
            >
              Add link
            </button>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="footerCopyright">Sub-footer — copyright line (right)</label>
          <input
            id="footerCopyright"
            value={footerCopyright}
            onChange={(e) => setFooterCopyright(e.target.value)}
            maxLength={500}
            placeholder="© 2026 Your Site. All rights reserved."
          />
        </div>
        <button className="btn-calc" type="submit">
          Save Settings
        </button>
      </form>

      <h2 style={{ marginTop: 32, marginBottom: 12 }}>Home page — FAQ</h2>
      <p style={{ marginBottom: 12, opacity: 0.9 }}>
        Per-game FAQs (BGMI, PUBG, Free Fire, Free Fire Max) ab yahan se move ho chuke hain:{" "}
        <Link href="/admin/game-faqs" style={{ color: "var(--primary)" }}>
          Game FAQs
        </Link>
        . Long articles:{" "}
        <Link href="/admin/game-articles" style={{ color: "var(--primary)" }}>
          Game Articles
        </Link>
        .
      </p>
      <p style={{ marginBottom: 12, opacity: 0.75, fontSize: 13 }}>
        Neeche wala editor ab bhi BGMI FAQ save karta hai (legacy). Prefer Game FAQs for all games.
      </p>
      <div className="admin-faq-editor">
        {faqItems.map((item, index) => (
          <div
            key={item.id}
            style={{
              marginBottom: 20,
              paddingBottom: 16,
              borderBottom: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <div className="form-group">
              <label htmlFor={`faq-q-${item.id}`}>Question</label>
              <textarea
                id={`faq-q-${item.id}`}
                value={item.question}
                onChange={(e) =>
                  setFaqItems((prev) =>
                    prev.map((entry, j) =>
                      j === index ? { ...entry, question: e.target.value } : entry,
                    ),
                  )
                }
                rows={2}
                maxLength={500}
                style={{ width: "100%", fontFamily: "inherit" }}
              />
            </div>
            <div className="form-group">
              <label htmlFor={`faq-a-${item.id}`}>Answer</label>
              <textarea
                id={`faq-a-${item.id}`}
                value={item.answer}
                onChange={(e) =>
                  setFaqItems((prev) =>
                    prev.map((entry, j) =>
                      j === index ? { ...entry, answer: e.target.value } : entry,
                    ),
                  )
                }
                rows={5}
                maxLength={4000}
                style={{ width: "100%", fontFamily: "inherit" }}
              />
            </div>
            <button
              type="button"
              className="btn-reset"
              onClick={() => setFaqItems((prev) => prev.filter((_, j) => j !== index))}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn-reset"
          onClick={() =>
            setFaqItems((prev) => [...prev, { id: newFaqId(), question: "", answer: "" }])
          }
        >
          Add FAQ
        </button>
      </div>
      <button className="btn-calc" type="button" onClick={saveFaq} style={{ marginTop: 16 }}>
        Save FAQ
      </button>

      <h2 style={{ marginTop: 32, marginBottom: 12 }}>Calculator phone names</h2>
      <div className="form-group">
        <label htmlFor="calculatorPhoneModels">
          Search suggestions: write names separated by commas (e.g. Motorola Edge 40, Samsung S24, Pixel
          8). New lines / tabs also work. Duplicates are removed on save. Up to 2000 names. Leave empty
          and save to use built-in defaults again.
        </label>
        <textarea
          id="calculatorPhoneModels"
          value={phoneModelsText}
          onChange={(e) => setPhoneModelsText(e.target.value)}
          rows={14}
          style={{ width: "100%", fontFamily: "inherit", minHeight: 200 }}
          spellCheck={false}
        />
        <p style={{ marginTop: 8, color: "#94a3b8", fontSize: 13 }}>
          Names in box right now: <strong style={{ color: "#e6edf3" }}>{countPhoneNamesInInput(phoneModelsText)}</strong>
          {" "}— after save, homepage search uses this exact list (Samsung, Motorola, etc.).
        </p>
      </div>
      <button className="btn-calc" type="button" onClick={savePhoneModels}>
        Save phone list
      </button>
        </>
      )}
    </section>
  );
}
