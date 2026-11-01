"use client";

import { useEffect, useState } from "react";
import { formatCompactCount } from "@/src/lib/formatCompactCount";
import { APK_DOWNLOAD_COUNT_EVENT } from "@/src/lib/apkDownloadCountClient";

type Props = {
  pageKey: string;
  initialCount: number;
  detailClassName: string;
  valueClassName: string;
  labelClassName: string;
  downloadValueClassName: string;
  downloadIconClassName: string;
};

/** Live APK download click count (updates after hero APK button clicks). */
export function ApkDownloadCountStat({
  pageKey,
  initialCount,
  detailClassName,
  valueClassName,
  labelClassName,
  downloadValueClassName,
  downloadIconClassName,
}: Props) {
  const [count, setCount] = useState(() => Math.max(0, Math.floor(initialCount)));

  useEffect(() => {
    setCount(Math.max(0, Math.floor(initialCount)));
  }, [initialCount]);

  useEffect(() => {
    const onCount = (event: Event) => {
      const detail = (event as CustomEvent<{ pageKey?: string; count?: number }>).detail;
      if (!detail || detail.pageKey !== pageKey) return;
      if (typeof detail.count === "number" && Number.isFinite(detail.count)) {
        setCount(Math.max(0, Math.floor(detail.count)));
        return;
      }
      setCount((prev) => prev + 1);
    };
    window.addEventListener(APK_DOWNLOAD_COUNT_EVENT, onCount);
    return () => window.removeEventListener(APK_DOWNLOAD_COUNT_EVENT, onCount);
  }, [pageKey]);

  return (
    <li className={detailClassName}>
      <span className={`${valueClassName} ${downloadValueClassName}`}>
        <i className={`fa-solid fa-download ${downloadIconClassName}`} aria-hidden />
        {formatCompactCount(count)}
      </span>
      <span className={labelClassName}>Download</span>
    </li>
  );
}
