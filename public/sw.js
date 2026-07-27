/* Sensitivity Settings — web push service worker */
self.addEventListener("push", (event) => {
  let title = "Sensitivity Settings";
  let body = "You have a new update.";
  try {
    const data = event.data ? event.data.json() : null;
    if (data && typeof data === "object") {
      if (typeof data.title === "string" && data.title.trim()) title = data.title.trim();
      if (typeof data.body === "string" && data.body.trim()) body = data.body.trim();
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
      data: { url: "/" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target =
    event.notification.data && typeof event.notification.data.url === "string"
      ? event.notification.data.url
      : "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          client.navigate?.(target);
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(target);
    }),
  );
});
