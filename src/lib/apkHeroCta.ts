/** Shared hero CTA helpers for APK pages (countdown → then Play/APK buttons). */

export type ApkHeroButton = {
  label: string;
  href: string;
  visible: boolean;
};

export type ApkHeroCountdown = {
  visible: boolean;
  label: string;
  targetIso: string;
  dateText: string;
  liveMessage: string;
};

/** Public page shows a hero CTA only when Show is on, label and URL are both set. */
export function isApkHeroButtonPublic(btn: ApkHeroButton): boolean {
  return btn.visible && Boolean(btn.label.trim()) && Boolean(btn.href.trim());
}

/** True while admin timer is on and the target time is still in the future. */
export function isApkCountdownTicking(
  countdown: Pick<ApkHeroCountdown, "visible" | "targetIso">,
  nowMs: number = Date.now(),
): boolean {
  if (!countdown.visible) return false;
  const target = countdown.targetIso.trim();
  if (!target) return false;
  const targetMs = Date.parse(target);
  return Number.isFinite(targetMs) && targetMs > nowMs;
}

/** Admin hint: why a button will / will not appear on the public APK page. */
export function apkHeroButtonPublicStatus(
  btn: ApkHeroButton,
  countdown: Pick<ApkHeroCountdown, "visible" | "targetIso"> | undefined,
  publicPath: string,
): { visible: boolean; message: string } {
  if (!btn.visible) {
    return { visible: false, message: "Public: HIDDEN — Show is off" };
  }
  if (!btn.label.trim()) {
    return { visible: false, message: "Public: HIDDEN — label is empty" };
  }
  if (!btn.href.trim()) {
    return {
      visible: false,
      message: "Public: HIDDEN — paste URL below (Show alone is not enough)",
    };
  }
  if (countdown && isApkCountdownTicking(countdown)) {
    return {
      visible: false,
      message: "Public: HIDDEN while timer is counting — shows automatically when timer ends/off",
    };
  }
  return { visible: true, message: `Public: VISIBLE on ${publicPath}` };
}
