"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { ClientErrorBoundary } from "@/src/components/ClientErrorBoundary";
import { FfAdvanceServerCountdown } from "@/src/components/FfAdvanceServerCountdown";
import { trackApkDownloadClick } from "@/src/lib/apkDownloadCountClient";
import {
  isApkCountdownTicking,
  isApkHeroButtonPublic,
  isHostedApkFileHref,
  type ApkHeroButton,
  type ApkHeroCountdown,
} from "@/src/lib/apkHeroCta";

function HeroCtaLink({
  btn,
  className,
  icon,
  onNavigate,
}: {
  btn: ApkHeroButton;
  className: string;
  icon: string;
  onNavigate?: () => void;
}) {
  const href = btn.href.trim();
  const external = /^https?:\/\//i.test(href);
  const hostedFile = isHostedApkFileHref(href);
  const inner: ReactNode = (
    <>
      <i className={`fa-solid ${icon}`} aria-hidden />
      <span>{btn.label}</span>
    </>
  );
  if (hostedFile) {
    return (
      <a className={className} href={href} download onClick={onNavigate}>
        {inner}
      </a>
    );
  }
  if (external) {
    return (
      <a className={className} href={href} target="_blank" rel="noopener noreferrer" onClick={onNavigate}>
        {inner}
      </a>
    );
  }
  return (
    <Link className={className} href={href} onClick={onNavigate}>
      {inner}
    </Link>
  );
}

type Props = {
  countdown: ApkHeroCountdown;
  playStore: ApkHeroButton;
  apk: ApkHeroButton;
  groupLabel: string;
  downloadCountPageKey?: string;
};

/**
 * While the timer is counting, download CTAs stay hidden.
 * When the timer is off or the target time has passed, Play/APK buttons show
 * (if Show + label + URL are set in admin).
 */
export function ApkHeroDownloadActions({
  countdown,
  playStore,
  apk,
  groupLabel,
  downloadCountPageKey,
}: Props) {
  const showCountdown = Boolean(countdown.visible && countdown.targetIso.trim());
  // Start false so SSR + first client paint match; sync after mount (avoids React #418).
  const [ticking, setTicking] = useState(false);

  useEffect(() => {
    const sync = () => setTicking(isApkCountdownTicking(countdown));
    sync();
    if (!showCountdown) return;
    const id = window.setInterval(sync, 1000);
    return () => window.clearInterval(id);
  }, [countdown, showCountdown]);

  const showPlay = !ticking && isApkHeroButtonPublic(playStore);
  const showApk = !ticking && isApkHeroButtonPublic(apk);
  const onApkClick = downloadCountPageKey
    ? () => trackApkDownloadClick(downloadCountPageKey)
    : undefined;

  return (
    <>
      {showCountdown ? (
        <ClientErrorBoundary label="Launch countdown">
          <FfAdvanceServerCountdown
            label={countdown.label}
            targetIso={countdown.targetIso}
            dateText={countdown.dateText}
            liveMessage={countdown.liveMessage}
          />
        </ClientErrorBoundary>
      ) : null}

      {showPlay || showApk ? (
        <div className="ff-as-hero-btns" role="group" aria-label={groupLabel}>
          {showPlay ? (
            <HeroCtaLink btn={playStore} className="ff-as-apk-btn" icon="fa-store" />
          ) : null}
          {showApk ? (
            <HeroCtaLink
              btn={apk}
              className="ff-as-apk-btn ff-as-apk-btn--alt"
              icon="fa-download"
              onNavigate={onApkClick}
            />
          ) : null}
        </div>
      ) : null}
    </>
  );
}
