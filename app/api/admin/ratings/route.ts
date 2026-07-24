import { NextResponse, NextRequest } from "next/server";
import { getAdminRatingRows } from "@/src/server/repositories/adminRatingsRepository";
import { enforceAdminApiAccess } from "@/src/server/rbac/enforceAdminApiAccess";

export async function GET(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  const data = await getAdminRatingRows();
  return NextResponse.json({ data });
}
