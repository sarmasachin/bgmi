import { NextResponse } from "next/server";
import { getEnvStatus } from "@/src/server/envStatus";

export async function GET() {
  const env = getEnvStatus();
  return NextResponse.json({
    ok: env.present === env.total,
    env,
  });
}
