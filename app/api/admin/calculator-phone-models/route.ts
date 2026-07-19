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

const postSchema = z
  .object({
    /** Preferred for large lists (comma/newline separated). */
    text: z.string().max(500_000).optional(),
    models: z.array(z.string()).max(2000).optional(),
  })
  .refine((v) => typeof v.text === "string" || Array.isArray(v.models), {
    message: "text or models required",
  });

export async function GET() {
  const stored = await getStoredCalculatorPhoneModelsRaw();
  const effective = await getCalculatorPhoneModels();
  return NextResponse.json({
    effectiveModels: effective,
    storedModels: stored,
    storedCount: stored?.length ?? 0,
    effectiveCount: effective.length,
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

  const source =
    typeof parsed.data.text === "string"
      ? [parsed.data.text]
      : (parsed.data.models ?? []);
  const expanded = expandCalculatorPhoneModelStrings(source);
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
