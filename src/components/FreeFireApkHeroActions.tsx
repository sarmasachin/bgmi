"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { ClientErrorBoundary } from "@/src/components/ClientErrorBoundary";
import { FfAdvanceServerCountdown } from "@/src/components/FfAdvanceServerCountdown";
import { trackApkDownloadClick } from "@/src/lib/apkDownloadCountClient";
import { isHostedApkFileHref } from "@/src/lib/apkHeroCta";
import {
  isFreeFireApkCountdownTicking,
  isFreeFireApkHeroButtonPublic,
  type FreeFireApkCountdown,
  type FreeFireApkHeroButton,
} from "@/src/lib/freeFireApkPage";

function HeroCtaLink({
  btn,
  className,
  icon,
  onNavigate,
}: {
  btn: FreeFireApkHeroButton;
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
      <a
        className={className}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onNavigate}
      >
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
  countdown: FreeFireApkCountdown;
  playStore: FreeFireApkHeroButton;
  apk: FreeFireApkHeroButton;
  groupLabel?: string;
  /** When set, APK button clicks increment this page’s download counter. */
  downloadCountPageKey?: string;
};

/**
 * While the update timer is actively counting, download CTAs stay hidden.
 * When the timer is off or the target time has passed, Play/APK buttons show
 * automatically (if Show + label + URL are set).
 */
export function FreeFireApkHeroActions({
  countdown,
  playStore,
  apk,
  groupLabel = "Free Fire download options",
  downloadCountPageKey,
}: Props) {
  const showCountdown = Boolean(countdown.visible && countdown.targetIso.trim());
  // Start false so SSR + first client paint match; sync after mount (avoids React #418).
  const [ticking, setTicking] = useState(false);

  useEffect(() => {
    const sync = () => setTicking(isFreeFireApkCountdownTicking(countdown));
    sync();
    if (!showCountdown) return;
    const id = window.setInterval(sync, 1000);
    return () => window.clearInterval(id);
  }, [countdown, showCountdown]);

  const showPlay = !ticking && isFreeFireApkHeroButtonPublic(playStore);
  const showApk = !ticking && isFreeFireApkHeroButtonPublic(apk);
  const onApkClick = downloadCountPageKey
    ? () => trackApkDownloadClick(downloadCountPageKey)
    : undefined;

  return (
    <>
      {showCountdown ? (
        <ClientErrorBoundary label="Update countdown">
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
