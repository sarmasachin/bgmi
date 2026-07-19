import { NextResponse } from "next/server";
import { saveUploadedImage } from "@/src/server/media/localImageUpload";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Image file is required." }, { status: 400 });
  }

  try {
    const { url } = await saveUploadedImage(file);
    return NextResponse.json({ ok: true, url });
  } catch (e) {
    if (e instanceof Error && e.message === "INVALID_TYPE") {
      return NextResponse.json({ error: "Only jpg, png, webp, avif are allowed." }, { status: 400 });
    }
    if (e instanceof Error && e.message === "TOO_LARGE") {
      return NextResponse.json({ error: "Image must be 8MB or smaller." }, { status: 400 });
    }
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
