import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addAuditLog } from "@/src/server/repositories/auditRepository";
import { readAdminJsonBody } from "@/src/server/admin/adminApiHelpers";
import { enforceAdminApiAccess } from "@/src/server/rbac/enforceAdminApiAccess";
import {
  clearFfPageCards,
  getFfPageCardsForAdmin,
  isPageCardsVariant,
  saveFfPageCards,
} from "@/src/server/repositories/homeCardsRepository";
import type { PageCardsVariant } from "@/src/lib/homeCardsTypes";

function parseVariant(value: unknown): PageCardsVariant {
  if (isPageCardsVariant(value)) return value;
  return "freefire";
}

export async function GET(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  const variant = parseVariant(request.nextUrl.searchParams.get("game"));
  try {
    const data = await getFfPageCardsForAdmin(variant);
    return NextResponse.json({ data: { ...data, variant } });
  } catch {
    return NextResponse.json({ error: "Could not load page cards." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  const bodyResult = await readAdminJsonBody(request);
  if (!bodyResult.ok) return bodyResult.response;

  const parsed = z
    .object({
      action: z.enum(["save", "reset"]).default("save"),
      game: z
        .enum(["freefire", "freefire-max", "bgmi", "pubg", "pubg-mobile-codes"])
        .default("freefire"),
      cards: z.unknown().optional(),
    })
    .safeParse(bodyResult.data);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const variant = parsed.data.game;

  try {
    if (parsed.data.action === "reset") {
      const result = await clearFfPageCards(variant);
      await addAuditLog({
        actor: "admin",
        action: "home-cards.reset",
        target: variant,
        payload: { usingDefault: true },
      });
      return NextResponse.json({ ok: true, variant, ...result });
    }

    if (parsed.data.cards === undefined) {
      return NextResponse.json({ error: "Missing cards payload" }, { status: 400 });
    }

    const result = await saveFfPageCards(variant, parsed.data.cards);
    await addAuditLog({
      actor: "admin",
      action: "home-cards.update",
      target: variant,
      payload: { usingDefault: false },
    });
    return NextResponse.json({ ok: true, variant, ...result });
  } catch {
    return NextResponse.json({ error: "Could not save page cards." }, { status: 503 });
  }
}
