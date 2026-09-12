"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { ClientErrorBoundary } from "@/src/components/ClientErrorBoundary";
import { FfAdvanceServerCountdown } from "@/src/components/FfAdvanceServerCountdown";
import {
  isBgmiApkCountdownTicking,
  isBgmiApkHeroButtonPublic,
  type BgmiApkCountdown,
  type BgmiApkHeroButton,
} from "@/src/lib/bgmiApkPage";

function HeroCtaLink({
  btn,
  className,
  icon,
}: {
  btn: BgmiApkHeroButton;
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
  countdown: BgmiApkCountdown;
  playStore: BgmiApkHeroButton;
  apk: BgmiApkHeroButton;
};

/**
 * While the update timer is actively counting, download CTAs stay hidden.
 * When the timer is off or the target time has passed, Play/APK buttons show
 * automatically (if Show + label + URL are set).
 */
export function BgmiApkHeroActions({ countdown, playStore, apk }: Props) {
  const showCountdown = Boolean(countdown.visible && countdown.targetIso.trim());
  const [ticking, setTicking] = useState(() => isBgmiApkCountdownTicking(countdown));

  useEffect(() => {
    const sync = () => setTicking(isBgmiApkCountdownTicking(countdown));
    sync();
    if (!showCountdown) return;
    const id = window.setInterval(sync, 1000);
    return () => window.clearInterval(id);
  }, [countdown, showCountdown]);

  const showPlay = !ticking && isBgmiApkHeroButtonPublic(playStore);
  const showApk = !ticking && isBgmiApkHeroButtonPublic(apk);

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
        <div className="ff-as-hero-btns" role="group" aria-label="BGMI download options">
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
