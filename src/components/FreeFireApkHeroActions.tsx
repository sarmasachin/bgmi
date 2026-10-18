"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { ClientErrorBoundary } from "@/src/components/ClientErrorBoundary";
import { FfAdvanceServerCountdown } from "@/src/components/FfAdvanceServerCountdown";
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
}: {
  btn: FreeFireApkHeroButton;
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
  countdown: FreeFireApkCountdown;
  playStore: FreeFireApkHeroButton;
  apk: FreeFireApkHeroButton;
};

/**
 * While the update timer is actively counting, download CTAs stay hidden.
 * When the timer is off or the target time has passed, Play/APK buttons show
 * automatically (if Show + label + URL are set).
 */
export function FreeFireApkHeroActions({ countdown, playStore, apk }: Props) {
  const showCountdown = Boolean(countdown.visible && countdown.targetIso.trim());
  const [ticking, setTicking] = useState(() => isFreeFireApkCountdownTicking(countdown));

  useEffect(() => {
    const sync = () => setTicking(isFreeFireApkCountdownTicking(countdown));
    sync();
    if (!showCountdown) return;
    const id = window.setInterval(sync, 1000);
    return () => window.clearInterval(id);
  }, [countdown, showCountdown]);

  const showPlay = !ticking && isFreeFireApkHeroButtonPublic(playStore);
  const showApk = !ticking && isFreeFireApkHeroButtonPublic(apk);

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
        <div className="ff-as-hero-btns" role="group" aria-label="Free Fire download options">
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
