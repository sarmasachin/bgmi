import {
  getCalculatorPhoneModels,
  getStoredCalculatorPhoneModelsRaw,
} from "@/src/server/repositories/calculatorPhoneModelsRepository";
import {
  getHomeFaqItems,
  getStoredHomeFaqRaw,
  type HomeFaqItem,
} from "@/src/server/repositories/homeFaqRepository";
import { getHeadSnippets, getSettings } from "@/src/server/repositories/settingsRepository";
import { defaultSeoSettings } from "@/src/lib/siteSettings";

export type AdminSettingsLink = { label: string; href: string };

export type AdminSettingsPageData = {
  headerSiteTitle: string;
  homeHeroTitle: string;
  siteTitle: string;
  defaultTitle: string;
  titleTemplate: string;
  metaDescription: string;
  keywords: string[];
  googleVerification: string;
  analyticsScript: string;
  adsenseScript: string;
  cdnBaseUrl: string;
  smtpHost: string;
  showShareRail: boolean;
  footerCopyright: string;
  footerBrandTitle: string;
  footerTagline: string;
  navigationLinks: AdminSettingsLink[];
  footerLinks: AdminSettingsLink[];
  phoneModelsText: string;
  faqItems: HomeFaqItem[];
  ffTrustBar: Array<{ label: string; sublabel: string }>;
};

export async function prefetchAdminSettingsPageData(): Promise<AdminSettingsPageData> {
  const [settings, snippets, storedPhones, storedFaq, effectiveFaq, effectiveModels] = await Promise.all([
    getSettings(),
    getHeadSnippets(),
    getStoredCalculatorPhoneModelsRaw(),
    getStoredHomeFaqRaw(),
    getHomeFaqItems(),
    getCalculatorPhoneModels(),
  ]);

  const phoneLines = storedPhones === null ? effectiveModels : storedPhones;
  const faqList = storedFaq !== null && storedFaq !== undefined ? storedFaq : effectiveFaq;

  const integrations = settings.integrations as {
    cdn?: { baseUrl?: string };
    smtp?: { host?: string };
    showShareRail?: boolean;
  };

  const seo = settings.seo as Record<string, unknown>;
  const keywordsRaw = seo.keywords;
  const keywords = Array.isArray(keywordsRaw)
    ? keywordsRaw
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean)
    : defaultSeoSettings.keywords;

  return {
    headerSiteTitle: settings.homeDisplay.headerTitle,
    homeHeroTitle: settings.homeDisplay.heroTitle,
    siteTitle:
      typeof seo.siteTitle === "string" && seo.siteTitle.trim()
        ? seo.siteTitle.trim()
        : defaultSeoSettings.siteTitle,
    defaultTitle:
      typeof seo.defaultTitle === "string" && seo.defaultTitle.trim()
        ? seo.defaultTitle.trim()
        : defaultSeoSettings.defaultTitle,
    titleTemplate:
      typeof seo.titleTemplate === "string" && seo.titleTemplate.trim()
        ? seo.titleTemplate.trim()
        : defaultSeoSettings.titleTemplate,
    metaDescription:
      typeof seo.metaDescription === "string" && seo.metaDescription.trim()
        ? seo.metaDescription.trim()
        : defaultSeoSettings.metaDescription,
    keywords,
    googleVerification: snippets.googleVerificationMeta ?? "",
    analyticsScript: snippets.analyticsScript ?? "",
    adsenseScript: snippets.adsenseScript ?? "",
    cdnBaseUrl: integrations.cdn?.baseUrl ?? "",
    smtpHost: integrations.smtp?.host ?? "",
    showShareRail: integrations.showShareRail !== false,
    footerCopyright: settings.footerCopyright,
    footerBrandTitle: settings.footerBranding.brandTitle,
    footerTagline: settings.footerBranding.tagline,
    navigationLinks: settings.navigation,
    footerLinks: settings.footerLinks,
    phoneModelsText: Array.isArray(phoneLines) ? phoneLines.join(", ") : "",
    faqItems: faqList.map((row, i) => ({
      id: row.id?.trim() || `faq-load-${i}`,
      question: row.question ?? "",
      answer: row.answer ?? "",
    })),
    ffTrustBar: settings.ffTrustBar,
  };
}
