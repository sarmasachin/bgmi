import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addAuditLog } from "@/src/server/repositories/auditRepository";
import { readAdminJsonBody } from "@/src/server/admin/adminApiHelpers";
import { enforceAdminApiAccess } from "@/src/server/rbac/enforceAdminApiAccess";
import {
  getGameArticlesForAdmin,
  saveGameArticleHtml,
} from "@/src/server/repositories/gameArticlesRepository";

export async function GET(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  const data = await getGameArticlesForAdmin();
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  const bodyResult = await readAdminJsonBody(request);
  if (!bodyResult.ok) return bodyResult.response;

  const parsed = z
    .object({
      game: z.enum(["bgmi", "pubg"]),
      html: z.string().max(500_000),
    })
    .safeParse(bodyResult.data);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    const saved = await saveGameArticleHtml(parsed.data.game, parsed.data.html);
    await addAuditLog({
      actor: "admin",
      action: "game-article.update",
      target: parsed.data.game,
      payload: { usingDefault: saved.usingDefault, length: saved.html.length },
    });
    return NextResponse.json({ ok: true, ...saved });
  } catch {
    return NextResponse.json({ error: "Could not save article." }, { status: 503 });
  }
}
