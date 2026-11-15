import type { FormEvent, Dispatch, SetStateAction } from "react";

type LinkItem = { label: string; href: string };
type TrustItem = { label: string; sublabel: string };

export type AdminSettingsFormFieldsProps = {
  headerSiteTitle: string;
  setHeaderSiteTitle: (v: string) => void;
  homeHeroTitle: string;
  setHomeHeroTitle: (v: string) => void;
  ffTrustBar: TrustItem[];
  setFfTrustBar: Dispatch<SetStateAction<TrustItem[]>>;
  siteTitle: string;
  setSiteTitle: (v: string) => void;
  defaultTitle: string;
  setDefaultTitle: (v: string) => void;
  metaDescription: string;
  setMetaDescription: (v: string) => void;
  keywordsText: string;
  setKeywordsText: (v: string) => void;
  titleTemplate: string;
  setTitleTemplate: (v: string) => void;
  googleVerification: string;
  setGoogleVerification: (v: string) => void;
  analyticsScript: string;
  setAnalyticsScript: (v: string) => void;
  adsenseScript: string;
  setAdsenseScript: (v: string) => void;
  cdnBaseUrl: string;
  setCdnBaseUrl: (v: string) => void;
  smtpHost: string;
  setSmtpHost: (v: string) => void;
  showShareRail: boolean;
  setShowShareRail: (v: boolean) => void;
  showDiwaliDiyas: boolean;
  setShowDiwaliDiyas: (v: boolean) => void;
  footerBrandTitle: string;
  setFooterBrandTitle: (v: string) => void;
  footerTagline: string;
  setFooterTagline: (v: string) => void;
  navigationLinks: LinkItem[];
  setNavigationLinks: Dispatch<SetStateAction<LinkItem[]>>;
  footerLinks: LinkItem[];
  setFooterLinks: Dispatch<SetStateAction<LinkItem[]>>;
  footerCopyright: string;
  setFooterCopyright: (v: string) => void;
  onSubmit: (event: FormEvent) => void;
};


