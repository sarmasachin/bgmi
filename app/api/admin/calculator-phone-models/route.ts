import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDuplicatePhoneNamesInInput } from "@/src/lib/calculatorPhoneModelsInput";
import { addAuditLog } from "@/src/server/repositories/auditRepository";
import {
  getCalculatorPhoneModels,
  getStoredCalculatorPhoneModelsRaw,
  saveCalculatorPhoneModels,
} from "@/src/server/repositories/calculatorPhoneModelsRepository";

const SETTINGS_KEY = "settings:calculatorPhoneModels";

const postSchema = z.object({
  models: z.array(z.string()).max(2000),
});

export async function GET() {
  const stored = await getStoredCalculatorPhoneModelsRaw();
  const effective = await getCalculatorPhoneModels();
  return NextResponse.json({
    effectiveModels: effective,
    storedModels: stored,
  });
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const duplicates = getDuplicatePhoneNamesInInput(parsed.data.models);
  if (duplicates.length > 0) {
    const maxShow = 12;
    const shown = duplicates.slice(0, maxShow);
    const more = duplicates.length - shown.length;
    const list =
      more > 0
        ? `${shown.join(", ")} (+${more} more duplicate name${more === 1 ? "" : "s"})`
        : shown.join(", ");
    return NextResponse.json(
      {
        error: `Duplicate phone names are not allowed (ignoring capital letters): ${list}. Remove the extras and save again.`,
      },
      { status: 400 },
    );
  }
  let saved: string[];
  try {
    saved = await saveCalculatorPhoneModels(parsed.data.models);
  } catch {
    return NextResponse.json({ error: "Could not save phone models." }, { status: 503 });
  }
  await addAuditLog({
    actor: "admin",
    action: "calculator.phone-models.update",
    target: SETTINGS_KEY,
    payload: { count: saved.length },
  });
  return NextResponse.json({ ok: true, savedCount: saved.length });
}
