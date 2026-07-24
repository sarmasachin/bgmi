import { NextResponse, NextRequest } from "next/server";
import { getSystemHealthData } from "@/src/server/admin/getSystemHealthData";
import { enforceAdminApiAccess } from "@/src/server/rbac/enforceAdminApiAccess";

export async function GET(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  return NextResponse.json(getSystemHealthData());
}
