import { NextResponse } from "next/server";
import { getAdminRatingRows } from "@/src/server/repositories/adminRatingsRepository";

export async function GET() {
  const data = await getAdminRatingRows();
  return NextResponse.json({ data });
}
