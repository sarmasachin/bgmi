export const APK_DOWNLOAD_COUNT_EVENT = "apk-download-count";

/** Fire-and-forget click track + notify live counter UI. */
export function trackApkDownloadClick(pageKey: string) {
  const key = pageKey.trim();
  if (!key || typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(APK_DOWNLOAD_COUNT_EVENT, { detail: { pageKey: key } }),
  );

  void fetch("/api/apk-download-count", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pageKey: key }),
    keepalive: true,
  })
    .then(async (res) => {
      if (!res.ok) return;
      const data = (await res.json()) as { count?: number };
      if (typeof data.count === "number") {
        window.dispatchEvent(
          new CustomEvent(APK_DOWNLOAD_COUNT_EVENT, {
            detail: { pageKey: key, count: data.count },
          }),
        );
      }
    })
    .catch(() => {
      /* ignore network errors — download should still proceed */
    });
}
