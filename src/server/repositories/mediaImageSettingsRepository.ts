import { prisma, tryPrisma } from "@/src/server/dbSafe";

const KEY = "settings:mediaImageOutput";

/** Which formats are enabled; server picks first by priority: webp > avif > jpeg. If none, keep original file. */
export type MediaImageOutputPreference = {
  webp: boolean;
  avif: boolean;
  jpeg: boolean;
};

const defaultPreference: MediaImageOutputPreference = {
  webp: true,
  avif: false,
  jpeg: false,
};

export async function getMediaImageOutputPreference(): Promise<MediaImageOutputPreference> {
  const row = await tryPrisma(() => prisma.siteSetting.findUnique({ where: { key: KEY } }));
  const v = row?.value as Partial<MediaImageOutputPreference> | null | undefined;
  if (!v || typeof v !== "object") {
    return { ...defaultPreference };
  }
  return {
    webp: Boolean(v.webp),
    avif: Boolean(v.avif),
    jpeg: Boolean(v.jpeg),
  };
}

export async function saveMediaImageOutputPreference(pref: MediaImageOutputPreference) {
  await tryPrisma(async () => {
    await prisma.siteSetting.upsert({
      where: { key: KEY },
      create: { key: KEY, value: pref as object },
      update: { value: pref as object },
    });
    return true;
  });
}

export type ResolvedUploadFormat = "webp" | "avif" | "jpeg" | "original";

export function resolveUploadFormat(pref: MediaImageOutputPreference): ResolvedUploadFormat {
  if (pref.webp) return "webp";
  if (pref.avif) return "avif";
  if (pref.jpeg) return "jpeg";
  return "original";
}
