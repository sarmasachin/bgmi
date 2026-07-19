import { NextResponse } from "next/server";

/** Safe JSON body parse for admin API routes (invalid body → 400, not 500). */
export async function readAdminJsonBody(
  request: Request,
): Promise<{ ok: true; data: unknown } | { ok: false; response: NextResponse }> {
  try {
    return { ok: true, data: await request.json() };
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }),
    };
  }
}

export function adminErrorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}
