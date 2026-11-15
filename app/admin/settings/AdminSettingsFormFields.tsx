"use client";

import { defaultSeoSettings } from "@/src/lib/siteSettings";
import type { AdminSettingsFormFieldsProps } from "./adminSettingsFormTypes";

export function AdminSettingsFormFields(props: AdminSettingsFormFieldsProps) {
  const {
    headerSiteTitle, setHeaderSiteTitle,
    homeHeroTitle, setHomeHeroTitle,
    ffTrustBar, setFfTrustBar,
    siteTitle, setSiteTitle,
    defaultTitle, setDefaultTitle,
    metaDescription, setMetaDescription,
    keywordsText, setKeywordsText,
    titleTemplate, setTitleTemplate,
    googleVerification, setGoogleVerification,
    analyticsScript, setAnalyticsScript,
    adsenseScript, setAdsenseScript,
    cdnBaseUrl, setCdnBaseUrl,
    smtpHost, setSmtpHost,
    showShareRail, setShowShareRail,
    showDiwaliDiyas, setShowDiwaliDiyas,
    footerBrandTitle, setFooterBrandTitle,
    footerTagline, setFooterTagline,
    navigationLinks, setNavigationLinks,
    footerLinks, setFooterLinks,
    footerCopyright, setFooterCopyright,
    onSubmit,
  } = props;

  return (
          <form onSubmit={onSubmit}>
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
          <label>Free Fire calculator — trust bar (under calculator)</label>
          <small style={{ display: "block", marginBottom: 8, opacity: 0.85 }}>
            4 items shown below the Free Fire calculator on home / FF pages. Icons stay fixed; edit
            title + subtitle only.
          </small>
          <div className="admin-link-editor">
            {ffTrustBar.map((item, index) => (
              <div key={`ff-trust-${index}`} className="admin-link-row">
                <input
                  aria-label={`Trust item ${index + 1} title`}
                  value={item.label}
                  maxLength={48}
                  placeholder={`Title ${index + 1}`}
                  onChange={(e) =>
                    setFfTrustBar((prev) =>
                      prev.map((row, i) =>
                        i === index ? { ...row, label: e.target.value } : row,
                      ),
                    )
                  }
                />
                <input
                  aria-label={`Trust item ${index + 1} subtitle`}
                  value={item.sublabel}
                  maxLength={48}
                  placeholder={`Subtitle ${index + 1}`}
                  onChange={(e) =>
                    setFfTrustBar((prev) =>
                      prev.map((row, i) =>
                        i === index ? { ...row, sublabel: e.target.value } : row,
                      ),
                    )
                  }
                />
              </div>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="seoSiteTitle">Site name</label>
          <input
            id="seoSiteTitle"
            value={siteTitle}
            onChange={(e) => setSiteTitle(e.target.value)}
            placeholder={defaultSeoSettings.siteTitle}
          />
          <p className="form-hint" style={{ marginTop: 6, opacity: 0.75, fontSize: 12 }}>
            Used for brand / Open Graph site name.
          </p>
        </div>
        <div className="form-group">
          <label htmlFor="seoDefaultTitle">Default meta title</label>
          <input
            id="seoDefaultTitle"
            value={defaultTitle}
            onChange={(e) => setDefaultTitle(e.target.value)}
            placeholder={defaultSeoSettings.defaultTitle}
          />
        </div>
        <div className="form-group">
          <label htmlFor="seoMetaDescription">Default meta description</label>
          <textarea
            id="seoMetaDescription"
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            rows={3}
            placeholder={defaultSeoSettings.metaDescription}
          />
        </div>
        <div className="form-group">
          <label htmlFor="seoKeywords">Default SEO keywords</label>
          <textarea
            id="seoKeywords"
            value={keywordsText}
            onChange={(e) => setKeywordsText(e.target.value)}
            rows={5}
            placeholder={defaultSeoSettings.keywords.join("\n")}
          />
          <p className="form-hint" style={{ marginTop: 6, opacity: 0.75, fontSize: 12 }}>
            One keyword per line (commas also OK).
          </p>
        </div>
        <div className="form-group">
          <label htmlFor="seoTitleTemplate">Title Template</label>
          <input
            id="seoTitleTemplate"
            value={titleTemplate}
            onChange={(e) => setTitleTemplate(e.target.value)}
            placeholder={defaultSeoSettings.titleTemplate}
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
            placeholder="Paste full Google tag HTML, or G-XXXXXXXX"
          />
          <p className="form-hint" style={{ marginTop: 6, opacity: 0.75, fontSize: 12 }}>
            Loaded into {"<head>"} after page paint (better mobile PageSpeed). Full gtag paste OK.
          </p>
        </div>
        <div className="form-group">
          <label htmlFor="adsenseScript">AdSense Script</label>
          <input
            id="adsenseScript"
            value={adsenseScript}
            onChange={(e) => setAdsenseScript(e.target.value)}
            placeholder="Paste full AdSense script, or ca-pub-XXXXXXXX"
          />
          <p className="form-hint" style={{ marginTop: 6, opacity: 0.75, fontSize: 12 }}>
            Loaded into {"<head>"} after page paint (better mobile PageSpeed). Full AdSense HTML OK.
          </p>
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
          <label className="admin-ads-enable" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="checkbox"
              checked={showDiwaliDiyas}
              onChange={(e) => setShowDiwaliDiyas(e.target.checked)}
            />
            <span>Show Diwali diya decorations on calculators and update boxes</span>
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
  );
}
