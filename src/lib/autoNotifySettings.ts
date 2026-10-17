export type AutoNotifySettings = {
  newsOnPublish: boolean;
  pagesOnPublish: boolean;
  /** Live redeem codes changed on FF / FF Max / BGMI Air / PUBG Flash. */
  redeemOnSave: boolean;
  /** Advance Server countdown / APK details changed. */
  advanceServerOnSave: boolean;
  /** Stylish name lists / name-page copy changed. */
  stylishNamesOnSave: boolean;
  /** BGMI Air APK countdown / launch details changed. */
  liteApkOnSave: boolean;
};

export const DEFAULT_AUTO_NOTIFY_SETTINGS: AutoNotifySettings = {
  newsOnPublish: false,
  pagesOnPublish: false,
  redeemOnSave: false,
  advanceServerOnSave: false,
  stylishNamesOnSave: false,
  liteApkOnSave: false,
};

export function parseAutoNotifySettings(raw: unknown): AutoNotifySettings {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_AUTO_NOTIFY_SETTINGS };
  const o = raw as Record<string, unknown>;
  return {
    newsOnPublish: o.newsOnPublish === true,
    pagesOnPublish: o.pagesOnPublish === true,
    redeemOnSave: o.redeemOnSave === true,
    advanceServerOnSave: o.advanceServerOnSave === true,
    stylishNamesOnSave: o.stylishNamesOnSave === true,
    liteApkOnSave: o.liteApkOnSave === true,
  };
}
