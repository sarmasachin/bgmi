import { defaultSeoSettings, defaultThemeTokens } from "@/src/lib/siteSettings";
import { prisma, tryPrisma } from "@/src/server/dbSafe";

type SettingsPayload = {
  seo?: Record<string, unknown>;
  theme?: Record<string, unknown>;
  integrations?: Record<string, unknown>;
  navigation?: Array<{ label: string; href: string }>;
  footerLinks?: Array<{ label: string; href: string }>;
  footerCopyright?: string;
  homeDisplay?: { headerTitle?: string; heroTitle?: string };
  footerBranding?: { brandTitle?: string; tagline?: string };
};

const SETTINGS_KEYS = {
  seo: "settings:seo",
  theme: "settings:theme",
  integrations: "settings:integrations",
  navigation: "settings:navigation",
  footerLinks: "settings:footerLinks",
  footerCopyright: "settings:footerCopyright",
  footerBranding: "settings:footerBranding",
  homeDisplay: "settings:homeDisplay",
  /** Stored separately; listed so batch reads stay consistent. */
  headSnippets: "settings:headSnippets",
};

const defaultSettings = {
  seo: defaultSeoSettings,
  theme: defaultThemeTokens,
  integrations: {
    googleVerification: "",
    analyticsTag: "",
    adsenseScript: "",
    smtp: {},
    pushKeys: {},
    cdn: { provider: "supabase", baseUrl: "" },
    /** When false, the floating social share rail is hidden on public pages. */
    showShareRail: true,
  },
  navigation: [
    { label: "Home", href: "/" },
    { label: "News", href: "/news" },
    { label: "Contact", href: "/contact" },
  ],
  footerLinks: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Disclaimer", href: "/disclaimer" },
    { label: "Contact", href: "/contact" },
    { label: "News", href: "/news" },
    { label: "Sitemap", href: "/sitemap.xml" },
  ],
  footerCopyright: "© 2026 SENS MASTER PRO. All rights reserved.",
  footerBranding: {
    brandTitle: "SENS MASTER PRO",
    tagline: "BGMI tools, news updates, and pro-level sensitivity insights.",
  },
  homeDisplay: {
    headerTitle: "SENS MASTER PRO",
    heroTitle: "SENS MASTER PRO",
  },
};

function normalizeDisplayTitle(input: unknown, fallback: string): string {
  if (typeof input !== "string") return fallback;
  const t = input.trim();
  if (!t) return fallback;
  return t.slice(0, 120);
}

function normalizeTagline(input: unknown, fallback: string): string {
  if (typeof input !== "string") return fallback;
  const t = input.trim();
  if (!t) return fallback;
  return t.slice(0, 500);
}

function parseHomeDisplayValue(raw: unknown): { headerTitle: string; heroTitle: string } {
  const obj = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    headerTitle: normalizeDisplayTitle(obj.headerTitle, defaultSettings.homeDisplay.headerTitle),
    heroTitle: normalizeDisplayTitle(obj.heroTitle, defaultSettings.homeDisplay.heroTitle),
  };
}

function parseLinkList(
  raw: unknown,
  fallback: Array<{ label: string; href: string }>,
): Array<{ label: string; href: string }> {
  if (!Array.isArray(raw)) return fallback;
  const out: Array<{ label: string; href: string }> = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const label = typeof rec.label === "string" ? rec.label.trim() : "";
    const href = typeof rec.href === "string" ? rec.href.trim() : "";
    if (label && href) out.push({ label, href });
  }
  return out.length ? out : fallback;
}

function parseFooterBrandingValue(raw: unknown): { brandTitle: string; tagline: string } {
  const obj = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    brandTitle: normalizeDisplayTitle(obj.brandTitle, defaultSettings.footerBranding.brandTitle),
    tagline: normalizeTagline(obj.tagline, defaultSettings.footerBranding.tagline),
  };
}

export async function getSettings() {
  const rows = await tryPrisma(async () =>
    prisma.siteSetting.findMany({
      where: {
        key: {
          in: Object.values(SETTINGS_KEYS),
        },
      },
    }),
  );

  if (!rows) return defaultSettings;

  const map = Object.fromEntries(rows.map((row) => [row.key, row.value]));
  return {
    seo: { ...defaultSettings.seo, ...(map[SETTINGS_KEYS.seo] as Record<string, unknown> | undefined) },
    theme: {
      ...defaultSettings.theme,
      ...(map[SETTINGS_KEYS.theme] as Record<string, unknown> | undefined),
    },
    integrations: {
      ...defaultSettings.integrations,
      ...(map[SETTINGS_KEYS.integrations] as Record<string, unknown> | undefined),
    },
    navigation: parseLinkList(map[SETTINGS_KEYS.navigation], defaultSettings.navigation),
    footerLinks: parseLinkList(map[SETTINGS_KEYS.footerLinks], defaultSettings.footerLinks),
    footerCopyright: parseFooterCopyright(map[SETTINGS_KEYS.footerCopyright]),
    footerBranding: parseFooterBrandingValue(map[SETTINGS_KEYS.footerBranding]),
    homeDisplay: parseHomeDisplayValue(map[SETTINGS_KEYS.homeDisplay]),
  };
}

function parseFooterCopyright(raw: unknown): string {
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  return defaultSettings.footerCopyright;
}

