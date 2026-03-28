import Link from "next/link";
import { getSettings } from "@/src/server/repositories/settingsRepository";

const FALLBACK_COPYRIGHT = "© 2026 SENS MASTER PRO. All rights reserved.";

export async function SiteFooter() {
  const settings = await getSettings();
  const copyrightLine = (settings.footerCopyright || "").trim() || FALLBACK_COPYRIGHT;
  const { brandTitle, tagline } = settings.footerBranding;

  return (
    <footer>
      <div className="footer-main">
        <div>
          <h3>{brandTitle}</h3>
          <p>{tagline}</p>
        </div>
        <div className="footer-links">
          {settings.navigation.map((item) => (
            <Link key={`${item.href}-${item.label}`} href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="sub-footer">
        <div className="sub-footer-pages">
          {settings.footerLinks.map((page) => (
            <Link key={`${page.href}-${page.label}`} href={page.href}>
              {page.label}
            </Link>
          ))}
        </div>
        <small>{copyrightLine}</small>
      </div>
    </footer>
  );
}
