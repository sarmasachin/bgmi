import Image from "next/image";
import Link from "next/link";
import { FooterShareLinks } from "@/src/components/FooterShareLinks";
import { ensureFreeFireNavigation } from "@/src/lib/freeFirePages";
import { ensurePubgMobileCodesNavigation, PUBG_MOBILE_CODES_PATH } from "@/src/lib/pubgMobileCodes";
import {
  getSettings,
  isShareRailEnabled,
  type SiteSettings,
} from "@/src/server/repositories/settingsRepository";

const FALLBACK_COPYRIGHT = "© 2026 Sensitivity Settings. All rights reserved.";

type SiteFooterProps = {
  /** When provided (e.g. homepage), skips a duplicate getSettings() round-trip. */
  settings?: SiteSettings;
};

export async function SiteFooter({ settings: settingsProp }: SiteFooterProps = {}) {
  const settings = settingsProp ?? (await getSettings());
  const copyrightLine = (settings.footerCopyright || "").trim() || FALLBACK_COPYRIGHT;
  const { brandTitle, tagline } = settings.footerBranding;
  const showShareLinks = isShareRailEnabled(settings.integrations);
  const exploreLinks = ensurePubgMobileCodesNavigation(
    ensureFreeFireNavigation(
      settings.navigation.map((item) => {
        const label = item.label.trim();
        if (/pubg\s*mobile\s*code/i.test(label)) {
          return { ...item, href: PUBG_MOBILE_CODES_PATH };
        }
        if (/pubg/i.test(label) && (item.href === "/" || !item.href.trim())) {
          return { ...item, href: "/pubg" };
        }
        if (/^bgmi$/i.test(label)) {
          return { ...item, href: "/bgmi" };
        }
        if (/free\s*fire/i.test(label) && !/max/i.test(label)) {
          return { ...item, href: "/" };
        }
        return item;
      }),
    ),
  );

  const resourceLinks = (() => {
    const links = [...settings.footerLinks];
    const ensure = (label: string, href: string, match: (item: { label: string; href: string }) => boolean) => {
      if (!links.some(match)) links.push({ label, href });
    };
    ensure("Contact", "/contact", (item) => /^contact$/i.test(item.label) || item.href === "/contact");
    ensure("News", "/news", (item) => /^news$/i.test(item.label) || item.href === "/news");
    ensure(
      "Sitemap",
      "/sitemap.xml",
      (item) => /sitemap/i.test(item.label) || /sitemap/i.test(item.href),
    );
    ensure(
      "Report Issue",
      "/contact?topic=report",
      (item) =>
        /report\s*issue/i.test(item.label) ||
        /topic=report/i.test(item.href) ||
        /report-issue/i.test(item.href),
    );
    ensure(
      "Feedback",
      "/contact?topic=feedback",
      (item) => /feedback/i.test(item.label) || /topic=feedback/i.test(item.href),
    );
    return links;
  })();

  const bottomLinks = resourceLinks.filter((item) =>
    /^(privacy|terms|disclaimer|contact|news|sitemap)$/i.test(item.label.trim()),
  );

  const resourcesColumnLinks = resourceLinks.filter(
    (item) => !/^(privacy|terms|disclaimer|contact|sitemap)$/i.test(item.label.trim()),
  );

  return (
    <footer className="site-footer">
      <div className="site-footer-accent" aria-hidden />

      <div className="site-footer-inner">
        <div className={`site-footer-grid${showShareLinks ? "" : " site-footer-grid--no-social"}`}>
          <div className="site-footer-brand">
            <Link href="/" className="site-footer-logo" aria-label={`${brandTitle} home`}>
              <span className="site-footer-logo-mark">
                <Image
                  src="/sens-master-logo.svg"
                  alt=""
                  width={44}
                  height={44}
                  className="site-footer-logo-img"
                />
              </span>
              <span className="site-footer-logo-text">{brandTitle}</span>
            </Link>
            <p className="site-footer-tagline">{tagline}</p>
            <p className="site-footer-note">
              Fast recoil control, cleaner flicks, and phone-based sensitivity presets.
            </p>
          </div>

          <div className="site-footer-col">
            <p className="site-footer-col-title">Explore</p>
            <ul className="site-footer-links">
              {exploreLinks.map((item) => (
                <li key={`${item.href}-${item.label}`}>
                  <Link href={item.href} className="site-footer-link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="site-footer-col">
            <p className="site-footer-col-title">Resources</p>
            <ul className="site-footer-links">
              {resourcesColumnLinks.map((page) => (
                <li key={`${page.href}-${page.label}`}>
                  <Link href={page.href} className="site-footer-link">
                    {page.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {showShareLinks ? (
            <div className="site-footer-col site-footer-col--social">
              <p className="site-footer-col-title">Connect</p>
              <FooterShareLinks />
            </div>
          ) : null}
        </div>
      </div>

      <div className="site-footer-bottom">
        <div className="site-footer-bottom-inner">
          <p className="site-footer-copyright">{copyrightLine}</p>
          <div className="site-footer-bottom-links">
            {bottomLinks.map((page) => (
              <Link key={`bottom-${page.href}-${page.label}`} href={page.href} className="site-footer-bottom-link">
                {page.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
