/* Sensitivity Settings — web push service worker */
/* Do not skipWaiting/clients.claim here — that reloads the open page on first subscribe. */

function normalizeClickUrl(raw) {
  var fallback = "/";
  if (typeof raw !== "string") return fallback;
  var value = raw.trim();
  if (!value || value.length > 500) return fallback;
  if (value.indexOf("\\") !== -1 || /\s/.test(value)) return fallback;
  if (value.indexOf("//") === 0) return fallback;
  if (value.charAt(0) === "/") {
    if (value.toLowerCase().indexOf("/javascript:") === 0) return fallback;
    return value;
  }
  if (value.indexOf("http://") === 0 || value.indexOf("https://") === 0) {
    try {
      return new URL(value).href;
    } catch (e) {
      return fallback;
    }
  }
  /* Allow "news/foo" without leading slash */
  if (/^[a-zA-Z0-9._~/-]+$/.test(value)) {
    return "/" + value.replace(/^\/+/, "");
  }
  return fallback;
}

function toAbsoluteUrl(target) {
  try {
    return new URL(target, self.location.origin).href;
  } catch (e) {
    return self.location.origin + "/";
  }
}

self.addEventListener("push", (event) => {
  let title = "Sensitivity Settings";
  let body = "You have a new update.";
  let url = "/";
  try {
    const data = event.data ? event.data.json() : null;
    if (data && typeof data === "object") {
      if (typeof data.title === "string" && data.title.trim()) title = data.title.trim();
      if (typeof data.body === "string" && data.body.trim()) body = data.body.trim();
      if (typeof data.url === "string") url = normalizeClickUrl(data.url);
    }
  } catch {
    try {
      const text = event.data ? event.data.text() : "";
      if (text) body = text;
    } catch {
      /* keep defaults */
    }
  }

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/icon.png",
      badge: "/icon.png",
      data: { url },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = toAbsoluteUrl(
    event.notification.data && typeof event.notification.data.url === "string"
      ? normalizeClickUrl(event.notification.data.url)
      : "/",
  );

  event.waitUntil(
    (async function openTarget() {
      const clientList = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      for (let i = 0; i < clientList.length; i += 1) {
        const client = clientList[i];
        if (!("focus" in client)) continue;
        try {
          await client.focus();
        } catch (e) {
          /* continue */
        }
        if (typeof client.navigate === "function") {
          try {
            await client.navigate(target);
            return;
          } catch (e) {
            /* fall through to openWindow */
          }
        }
        /* navigate missing/failed — open the link instead of staying on whatever tab was focused */
        if (self.clients.openWindow) {
          await self.clients.openWindow(target);
          return;
        }
      }

      if (self.clients.openWindow) {
        await self.clients.openWindow(target);
      }
    })(),
  );
});
