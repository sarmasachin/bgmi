import { listUploadedImages } from "@/src/server/media/localImageUpload";
import {
  getMediaImageOutputPreference,
  type MediaImageOutputPreference,
} from "@/src/server/repositories/mediaImageSettingsRepository";

export type AdminMediaPageData = {
  initialFiles: Awaited<ReturnType<typeof listUploadedImages>>;
  initialOutputPref: MediaImageOutputPreference;
};

export async function prefetchAdminMediaPageData(): Promise<AdminMediaPageData> {
  const [initialFiles, initialOutputPref] = await Promise.all([
    listUploadedImages(),
    getMediaImageOutputPreference(),
  ]);

  return { initialFiles, initialOutputPref };
}
