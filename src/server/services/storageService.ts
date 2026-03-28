type StorageConfig = {
  provider: "supabase" | "s3";
  baseUrl: string;
  bucket: string;
};

export function getStorageConfig(): StorageConfig {
  return {
    provider: (process.env.MEDIA_PROVIDER as "supabase" | "s3") ?? "supabase",
    baseUrl: process.env.MEDIA_CDN_BASE_URL ?? "",
    bucket: process.env.MEDIA_BUCKET ?? "bgmi-media",
  };
}

export function buildMediaUrl(filePath: string) {
  const config = getStorageConfig();
  if (!config.baseUrl) {
    return `/media/${filePath}`;
  }
  return `${config.baseUrl.replace(/\/$/, "")}/${filePath.replace(/^\//, "")}`;
}
