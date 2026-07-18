import { NextResponse } from "next/server";
import { getSystemHealthData } from "@/src/server/admin/getSystemHealthData";

export async function GET() {
  return NextResponse.json(getSystemHealthData());
}
