import { listPublishedNews } from "@/src/server/repositories/newsRepository";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const page = Number(request.nextUrl.searchParams.get("page") ?? "1");
  const pageSize = Number(request.nextUrl.searchParams.get("pageSize") ?? "4");
  const result = await listPublishedNews(page, pageSize);

  return NextResponse.json({
    data: result.data,
    page,
    pageSize,
    total: result.total,
  });
}
