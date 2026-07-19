import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  dedupePhoneNamesPreserveOrder,
  expandCalculatorPhoneModelStrings,
} from "@/src/lib/calculatorPhoneModelsInput";
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

  const expanded = expandCalculatorPhoneModelStrings(parsed.data.models);
  const unique = dedupePhoneNamesPreserveOrder(expanded);
  const removedDuplicates = Math.max(0, expanded.length - unique.length);

  let saved: string[];
  try {
    saved = await saveCalculatorPhoneModels(unique);
  } catch {
    return NextResponse.json({ error: "Could not save phone models." }, { status: 503 });
  }
  await addAuditLog({
    actor: "admin",
    action: "calculator.phone-models.update",
    target: SETTINGS_KEY,
    payload: { count: saved.length, removedDuplicates },
  });
  return NextResponse.json({
    ok: true,
    savedCount: saved.length,
    removedDuplicates,
    models: saved,
  });
}
