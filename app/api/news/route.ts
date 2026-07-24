import { listPublishedNews } from "@/src/server/repositories/newsRepository";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/src/server/rateLimit";
import { getRequestIp } from "@/src/server/requestIp";

export async function GET(request: NextRequest) {
  const ip = getRequestIp(request);
  const rl = checkRateLimit(`news-list:${ip}`, 120, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const pageRaw = Number(request.nextUrl.searchParams.get("page") ?? "1");
  const pageSizeRaw = Number(request.nextUrl.searchParams.get("pageSize") ?? "4");
  const page = Number.isFinite(pageRaw) ? Math.min(Math.max(Math.trunc(pageRaw), 1), 500) : 1;
  const pageSize = Number.isFinite(pageSizeRaw) ? Math.min(Math.max(Math.trunc(pageSizeRaw), 1), 50) : 4;

  const result = await listPublishedNews(page, pageSize);

  return NextResponse.json({
    data: result.data,
    page,
    pageSize,
    total: result.total,
  });
}
