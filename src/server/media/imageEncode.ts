import sharp from "sharp";
import type { ResolvedUploadFormat } from "@/src/server/repositories/mediaImageSettingsRepository";

const MAX_EDGE = 2400;

export async function transcodeImageBuffer(
  input: Buffer,
  target: ResolvedUploadFormat,
): Promise<{ buffer: Buffer; ext: string; contentType: string }> {
  if (target === "original") {
    return { buffer: input, ext: "", contentType: "" };
  }

  const pipeline = sharp(input).rotate().resize(MAX_EDGE, MAX_EDGE, {
    fit: "inside",
    withoutEnlargement: true,
  });

  if (target === "webp") {
    const buffer = await pipeline.webp({ quality: 85 }).toBuffer();
    return { buffer, ext: ".webp", contentType: "image/webp" };
  }
  if (target === "avif") {
    const buffer = await pipeline.avif({ quality: 70 }).toBuffer();
    return { buffer, ext: ".avif", contentType: "image/avif" };
  }
  const buffer = await pipeline.jpeg({ quality: 88, mozjpeg: true }).toBuffer();
  return { buffer, ext: ".jpg", contentType: "image/jpeg" };
}
