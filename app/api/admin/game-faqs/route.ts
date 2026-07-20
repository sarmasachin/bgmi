import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addAuditLog } from "@/src/server/repositories/auditRepository";
import { readAdminJsonBody } from "@/src/server/admin/adminApiHelpers";
import {
  getAllGameFaqsForAdmin,
  getGameFaqItems,
  getStoredGameFaqRaw,
  saveGameFaqItems,
  type GameFaqGame,
} from "@/src/server/repositories/homeFaqRepository";

const gameSchema = z.enum(["bgmi", "pubg", "freefire", "freefire-max"]);

const itemSchema = z.object({
  id: z.string().max(80).optional(),
  question: z.string().max(500),
  answer: z.string().max(4000),
});

export async function GET(request: NextRequest) {
  const gameParam = request.nextUrl.searchParams.get("game");
  if (!gameParam) {
    const data = await getAllGameFaqsForAdmin();
    return NextResponse.json({ data });
  }

  const parsedGame = gameSchema.safeParse(gameParam);
  if (!parsedGame.success) {
    return NextResponse.json({ error: "Invalid game" }, { status: 400 });
  }
  const game = parsedGame.data as GameFaqGame;
  const stored = await getStoredGameFaqRaw(game);
  const effective = await getGameFaqItems(game);
  return NextResponse.json({
    game,
    effectiveItems: effective,
    storedItems: stored,
    usingDefault: stored === null,
  });
}

export async function POST(request: NextRequest) {
  const bodyResult = await readAdminJsonBody(request);
  if (!bodyResult.ok) return bodyResult.response;

  const parsed = z
    .object({
      game: gameSchema,
      items: z.array(itemSchema).max(50),
    })
    .safeParse(bodyResult.data);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const payload = parsed.data.items.map((row) => ({
    id: row.id?.trim() ?? "",
    question: row.question,
    answer: row.answer,
  }));

  try {
    const saved = await saveGameFaqItems(parsed.data.game, payload);
    await addAuditLog({
      actor: "admin",
      action: "faq.game.update",
      target: parsed.data.game,
      payload: { count: saved.length },
    });
    return NextResponse.json({ ok: true, savedCount: saved.length, game: parsed.data.game });
  } catch {
    return NextResponse.json({ error: "Could not save FAQ." }, { status: 503 });
  }
}
