import { defaultSeoSettings, defaultThemeTokens } from "@/src/lib/siteSettings";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSettings, saveSettings } from "@/src/server/repositories/settingsRepository";
import { addAuditLog } from "@/src/server/repositories/auditRepository";
import { readAdminJsonBody } from "@/src/server/admin/adminApiHelpers";

const CACHE_TTL_MS = 60_000;

let settingsCache:
  | {
      expiresAt: number;
      payload: {
        seo: unknown;
        theme: unknown;
        integrations: unknown;
        navigation: unknown;
        footerLinks: unknown;
        footerCopyright: string;
        homeDisplay: { headerTitle: string; heroTitle: string };
        footerBranding: { brandTitle: string; tagline: string };
      };
    }
  | null = null;

export async function GET() {
  const now = Date.now();
  if (settingsCache && settingsCache.expiresAt > now) {
    return NextResponse.json(settingsCache.payload);
  }

  const stored = await getSettings();
  const payload = {
    seo: stored.seo ?? defaultSeoSettings,
    theme: stored.theme ?? defaultThemeTokens,
    integrations: stored.integrations,
    navigation: stored.navigation,
    footerLinks: stored.footerLinks,
    footerCopyright: stored.footerCopyright,
    homeDisplay: stored.homeDisplay,
    footerBranding: stored.footerBranding,
  };

  settingsCache = {
    expiresAt: now + CACHE_TTL_MS,
    payload,
  };

  return NextResponse.json(payload);
}

const settingsSchema = z.object({
  seo: z.record(z.string(), z.any()).optional(),
  theme: z.record(z.string(), z.any()).optional(),
  integrations: z.record(z.string(), z.any()).optional(),
  navigation: z.array(z.object({ label: z.string(), href: z.string() })).optional(),
  footerLinks: z.array(z.object({ label: z.string(), href: z.string() })).optional(),
  footerCopyright: z.string().max(500).optional(),
  homeDisplay: z
    .object({
      headerTitle: z.string().max(120).optional(),
      heroTitle: z.string().max(120).optional(),
    })
    .optional(),
  footerBranding: z
    .object({
      brandTitle: z.string().max(120).optional(),
      tagline: z.string().max(500).optional(),
    })
    .optional(),
});

export async function POST(request: NextRequest) {
  const bodyResult = await readAdminJsonBody(request);
  if (!bodyResult.ok) return bodyResult.response;
  const parsed = settingsSchema.safeParse(bodyResult.data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid settings payload" }, { status: 400 });
  }
  try {
    await saveSettings(parsed.data);
    await addAuditLog({
      actor: "admin",
      action: "settings.update",
      target: "site-settings",
      payload: { keys: Object.keys(parsed.data) },
    });
    settingsCache = null;
    return NextResponse.json({ ok: true, saved: true });
  } catch {
    return NextResponse.json({ error: "Could not save settings." }, { status: 500 });
  }
}
