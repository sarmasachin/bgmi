import { getAutoNotifySettings } from "@/src/server/repositories/autoNotifySettingsRepository";
import { maybeSendPublishPush, type PublishPushSource } from "@/src/server/services/publishPushNotify";
import {
  advanceServerFingerprint,
  liteApkFingerprint,
  redeemLiveFingerprint,
  stylishNamesFingerprint,
} from "@/src/lib/autoNotifyFingerprints";

export type AutoNotifyPushResult = { pushSent: boolean; warning?: string };

async function sendIfEnabled(input: {
  enabled: boolean;
  changed: boolean;
  source: PublishPushSource;
  title: string;
  body: string;
  urlPath: string;
}): Promise<AutoNotifyPushResult> {
  if (!input.enabled || !input.changed) return { pushSent: false };
  const result = await maybeSendPublishPush({
    sendPush: true,
    source: input.source,
    title: input.title,
    body: input.body,
    urlPath: input.urlPath,
  });
  return { pushSent: result.sent, warning: result.warning };
}

export async function autoNotifyRedeemSave(input: {
  beforeCodes: unknown;
  afterCodes: unknown;
  title: string;
  urlPath: string;
  compared: boolean;
}): Promise<AutoNotifyPushResult> {
  if (!input.compared) return { pushSent: false };
  const settings = await getAutoNotifySettings();
  return sendIfEnabled({
    enabled: settings.redeemOnSave,
    changed: redeemLiveFingerprint(input.beforeCodes) !== redeemLiveFingerprint(input.afterCodes),
    source: "redeem",
    title: input.title.trim() || "New redeem codes",
    body: "Fresh redeem codes are live. Open the page to copy them.",
    urlPath: input.urlPath,
  });
}

export async function autoNotifyAdvanceServerSave(input: {
  beforePage: unknown;
  afterPage: unknown;
  title: string;
  urlPath: string;
  compared: boolean;
}): Promise<AutoNotifyPushResult> {
  if (!input.compared) return { pushSent: false };
  const settings = await getAutoNotifySettings();
  return sendIfEnabled({
    enabled: settings.advanceServerOnSave,
    changed: advanceServerFingerprint(input.beforePage) !== advanceServerFingerprint(input.afterPage),
    source: "advanceServer",
    title: input.title.trim() || "Advance Server update",
    body: "Advance Server details were updated. Tap to check the latest countdown.",
    urlPath: input.urlPath,
  });
}

export async function autoNotifyStylishNamesSave(input: {
  beforePage: unknown;
  afterPage: unknown;
  title: string;
  urlPath: string;
  compared: boolean;
}): Promise<AutoNotifyPushResult> {
  if (!input.compared) return { pushSent: false };
  const settings = await getAutoNotifySettings();
  return sendIfEnabled({
    enabled: settings.stylishNamesOnSave,
    changed: stylishNamesFingerprint(input.beforePage) !== stylishNamesFingerprint(input.afterPage),
    source: "stylishNames",
    title: input.title.trim() || "New stylish names",
    body: "Stylish name ideas were updated. Open the page to copy a fresh ID.",
    urlPath: input.urlPath,
  });
}

export async function autoNotifyLiteApkSave(input: {
  beforePage: unknown;
  afterPage: unknown;
  title: string;
  urlPath: string;
  compared: boolean;
}): Promise<AutoNotifyPushResult> {
  if (!input.compared) return { pushSent: false };
  const settings = await getAutoNotifySettings();
  return sendIfEnabled({
    enabled: settings.liteApkOnSave,
    changed: liteApkFingerprint(input.beforePage) !== liteApkFingerprint(input.afterPage),
    source: "liteApk",
    title: input.title.trim() || "Lite APK update",
    body: "Lite APK launch details were updated. Tap to see the countdown.",
    urlPath: input.urlPath,
  });
}
