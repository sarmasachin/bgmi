import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getHeadSnippets, saveHeadSnippets } from "@/src/server/repositories/settingsRepository";
import { addAuditLog } from "@/src/server/repositories/auditRepository";

const CACHE_TTL_MS = 60_000;

let headSnippetsCache:
  | {
      expiresAt: number;
      payload: {
        googleVerificationMeta?: string;
        analyticsScript?: string;
        adsenseScript?: string;
      };
    }
  | null = null;

const schema = z.object({
  googleVerificationMeta: z.string().optional(),
  analyticsScript: z.string().optional(),
  adsenseScript: z.string().optional(),
});

export async function GET() {
  const now = Date.now();
  if (headSnippetsCache && headSnippetsCache.expiresAt > now) {
    return NextResponse.json(headSnippetsCache.payload);
  }

  const payload = await getHeadSnippets();
  headSnippetsCache = {
    expiresAt: now + CACHE_TTL_MS,
    payload,
  };
  return NextResponse.json(payload);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid snippet payload" }, { status: 400 });
  }
  await saveHeadSnippets(parsed.data);
  await addAuditLog({
    actor: "admin",
    action: "settings.head-snippets.update",
    target: "head-snippets",
    payload: {
      hasGoogleVerification: Boolean(parsed.data.googleVerificationMeta),
      hasAnalytics: Boolean(parsed.data.analyticsScript),
      hasAdsense: Boolean(parsed.data.adsenseScript),
    },
  });
  headSnippetsCache = null;
  return NextResponse.json({ ok: true, saved: true });
}