/** Public pages show ShareRail unless explicitly set to false in site settings. */
export function isShareRailEnabled(integrations: unknown): boolean {
  if (!integrations || typeof integrations !== "object") return true;
  const obj = integrations as Record<string, unknown>;
  if (!("showShareRail" in obj)) return true;
  return obj.showShareRail !== false;
}

export async function saveSettings(payload: SettingsPayload) {
  await tryPrisma(async () => {
    const copyright =
      typeof payload.footerCopyright === "string" && payload.footerCopyright.trim()
        ? payload.footerCopyright.trim()
        : defaultSettings.footerCopyright;

    let integrationsToSave: Record<string, unknown> = {
      ...defaultSettings.integrations,
    };
    if (payload.integrations !== undefined) {
      const currentRow = await prisma.siteSetting.findUnique({
        where: { key: SETTINGS_KEYS.integrations },
      });
      const existing = (currentRow?.value as Record<string, unknown> | undefined) ?? {};
      integrationsToSave = {
        ...defaultSettings.integrations,
        ...existing,
        ...payload.integrations,
      };
    } else {
      const currentRow = await prisma.siteSetting.findUnique({
        where: { key: SETTINGS_KEYS.integrations },
      });
      const existing = (currentRow?.value as Record<string, unknown> | undefined) ?? {};
      integrationsToSave = { ...defaultSettings.integrations, ...existing };
    }

    let homeDisplayToSave = defaultSettings.homeDisplay;
    if (payload.homeDisplay !== undefined) {
      const currentRow = await prisma.siteSetting.findUnique({
        where: { key: SETTINGS_KEYS.homeDisplay },
      });
      const current = parseHomeDisplayValue(currentRow?.value);
      homeDisplayToSave = {
        headerTitle:
          payload.homeDisplay.headerTitle !== undefined
            ? normalizeDisplayTitle(
                payload.homeDisplay.headerTitle,
                defaultSettings.homeDisplay.headerTitle,
              )
            : current.headerTitle,
        heroTitle:
          payload.homeDisplay.heroTitle !== undefined
            ? normalizeDisplayTitle(payload.homeDisplay.heroTitle, defaultSettings.homeDisplay.heroTitle)
            : current.heroTitle,
      };
    } else {
      const currentRow = await prisma.siteSetting.findUnique({
        where: { key: SETTINGS_KEYS.homeDisplay },
      });
      homeDisplayToSave = parseHomeDisplayValue(currentRow?.value);
    }

    let footerBrandingToSave = defaultSettings.footerBranding;
    if (payload.footerBranding !== undefined) {
      const currentRow = await prisma.siteSetting.findUnique({
        where: { key: SETTINGS_KEYS.footerBranding },
      });
      const current = parseFooterBrandingValue(currentRow?.value);
      footerBrandingToSave = {
        brandTitle:
          payload.footerBranding.brandTitle !== undefined
            ? normalizeDisplayTitle(
                payload.footerBranding.brandTitle,
                defaultSettings.footerBranding.brandTitle,
              )
            : current.brandTitle,
        tagline:
          payload.footerBranding.tagline !== undefined
            ? normalizeTagline(payload.footerBranding.tagline, defaultSettings.footerBranding.tagline)
            : current.tagline,
      };
    } else {
      const currentRow = await prisma.siteSetting.findUnique({
        where: { key: SETTINGS_KEYS.footerBranding },
      });
      footerBrandingToSave = parseFooterBrandingValue(currentRow?.value);
    }

    const entries = [
      [SETTINGS_KEYS.seo, payload.seo ?? defaultSettings.seo],
      [SETTINGS_KEYS.theme, payload.theme ?? defaultSettings.theme],
      [SETTINGS_KEYS.integrations, integrationsToSave],
      [SETTINGS_KEYS.navigation, payload.navigation ?? defaultSettings.navigation],
      [SETTINGS_KEYS.footerLinks, payload.footerLinks ?? defaultSettings.footerLinks],
      [SETTINGS_KEYS.footerCopyright, copyright],
      [SETTINGS_KEYS.footerBranding, footerBrandingToSave],
      [SETTINGS_KEYS.homeDisplay, homeDisplayToSave],
    ] as const;

    for (const [key, value] of entries) {
      await prisma.siteSetting.upsert({
        where: { key },
        create: { key, value: value as object },
        update: { value: value as object },
      });
    }
    return true;
  });
}

export async function getHeadSnippets() {
  const row = await tryPrisma(async () =>
    prisma.siteSetting.findUnique({ where: { key: SETTINGS_KEYS.headSnippets } }),
  );
  return (
    (row?.value as
      | { googleVerificationMeta?: string; analyticsScript?: string; adsenseScript?: string }
      | undefined) ?? {
      googleVerificationMeta: "",
      analyticsScript: "",
      adsenseScript: "",
    }
  );
}

export async function saveHeadSnippets(payload: {
  googleVerificationMeta?: string;
  analyticsScript?: string;
  adsenseScript?: string;
}) {
  await tryPrisma(async () =>
    prisma.siteSetting.upsert({
      where: { key: SETTINGS_KEYS.headSnippets },
      create: { key: SETTINGS_KEYS.headSnippets, value: payload },
      update: { value: payload },
    }),
  );
}
