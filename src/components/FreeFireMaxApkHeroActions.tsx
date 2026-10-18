"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { ClientErrorBoundary } from "@/src/components/ClientErrorBoundary";
import { FfAdvanceServerCountdown } from "@/src/components/FfAdvanceServerCountdown";
import {
  isFreeFireMaxApkCountdownTicking,
  isFreeFireMaxApkHeroButtonPublic,
  type FreeFireMaxApkCountdown,
  type FreeFireMaxApkHeroButton,
} from "@/src/lib/freeFireMaxApkPage";

function HeroCtaLink({
  btn,
  className,
  icon,
}: {
  btn: FreeFireMaxApkHeroButton;
  className: string;
  icon: string;
}) {
  const href = btn.href.trim();
  const external = /^https?:\/\//i.test(href);
  const inner: ReactNode = (
    <>
      <i className={`fa-solid ${icon}`} aria-hidden />
      <span>{btn.label}</span>
    </>
  );
  if (external) {
    return (
      <a className={className} href={href} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    );
  }
  return (
    <Link className={className} href={href}>
      {inner}
    </Link>
  );
}

type Props = {
  countdown: FreeFireMaxApkCountdown;
  playStore: FreeFireMaxApkHeroButton;
  apk: FreeFireMaxApkHeroButton;
};

/**
 * While the update timer is actively counting, download CTAs stay hidden.
 * When the timer is off or the target time has passed, Play/APK buttons show
 * automatically (if Show + label + URL are set).
 */
export function FreeFireMaxApkHeroActions({ countdown, playStore, apk }: Props) {
  const showCountdown = Boolean(countdown.visible && countdown.targetIso.trim());
  const [ticking, setTicking] = useState(() => isFreeFireMaxApkCountdownTicking(countdown));

  useEffect(() => {
    const sync = () => setTicking(isFreeFireMaxApkCountdownTicking(countdown));
    sync();
    if (!showCountdown) return;
    const id = window.setInterval(sync, 1000);
    return () => window.clearInterval(id);
  }, [countdown, showCountdown]);

  const showPlay = !ticking && isFreeFireMaxApkHeroButtonPublic(playStore);
  const showApk = !ticking && isFreeFireMaxApkHeroButtonPublic(apk);

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
        <div className="ff-as-hero-btns" role="group" aria-label="Free Fire MAX download options">
          {showPlay ? (
            <HeroCtaLink btn={playStore} className="ff-as-apk-btn" icon="fa-store" />
          ) : null}
          {showApk ? (
            <HeroCtaLink
              btn={apk}
              className="ff-as-apk-btn ff-as-apk-btn--alt"
              icon="fa-download"
            />
          ) : null}
        </div>
      ) : null}
    </>
  );
}
